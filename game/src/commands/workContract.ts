import {
  all,
  any,
  complement,
  equals,
  find,
  forEach,
  pathSatisfies,
  pipe,
  range,
  reduce,
  view,
  when,
  without,
} from 'ramda'
import { P, match } from 'ts-pattern'
import { payCost, getCost, withActivePlayer, isLayBrother, isPrior, activeLens, withPlayerIndex } from '../board/player'
import {
  LANDSCAPES,
  findBuildingWithoutOffset,
  moveClergyToNeutralBuilding,
  moveClergyToOwnBuilding,
} from '../board/landscape'
import { costMoney, parseResourceParam } from '../board/resource'
import {
  checkNotBonusRound,
  oncePerFrame,
  revertActivePlayerToCurrent,
  setFrameToAllowFreeUsage,
  withFrame,
} from '../board/frame'
import {
  BuildingEnum,
  Cost,
  Frame,
  GameCommandEnum,
  GameStatePlaying,
  NextUseClergy,
  SettlementRound,
  StateReducer,
  Tile,
} from '../types'
import { isSettlement } from '../board/buildings'

const workContractCost = (state: GameStatePlaying | undefined): number =>
  state?.frame?.settlementRound === SettlementRound.S ||
  state?.frame?.settlementRound === SettlementRound.A ||
  (state?.config?.players === 1 &&
    state?.frame?.settlementRound === SettlementRound.B &&
    state.frame.neutralBuildingPhase) ||
  state?.buildings.includes(BuildingEnum.WhiskeyDistillery) ||
  state?.buildings.includes(BuildingEnum.Winery)
    ? 1
    : 2

const checkWithPriorOnlyOnSinglePlayer =
  (withPrior: boolean): StateReducer =>
  (state) => {
    if (withPrior && state?.config.players !== 1) return undefined
    return state
  }

const checkWorkContractPayment =
  (payment: Cost): StateReducer =>
  (state) => {
    if (state === undefined) return undefined
    if (payment.whiskey ?? 0 > 1) return state
    if (payment.wine ?? 0 > 1) return state
    if (costMoney(payment) < workContractCost(state)) return undefined
    return state
  }

const transferActiveToOwnerOf =
  (building: BuildingEnum): StateReducer =>
  (state) => {
    if (state === undefined) return undefined
    if (state.config.players === 1) {
      return findBuildingWithoutOffset(building)(state.players[1].landscape) ? state : undefined
    }

    // this makes it so we dont look at the current player's landscape... prevent work contract on yourself
    const playerIndexes = without<number>([state.frame.activePlayerIndex], range(0, state.config.players))
    const foundWithPlayer = find(
      (i) => !!findBuildingWithoutOffset(building)(state.players[i].landscape),
      playerIndexes
    )
    if (foundWithPlayer === undefined) return undefined
    return withFrame((frame: Frame) => ({ ...frame, activePlayerIndex: foundWithPlayer }))(state)
  }

const checkModalPlayerBuildingUnoccupied =
  (building: BuildingEnum): StateReducer =>
  (state) => {
    const whichPlayer = state?.config?.players === 1 ? 1 : state?.frame.activePlayerIndex ?? 0
    return withPlayerIndex(whichPlayer)((player) => {
      const location = findBuildingWithoutOffset(building)(player.landscape)
      // should not actually ever get this
      if (location === undefined) return undefined
      const [row, col] = location
      const [, , clergy] = player.landscape[row][col]
      if (clergy !== undefined) return undefined
      return player
    })(state)
  }

const checkModalPlayerHasPriorOption =
  (building: BuildingEnum, withPrior: boolean): StateReducer =>
  (state) => {
    if (state === undefined) return undefined
    const { clergy } = state.players[state.config.players === 1 ? 1 : state.frame.activePlayerIndex]

    // if theyre trying to work contract someone with no people, stop it all right here
    if (clergy.length === 0) return undefined

    if (state.config.players === 1) {
      return pipe(
        //
        moveClergyToNeutralBuilding(building, withPrior),
        setFrameToAllowFreeUsage([building])
      )(state)
    }

    // if all of the the active player's clergy are all priors or all laybrothers, then the player has no choice here
    if (all(isPrior, clergy) || all(isLayBrother, clergy)) {
      return pipe(
        //
        moveClergyToOwnBuilding(building),
        setFrameToAllowFreeUsage([building]),
        revertActivePlayerToCurrent
      )(state)
    }

    // otherwise activePlayer stays on them, and lets leave usableBuildings as the building they need to look at
    return withFrame((frame) => ({ ...frame, usableBuildings: [building] }))(state)
  }

export const workContract = (building: BuildingEnum, paymentGift: string, withPrior: boolean = false): StateReducer => {
  const input = parseResourceParam(paymentGift)
  const { penny } = input
  return pipe(
    // Only allow if mainAction not consumed, and consume it
    (state) => {
      if (
        state?.frame.neutralBuildingPhase &&
        state?.buildings.length === 0 &&
        state?.frame?.nextUse === NextUseClergy.OnlyPrior
      )
        return state
      return oncePerFrame(GameCommandEnum.WORK_CONTRACT)(state)
    },

    // dont let someone send in WITH_PRIOR unless this is single player
    checkWithPriorOnlyOnSinglePlayer(withPrior),

    // <-- not in bonus round
    checkNotBonusRound,
    // <-- check to make sure payment is enough
    checkWorkContractPayment(input),
    // <-- consume payment
    withActivePlayer(payCost(input)),

    // <-> find that buildings owner, among all non-active players, and set activePlayer to them
    transferActiveToOwnerOf(building),

    // --> give the new active player all of the coins that were given
    when(pathSatisfies(complement(equals(1)), ['config', 'players']), withActivePlayer(getCost({ penny }))),

    checkModalPlayerBuildingUnoccupied(building),

    // --> either that player:
    //  ...doesnt have any clergy, then fail
    //  ...only has laybrothers, or a single prior, and thus no choice, so just make it for them
    //  ...has both a laybrother and a prior available, and thus must make a choice
    checkModalPlayerHasPriorOption(building, withPrior)
  )
}

export const complete =
  (state: GameStatePlaying) =>
  (partial: string[]): string[] =>
    match<string[], string[]>(partial)
      .with([], () => {
        if (
          !state.frame.bonusActions.includes(GameCommandEnum.WORK_CONTRACT) &&
          state.frame.mainActionUsed &&
          !(
            state.frame.neutralBuildingPhase === true &&
            state.buildings.length === 0 &&
            state.frame.nextUse === NextUseClergy.OnlyPrior &&
            any(isPrior, state?.players?.[1]?.clergy ?? [])
          )
        )
          return []
        const activePlayer = view(activeLens(state), state)
        if (checkNotBonusRound(state) === undefined) return []
        // if this player can't possibly pay the work contract fee
        if (checkWorkContractPayment(activePlayer)(state) === undefined) return []
        // if all other players have no clergy available
        if (
          all(
            (player) =>
              player === activePlayer ||
              //
              player.clergy.length === 0,
            state.players
          )
        )
          return []

        // no need to check if there are buildings to be used, each player has 3 heartland buildings
        return [GameCommandEnum.WORK_CONTRACT]
      })
      .with([GameCommandEnum.WORK_CONTRACT], () => {
        if (state.frame.neutralBuildingPhase) return state.frame.usableBuildings
        return reduce<number, BuildingEnum[]>(
          (accum: BuildingEnum[], i: number) => {
            if (state.frame.activePlayerIndex === i) return accum
            const player = state.players[i]
            if (player.clergy.length === 0) return accum
            forEach<Tile[]>(
              forEach((landStack: Tile) => {
                if (landStack.length === 0) return
                const [, erection, clergy] = landStack
                if (erection === undefined) return
                if (clergy !== undefined) return
                if (LANDSCAPES.includes(erection)) return
                if (isSettlement(erection)) return
                accum.push(erection as BuildingEnum)
              }),
              player.landscape
            )
            return accum
          },
          [] as BuildingEnum[],
          range(0, state.players.length)
        )
      })
      .with([GameCommandEnum.WORK_CONTRACT, P._], () => {
        const options = []
        const { whiskey = 0, wine = 0, penny = 0, nickel = 0 } = view(activeLens(state), state)
        if (wine) options.push('Wn')
        if (whiskey) options.push('Wh')
        if (workContractCost(state) === 1 && (penny >= 1 || nickel)) options.push('Pn')
        if (workContractCost(state) === 2 && (penny >= 2 || nickel)) options.push('PnPn')
        return options
      })
      .with([GameCommandEnum.WORK_CONTRACT, P._, P._], () => {
        if (
          state.config.players === 1 &&
          any(isPrior, state.players[1].clergy) &&
          any(isLayBrother, state.players[1].clergy)
        )
          return ['', 'WITH_PRIOR']
        return ['']
      })
      .with([GameCommandEnum.WORK_CONTRACT, P._, P._, 'WITH_PRIOR'], () => [''])
      .otherwise(() => [])

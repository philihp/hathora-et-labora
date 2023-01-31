import { match } from 'ts-pattern'
import { pipe } from 'ramda'
import { getCost, withActivePlayer } from '../board/player'
import { GameCommandFellTreesParams, GameStatePlaying, Tile, BuildingEnum, Tableau } from '../types'
import { take } from '../board/wheel'
import { consumeMainAction } from '../board/state'

const checkStateAllowsUse = (state: GameStatePlaying | undefined) => {
  return match(state)
    .with(undefined, () => undefined)
    .with({ mainActionUsed: false }, () => state)
    .with({ mainActionUsed: true }, () => undefined)
    .exhaustive()
}

const removeForestAt = (row: number, col: number) =>
  withActivePlayer((player) => {
    const tile = player.landscape?.[row]?.[col + 2]
    if (tile === undefined) return undefined
    const [land, building] = tile
    if (building !== BuildingEnum.Forest) return undefined
    return {
      ...player,
      landscape: [
        ...player.landscape.slice(0, row),
        [
          ...player.landscape[row].slice(0, col + 2),
          // the tile in question
          [land] as Tile,
          ...player.landscape[row].slice(col + 2 + 1),
        ],
        ...player.landscape.slice(row + 1),
      ],
    }
  })

export const givePlayerWood =
  (useJoker: boolean) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined => {
    if (state === undefined) return undefined
    const { joker, peat, pointingBefore } = state.rondel
    const amount = take(pointingBefore, (useJoker ? joker : peat) ?? pointingBefore, state.config)
    return withActivePlayer(getCost({ wood: amount }))(state)
  }

const updateWoodRondel =
  (useJoker: boolean) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined =>
    state && {
      ...state,
      rondel: {
        ...state.rondel,
        joker: useJoker ? state.rondel.pointingBefore : state.rondel.joker,
        wood: !useJoker ? state.rondel.pointingBefore : state.rondel.wood,
      },
    }

export const fellTrees = ({ row, col, useJoker }: GameCommandFellTreesParams) =>
  pipe(
    //
    checkStateAllowsUse,
    consumeMainAction,
    givePlayerWood(useJoker),
    removeForestAt(row, col),
    updateWoodRondel(useJoker)
  )

import { pipe } from 'ramda'
import { match } from 'ts-pattern'
import { costMoney } from '../board/resource'
import { subtractCoins, withActivePlayer } from '../board/player'
import { GameStatePlaying, GameCommandBuyDistrictParams, Tile, LandEnum, BuildingEnum } from '../types'

const payForDistrict = (state?: GameStatePlaying): GameStatePlaying | undefined => {
  if (state === undefined) return undefined
  if (state.districtPurchasePrices.length === 0) return undefined
  return withActivePlayer((player) => {
    // can this be cleaner?
    const playerMoney = costMoney(player)
    const nextDistrictCost = state.districtPurchasePrices[0]
    if (playerMoney < nextDistrictCost) return undefined
    return subtractCoins(nextDistrictCost)(player)
  })(state)
}

const removeDistrictFromPool = (state?: GameStatePlaying): GameStatePlaying | undefined => {
  if (state === undefined) return undefined
  return {
    ...state,
    districtPurchasePrices: state.districtPurchasePrices.slice(1),
  }
}

const denyBuyingAnyMoreLandscape = (state?: GameStatePlaying): GameStatePlaying | undefined => {
  if (state === undefined) return undefined
  return {
    ...state,
    canBuyLandscape: false,
  }
}

const newDistrict = (side: 'PLAINS' | 'HILLS'): Tile[] =>
  match(side)
    .with('HILLS', () => [
      [LandEnum.Plains, BuildingEnum.Peat] as Tile,
      [LandEnum.Plains, BuildingEnum.Forest] as Tile,
      [LandEnum.Plains, BuildingEnum.Forest] as Tile,
      [LandEnum.Hillside] as Tile,
      [LandEnum.Hillside] as Tile,
    ])
    .with('PLAINS', () => [
      [LandEnum.Plains, BuildingEnum.Forest] as Tile,
      [LandEnum.Plains] as Tile,
      [LandEnum.Plains] as Tile,
      [LandEnum.Plains] as Tile,
      [LandEnum.Hillside] as Tile,
    ])
    .exhaustive()

const addNewDistrict = (y: number, side: 'PLAINS' | 'HILLS') =>
  withActivePlayer((player) => {
    const oldLandscape = player.landscape
    const newLandscape = [newDistrict(side), ...oldLandscape]

    return {
      ...player,
      landscape: newLandscape,
    }
  })

export const buyDistrict =
  ({ side, y }: GameCommandBuyDistrictParams) =>
  (state: GameStatePlaying): GameStatePlaying | undefined => {
    return pipe(
      //
      payForDistrict,
      removeDistrictFromPool,
      denyBuyingAnyMoreLandscape,
      addNewDistrict(y, side)
    )(state)
  }

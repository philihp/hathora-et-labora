import { initialState } from '../../state'
import {
  BuildingEnum,
  GameStatePlaying,
  GameStatusEnum,
  NextUseClergy,
  PlayerColor,
  SettlementRound,
  Tableau,
  Tile,
} from '../../types'
import { complete, hospice } from '../hospice'

describe('buildings/hospice', () => {
  const p0: Tableau = {
    color: PlayerColor.Blue,
    clergy: [],
    settlements: [],
    landscape: [
      [[], [], ['P'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['P'], [], []],
      [[], [], ['P'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['P'], [], []],
    ] as Tile[][],
    wonders: 0,
    landscapeOffset: 0,
    peat: 0,
    penny: 0,
    clay: 0,
    wood: 0,
    grain: 0,
    sheep: 0,
    stone: 0,
    flour: 0,
    grape: 0,
    nickel: 0,
    malt: 0,
    coal: 10,
    book: 0,
    ceramic: 3,
    whiskey: 0,
    straw: 0,
    meat: 10,
    ornament: 0,
    bread: 0,
    wine: 0,
    beer: 0,
    reliquary: 0,
  }
  const s0: GameStatePlaying = {
    ...initialState,
    status: GameStatusEnum.PLAYING,
    frame: {
      round: 1,
      next: 1,
      startingPlayer: 1,
      settlementRound: SettlementRound.S,
      currentPlayerIndex: 0,
      activePlayerIndex: 0,
      neutralBuildingPhase: false,
      bonusRoundPlacement: false,
      mainActionUsed: false,
      bonusActions: [],
      canBuyLandscape: true,
      unusableBuildings: [],
      usableBuildings: [],
      nextUse: NextUseClergy.Any,
    },
    config: {
      country: 'france',
      players: 3,
      length: 'long',
    },
    rondel: {
      pointingBefore: 3,
      grape: 1,
      joker: 2,
    },
    wonders: 0,
    players: [{ ...p0 }, { ...p0 }, { ...p0 }],
    buildings: ['F27', 'G28', 'F29', 'F30'] as BuildingEnum[],
    plotPurchasePrices: [1, 1, 1, 1, 1, 1],
    districtPurchasePrices: [],
  }
  describe('hospice', () => {
    it('retains undefined state', () => {
      const s1 = hospice()(undefined)!
      expect(s1).toBeUndefined()
    })

    it('adds usable buildings and makes next use free', () => {
      const s1 = hospice()(s0)!
      expect(s1.frame).toMatchObject({
        nextUse: 'free',
        usableBuildings: ['F27', 'G28', 'F29', 'F30'],
      })
    })
  })

  describe('complete', () => {
    it('takes no parameters', () => {
      const c0 = complete([])(s0)
      expect(c0).toStrictEqual([''])
    })
    it('does not complete anything with a param', () => {
      const c0 = complete([''])(s0)
      expect(c0).toStrictEqual([])
    })
  })
})

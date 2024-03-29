import { initialState } from '../../state'
import {
  GameStatePlaying,
  GameStatusEnum,
  NextUseClergy,
  PlayerColor,
  SettlementRound,
  Tableau,
  Tile,
} from '../../types'
import { coalHarbor, complete } from '../coalHarbor'

describe('buildings/coalHarbor', () => {
  const p0: Tableau = {
    color: PlayerColor.Blue,
    clergy: [],
    settlements: [],
    landscape: [
      [[], [], ['P'], ['P'], ['P'], ['P'], ['P'], [], []],
      [[], [], ['P'], ['P'], ['P'], ['P'], ['P'], [], []],
    ] as Tile[][],
    wonders: 0,
    landscapeOffset: 0,
    peat: 10,
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
    coal: 0,
    book: 0,
    ceramic: 0,
    whiskey: 0,
    straw: 0,
    meat: 0,
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
      pointingBefore: 0,
    },
    wonders: 0,
    players: [{ ...p0 }, { ...p0 }, { ...p0 }],
    buildings: [],
    plotPurchasePrices: [1, 1, 1, 1, 1, 1],
    districtPurchasePrices: [],
  }

  describe('coalHarbor', () => {
    it('goes through a happy path', () => {
      const s1 = coalHarbor('PtPtPt')(s0)!
      expect(s1.players[0]).toMatchObject({
        peat: 7,
        whiskey: 3,
        nickel: 1,
        penny: 4,
      })
    })
    it('retains undefined state', () => {
      const s3 = coalHarbor('PtPtPt')(undefined)
      expect(s3).toBeUndefined()
    })
    it('noop with no input', () => {
      const s1 = coalHarbor()(s0)!
      expect(s1).toBe(s0)
    })
    it('noop with empty input', () => {
      const s1 = coalHarbor('')(s0)!
      expect(s1).toBe(s0)
    })
    it('can consume partially', () => {
      const s1 = coalHarbor('Pt')(s0)!
      expect(s1.players[0]).toMatchObject({
        peat: 9,
        whiskey: 1,
        nickel: 0,
        penny: 3,
      })
    })
  })

  describe('complete', () => {
    it('suggets noop if player has none', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            coal: 0,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([], s1)
      expect(c0).toStrictEqual([''])
    })
    it('suggests up to 2 coal if player has 2', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            coal: 2,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([], s1)
      expect(c0).toStrictEqual(['CoCo', 'Co', ''])
    })
    it('suggets up to three coal if player has unlimited', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            coal: 100,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([], s1)
      expect(c0).toStrictEqual(['CoCoCo', 'CoCo', 'Co', ''])
    })
    it('suggets finish command if one param', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            coal: 1,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete(['Co'], s1)
      expect(c0).toStrictEqual([''])
    })
    it('suggests nothing if more than one param', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            coal: 2,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete(['Co', 'Co'], s1)
      expect(c0).toStrictEqual([])
    })
  })
})

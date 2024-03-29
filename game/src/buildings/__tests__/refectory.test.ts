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
import { refectory, complete } from '../refectory'

describe('buildings/refectory', () => {
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
    coal: 0,
    book: 0,
    ceramic: 0,
    whiskey: 0,
    straw: 0,
    meat: 3,
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

  describe('refectory', () => {
    it('allows noop with undefined still gives beer and meat', () => {
      const s1 = refectory()(s0)!
      expect(s1.players[0]).toMatchObject({
        beer: 1,
        meat: 4,
      })
    })

    it('allows noop with empty string', () => {
      const s1 = refectory('')(s0)!
      expect(s1.players[0]).toMatchObject({
        beer: 1,
        meat: 4,
      })
    })

    it('retains undefined state', () => {
      const s1 = refectory('MtMtMtMt')(undefined)!
      expect(s1).toBeUndefined()
    })

    it('can spend meat as it is acquired', () => {
      const s1 = refectory('MtMtMtMt')(s0)!
      expect(s1.players[0]).toMatchObject({
        beer: 1,
        meat: 0,
        ceramic: 4,
      })
    })

    it('can underspend meat', () => {
      const s1 = refectory('MtMtMtMt')(s0)!
      expect(s1.players[0]).toMatchObject({
        beer: 1,
        meat: 0,
        ceramic: 4,
      })
    })
  })

  describe('complete', () => {
    it('suggets one meat if player has none', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            meat: 0,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([], s1)
      expect(c0).toStrictEqual(['Mt', ''])
    })
    it('suggets up to three meat if player has 2', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            meat: 2,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([], s1)
      expect(c0).toStrictEqual(['MtMtMt', 'MtMt', 'Mt', ''])
    })
    it('suggets up to four meat if player has unlimited', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            meat: 100,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([], s1)
      expect(c0).toStrictEqual(['MtMtMtMt', 'MtMtMt', 'MtMt', 'Mt', ''])
    })
    it('suggets finish command if one param', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            meat: 1,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete(['Mt'], s1)
      expect(c0).toStrictEqual([''])
    })
    it('suggests nothing if more than one param', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            meat: 2,
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete(['Mt', 'Mt'], s1)
      expect(c0).toStrictEqual([])
    })
  })
})

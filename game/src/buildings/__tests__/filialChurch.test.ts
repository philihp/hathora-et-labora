import { createPcg32 } from 'fn-pcg'
import {
  GameStatePlaying,
  GameStatusEnum,
  NextUseClergy,
  PlayerColor,
  SettlementRound,
  Tableau,
  Tile,
} from '../../types'
import { filialChurch, complete } from '../filialChurch'

describe('buildings/filialChurch', () => {
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
    meat: 0,
    ornament: 0,
    bread: 0,
    wine: 0,
    beer: 0,
    reliquary: 0,
  }
  const s0: GameStatePlaying = {
    randGen: createPcg32({}, 42, 56),
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
    wonders: 8,
    players: [
      {
        ...p0,
        peat: 1,
        penny: 1,
        clay: 1,
        wood: 1,
        grain: 1,
        sheep: 1,
        stone: 1,
        flour: 1,
        grape: 1,
        coal: 1,
        book: 1,
        ceramic: 1,
        straw: 1,
        reliquary: 0,
      },
      { ...p0 },
      { ...p0 },
    ],
    buildings: [],
    plotPurchasePrices: [1, 1, 1, 1, 1, 1],
    districtPurchasePrices: [],
  }

  describe('filialChurch', () => {
    it('retains undefined state', () => {
      const s0 = filialChurch()(undefined)
      expect(s0).toBeUndefined()
    })
    it('noop with less than 5 things', () => {
      const s1 = filialChurch('PtPn')(s0)!
      expect(s1).toBe(s0)
    })
    it('noop with no params', () => {
      const s1 = filialChurch()(s0)!
      expect(s1).toBe(s0)
    })
    it('baseline happy path', () => {
      const s1 = filialChurch('PtPnClWoGn')(s0)!
      expect(s1.players[0]).toMatchObject({
        peat: 0,
        penny: 0,
        clay: 0,
        wood: 0,
        grain: 0,
        sheep: 1,
        stone: 1,
        flour: 1,
        grape: 1,
        coal: 1,
        book: 1,
        ceramic: 1,
        straw: 1,
        reliquary: 1,
      })
    })
  })

  describe('complete', () => {
    it('allows noop when < 5 different things', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            peat: 1,
            penny: 2,
            clay: 3,
            wood: 4,
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
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([])(s1)
      expect(c0).toStrictEqual([''])
    })
    it('gives option for 5 different things', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            peat: 1,
            penny: 2,
            clay: 3,
            wood: 4,
            grain: 5,
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
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([])(s1)
      expect(c0).toStrictEqual(['PtPnGnClWo', ''])
    })
    it('gives multiple options for 6 different things', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            peat: 1,
            penny: 2,
            clay: 3,
            wood: 4,
            grain: 5,
            sheep: 6,
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
          },
          s0.players.slice(1),
        ],
      } as GameStatePlaying
      const c0 = complete([])(s1)
      expect(c0).toStrictEqual([
        //
        'PtPnGnClWo',
        'PtPnGnClSh',
        'PtPnGnWoSh',
        'PtPnClWoSh',
        'PtGnClWoSh',
        'PnGnClWoSh',
        '',
      ])
    })
  })
})

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
import { complete, granary } from '../granary'

describe('buildings/granary', () => {
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
    peat: 0,
    penny: 4,
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
  describe('granary', () => {
    it('allows a noop', () => {
      const s1 = granary('')(s0)!
      expect(s1.players[0]).toMatchObject({
        penny: 4,
        grain: 0,
        book: 0,
      })
    })
    it('allows a with nothing', () => {
      const s1 = granary()(s0)!
      expect(s1.players[0]).toMatchObject({
        penny: 4,
        grain: 0,
        book: 0,
      })
    })
    it('goes through a happy path', () => {
      const s1 = granary('Pn')(s0)!
      expect(s1.players[0]).toMatchObject({
        penny: 3,
        grain: 4,
        book: 1,
      })
    })
  })

  describe('complete', () => {
    it('allows for sending penny or nothing, if player has a penny', () => {
      const c0 = complete([])(s0)
      expect(c0).toStrictEqual(['Pn', ''])
    })
    it('still allows noop if player has no penny', () => {
      const s1 = {
        ...s0,
        players: [
          {
            ...s0.players[0],
            penny: 0,
          },
          ...s0.players.slice(1),
        ],
      }
      const c0 = complete([])(s1)
      expect(c0).toStrictEqual([''])
    })
    it('completes the command if we have a param', () => {
      const c0 = complete(['Pn'])(s0)
      expect(c0).toStrictEqual([''])
    })
    it('returns empty completion if weirdness', () => {
      const c0 = complete(['Pn', 'Gn'])(s0)
      expect(c0).toStrictEqual([])
    })
  })
})

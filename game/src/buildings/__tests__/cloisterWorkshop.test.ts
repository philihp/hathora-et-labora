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
import { cloisterWorkshop } from '../cloisterWorkshop'

describe('buildings/cloisterWorkshop', () => {
  describe('cloisterWorkshop', () => {
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
      clay: 10,
      wood: 0,
      grain: 0,
      sheep: 0,
      stone: 10,
      flour: 0,
      grape: 0,
      nickel: 0,
      hops: 0,
      coal: 10,
      book: 0,
      pottery: 0,
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
      frame: {
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
    }

    it('allows noop with null', () => {
      const s1 = cloisterWorkshop()(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        pottery: 0,
        ornament: 0,
        clay: 10,
        stone: 10,
        coal: 10,
      })
    })

    it('allows noop with empty string', () => {
      const s1 = cloisterWorkshop('')(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        pottery: 0,
        ornament: 0,
        clay: 10,
        stone: 10,
        coal: 10,
      })
    })

    it('plenty of coal, make three pottery and 1 ornament', () => {
      const s1 = cloisterWorkshop('ClClClSnCoCoCoCo')(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        pottery: 3,
        ornament: 1,
        clay: 7,
        stone: 9,
        coal: 6,
      })
    })

    it('when abundant clay/stone, prefer to make an ornament', () => {
      const s1 = cloisterWorkshop('ClClClSnCo')(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        pottery: 2,
        ornament: 1,
        clay: 7, // but still everything it is given is consumed
        stone: 9,
        coal: 9,
      })
    })

    it('eats all the energy', () => {
      const s1 = cloisterWorkshop('CoSn')(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        pottery: 0,
        ornament: 1,
        clay: 10,
        stone: 9,
        coal: 9,
      })
    })

    it('can be used for only pottery', () => {
      const s1 = cloisterWorkshop('CoClCl')(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        pottery: 2,
        ornament: 0,
        clay: 8,
        stone: 10,
        coal: 9,
      })
    })
  })
})

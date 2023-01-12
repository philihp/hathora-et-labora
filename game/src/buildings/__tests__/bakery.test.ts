import { config } from '../../commands/config'
import { start } from '../../commands/start'
import { initialState } from '../../reducer'
import { GameStatePlaying, PlayerColor } from '../../types'
import { bakery } from '../bakery'

describe('buildings/bakery', () => {
  describe('use', () => {
    it('bakes bread using wood, then converts to coins', () => {
      expect.assertions(3)
      const s0 = initialState
      const s1 = config(s0, { country: 'france', length: 'short', players: 3 })!
      const s2 = start(s1, { colors: [PlayerColor.Red, PlayerColor.Blue, PlayerColor.Green], seed: 42 })!
      const s3 = {
        ...s2,
        players: [
          {
            ...s2.players[0],
            flour: 2,
          },
          s2.players.slice(1),
        ],
      } as GameStatePlaying
      expect(s3.activePlayerIndex).toBe(0)
      expect(s3.players[0]).toMatchObject({
        flour: 2,
        wood: 1,
        bread: 0,
        nickel: 0,
        penny: 1,
      })
      const s4 = bakery('WoFlFlBrBr')(s3)!
      expect(s4.players[0]).toMatchObject({
        flour: 0,
        wood: 0,
        bread: 0,
        nickel: 1,
        penny: 4,
      })
    })
    it('bakes bread using wood with partial coin conversion', () => {
      expect.assertions(3)
      const s0 = initialState
      const s1 = config(s0, { country: 'france', length: 'short', players: 3 })!
      const s2 = start(s1, { colors: [PlayerColor.Red, PlayerColor.Blue, PlayerColor.Green], seed: 42 })!
      const s3 = {
        ...s2,
        players: [
          {
            ...s2.players[0],
            flour: 2,
          },
          s2.players.slice(1),
        ],
      } as GameStatePlaying
      expect(s3.activePlayerIndex).toBe(0)
      expect(s3.players[0]).toMatchObject({
        flour: 2,
        wood: 1,
        bread: 0,
        nickel: 0,
        penny: 1,
      })
      const s4 = bakery('WoFlFlBr')(s3)!
      expect(s4.players[0]).toMatchObject({
        flour: 0,
        wood: 0,
        bread: 1,
        nickel: 0,
        penny: 5,
      })
    })
    it('bakes bread using wood with no coin conversion', () => {
      expect.assertions(3)
      const s0 = initialState
      const s1 = config(s0, { country: 'france', length: 'short', players: 3 })!
      const s2 = start(s1, { colors: [PlayerColor.Red, PlayerColor.Blue, PlayerColor.Green], seed: 42 })!
      const s3 = {
        ...s2,
        players: [
          {
            ...s2.players[0],
            flour: 2,
          },
          s2.players.slice(1),
        ],
      } as GameStatePlaying
      expect(s3.activePlayerIndex).toBe(0)
      expect(s3.players[0]).toMatchObject({
        flour: 2,
        wood: 1,
        bread: 0,
        nickel: 0,
        penny: 1,
      })
      const s4 = bakery('WoFlFl')(s3)!
      expect(s4.players[0]).toMatchObject({
        flour: 0,
        wood: 0,
        bread: 2,
        nickel: 0,
        penny: 1,
      })
    })
    it('baking bread with wood, rounds down on half usage', () => {
      expect.assertions(3)
      const s0 = initialState
      const s1 = config(s0, { country: 'france', length: 'short', players: 3 })!
      const s2 = start(s1, { colors: [PlayerColor.Red, PlayerColor.Blue, PlayerColor.Green], seed: 42 })!
      const s3 = {
        ...s2,
        players: [
          {
            ...s2.players[0],
            flour: 2,
          },
          s2.players.slice(1),
        ],
      } as GameStatePlaying
      expect(s3.activePlayerIndex).toBe(0)
      expect(s3.players[0]).toMatchObject({
        flour: 2,
        wood: 1,
        bread: 0,
        nickel: 0,
        penny: 1,
      })
      const s4 = bakery('WoFl')(s3)!
      expect(s4.players[0]).toMatchObject({
        flour: 1,
        wood: 0,
        bread: 1,
        nickel: 0,
        penny: 1,
      })
    })
    it('allows using just to sell bread without baking', () => {
      expect.assertions(3)
      const s0 = initialState
      const s1 = config(s0, { country: 'france', length: 'short', players: 3 })!
      const s2 = start(s1, { colors: [PlayerColor.Red, PlayerColor.Blue, PlayerColor.Green], seed: 42 })!
      const s3 = {
        ...s2,
        players: [
          {
            ...s2.players[0],
            bread: 2,
          },
          s2.players.slice(1),
        ],
      } as GameStatePlaying
      expect(s3.activePlayerIndex).toBe(0)
      expect(s3.players[0]).toMatchObject({
        bread: 2,
        nickel: 0,
        penny: 1,
      })
      const s4 = bakery('BrBr')(s3)!
      expect(s4.players[0]).toMatchObject({
        bread: 0,
        nickel: 1,
        penny: 4,
      })
    })
    it('can bake one bread, but sell two if already had one', () => {
      expect.assertions(3)
      const s0 = initialState
      const s1 = config(s0, { country: 'france', length: 'short', players: 3 })!
      const s2 = start(s1, { colors: [PlayerColor.Red, PlayerColor.Blue, PlayerColor.Green], seed: 42 })!
      const s3 = {
        ...s2,
        players: [
          {
            ...s2.players[0],
            flour: 1,
            bread: 1,
          },
          s2.players.slice(1),
        ],
      } as GameStatePlaying
      expect(s3.activePlayerIndex).toBe(0)
      expect(s3.players[0]).toMatchObject({
        flour: 1,
        wood: 1,
        bread: 1,
        nickel: 0,
        penny: 1,
      })
      const s4 = bakery('WoFlBrBr')(s3)!
      expect(s4.players[0]).toMatchObject({
        flour: 0,
        wood: 0,
        bread: 0,
        nickel: 1,
        penny: 4,
      })
    })
    it('does not allow selling bread you dont have and arent making', () => {
      expect.assertions(3)
      const s0 = initialState
      const s1 = config(s0, { country: 'france', length: 'short', players: 3 })!
      const s2 = start(s1, { colors: [PlayerColor.Red, PlayerColor.Blue, PlayerColor.Green], seed: 42 })!
      const s3 = {
        ...s2,
        players: [
          {
            ...s2.players[0],
            flour: 1,
            wood: 1,
            bread: 1,
            penny: 0,
          },
          s2.players.slice(1),
        ],
      } as GameStatePlaying
      expect(s3.activePlayerIndex).toBe(0)
      expect(s3.players[0]).toMatchObject({
        flour: 1,
        wood: 1,
        bread: 1,
        nickel: 0,
        penny: 0,
      })
      const s4 = bakery('BrBr')(s3)!
      expect(s4).toBeUndefined()
    })
  })
})

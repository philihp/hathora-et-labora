import { costEnergy, parseResourceParam } from '../resource'
import { take } from '../wheel'

describe('board/resource', () => {
  describe('parseResourceParam', () => {
    it('parses a string of only one thing', () => {
      const res = 'Cl'
      expect(parseResourceParam(res)).toMatchObject({
        clay: 1,
      })
    })
    it('parses a string of stuff', () => {
      const res = 'WoWoPtGnGn'
      expect(parseResourceParam(res)).toMatchObject({
        wood: 2,
        peat: 1,
        grain: 2,
      })
    })
    it('ignores a joker, if present', () => {
      const res = 'RqJoSn'
      expect(parseResourceParam(res)).toMatchObject({
        reliquary: 1,
        stone: 1,
      })
    })
    it('handles an empty string', () => {
      const res = ''
      expect(parseResourceParam(res)).toMatchObject({})
    })
  })

  describe('costEnergy', () => {
    it('looks at coal', () => {
      expect(costEnergy({ coal: 4 })).toBe(12)
    })
    it('looks at peat', () => {
      expect(costEnergy({ peat: 4 })).toBe(8)
    })
    it('looks at wood', () => {
      expect(costEnergy({ wood: 4 })).toBe(4)
    })
    it('looks at straw', () => {
      expect(costEnergy({ straw: 5 })).toBe(2.5)
    })
    it('combines items', () => {
      expect(costEnergy({ coal: 1, peat: 1, wood: 1, straw: 1 })).toBe(6.5)
    })
  })
})

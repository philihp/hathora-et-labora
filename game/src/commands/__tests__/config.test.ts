import { initialState } from '../../state'
import { GameStatusEnum } from '../../types'
import { config } from '../config'

describe('commands/config', () => {
  describe('config', () => {
    it('can config from setup', () => {
      expect.assertions(2)
      const s1 = config({ players: 4, country: 'ireland', length: 'short' })({
        ...initialState,
        status: GameStatusEnum.SETUP,
      })!
      expect(s1.config?.players).toBe(4)
      expect(s1.rondel).toBeDefined()
    })
  })
})

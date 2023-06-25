import { control } from '../../../control'
import { GameCommandConfigParams, GameStatePlaying, PlayerColor } from '../../../types'

describe('board/frame/nextFrameSolo', () => {
  it('gives a nice flow', () => {
    const c1 = {
      players: 1,
    } as GameCommandConfigParams
    const s1 = {
      config: c1,
      players: [{ color: PlayerColor.Red }],
      frame: {
        round: 1,
        next: 2,
        activePlayerIndex: 0,
      },
    } as GameStatePlaying
    const s2 = control(s1, ['CONVERT'], 0)
    expect(s2.flow.map(({ round, player, bonus, settle }) => [round, player, bonus, settle])).toStrictEqual([
      [1, 'R', false, false],
      [1, 'R', false, false],
      [2, 'R', false, false],
      [2, 'R', false, false],
      [3, 'R', false, false],
      [3, 'R', false, false],
      [4, 'R', false, false],
      [4, 'R', false, false],
      [5, 'R', false, false],
      [5, 'R', false, false],
      [6, 'R', false, false],
      [6, 'R', false, false],
      [7, 'R', false, false],
      [7, 'R', false, false],
      [8, 'R', false, false],
      [8, 'R', false, false],
      [9, 'R', false, false],
      [9, 'R', false, false],
      [10, 'R', false, false],
      [10, 'R', false, false],
      [11, 'R', false, false],
      [11, 'R', false, false],
      [11, 'R', false, true],
      [12, 'R', false, false],
      [12, 'R', false, false],
      [13, 'R', false, false],
      [13, 'R', false, false],
      [14, 'R', false, false],
      [14, 'R', false, false],
      [15, 'R', false, false],
      [15, 'R', false, false],
      [15, 'R', false, true],
      [16, 'R', false, false],
      [16, 'R', false, false],
      [17, 'R', false, false],
      [17, 'R', false, false],
      [18, 'R', false, false],
      [18, 'R', false, false],
      [19, 'R', false, false],
      [19, 'R', false, false],
      [20, 'R', false, false],
      [20, 'R', false, false],
      [21, 'R', false, false],
      [21, 'R', false, false],
      [21, 'R', false, true],
      [22, 'R', false, false],
      [22, 'R', false, false],
      [23, 'R', false, false],
      [23, 'R', false, false],
      [24, 'R', false, false],
      [24, 'R', false, false],
      [24, 'R', false, true],
      [25, 'R', false, false],
      [25, 'R', false, false],
      [26, 'R', false, false],
      [26, 'R', false, false],
      [27, 'R', false, false],
      [27, 'R', false, false],
      [28, 'R', false, false],
      [28, 'R', false, false],
      [29, 'R', false, false],
      [29, 'R', false, false],
      [30, 'R', false, false],
      [30, 'R', false, false],
    ])
  })
})

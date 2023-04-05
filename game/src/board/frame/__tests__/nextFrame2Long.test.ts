import { control } from '../../../control'
import { GameCommandConfigParams, GameStatePlaying, PlayerColor } from '../../../types'

describe('board/frame/nextFrame2Long', () => {
  it('gives a nice flow', () => {
    const c1 = {
      players: 2,
      length: 'long',
    } as GameCommandConfigParams
    const s1 = {
      config: c1,
      players: [{ color: PlayerColor.Red }, { color: PlayerColor.Blue }],
      frame: {
        round: 1,
        next: 2,
        activePlayerIndex: 0,
      },
    } as GameStatePlaying
    const s2 = control(s1, ['CONVERT'], 0)
    expect(
      s2.flow.map(({ round, player, bonus, settle }) => [round, player, bonus, settle]).slice(0, 89)
    ).toStrictEqual([
      [1, 'R', false, false],
      [1, 'R', false, false],
      [1, 'B', false, false],
      [2, 'B', false, false],
      [2, 'B', false, false],
      [2, 'R', false, false],
      [3, 'R', false, false],
      [3, 'R', false, false],
      [3, 'B', false, false],
      [4, 'B', false, false],
      [4, 'B', false, false],
      [4, 'R', false, false],
      [5, 'R', false, false],
      [5, 'R', false, false],
      [5, 'B', false, false],
      [6, 'B', false, false],
      [6, 'B', false, false],
      [6, 'R', false, false],
      [6, 'R', false, true],
      [6, 'B', false, true],
      [7, 'R', false, false],
      [7, 'R', false, false],
      [7, 'B', false, false],
      [8, 'B', false, false],
      [8, 'B', false, false],
      [8, 'R', false, false],
      [9, 'R', false, false],
      [9, 'R', false, false],
      [9, 'B', false, false],
      [10, 'B', false, false],
      [10, 'B', false, false],
      [10, 'R', false, false],
      [11, 'R', false, false],
      [11, 'R', false, false],
      [11, 'B', false, false],
      [12, 'B', false, false],
      [12, 'B', false, false],
      [12, 'R', false, false],
      [13, 'R', false, false],
      [13, 'R', false, false],
      [13, 'B', false, false],
      [13, 'B', false, true],
      [13, 'R', false, true],
      [14, 'B', false, false],
      [14, 'B', false, false],
      [14, 'R', false, false],
      [15, 'R', false, false],
      [15, 'R', false, false],
      [15, 'B', false, false],
      [16, 'B', false, false],
      [16, 'B', false, false],
      [16, 'R', false, false],
      [17, 'R', false, false],
      [17, 'R', false, false],
      [17, 'B', false, false],
      [18, 'B', false, false],
      [18, 'B', false, false],
      [18, 'R', false, false],
      [19, 'R', false, false],
      [19, 'R', false, false],
      [19, 'B', false, false],
      [20, 'B', false, false],
      [20, 'B', false, false],
      [20, 'R', false, false],
      [20, 'R', false, true],
      [20, 'B', false, true],
      [21, 'R', false, false],
      [21, 'R', false, false],
      [21, 'B', false, false],
      [22, 'B', false, false],
      [22, 'B', false, false],
      [22, 'R', false, false],
      [23, 'R', false, false],
      [23, 'R', false, false],
      [23, 'B', false, false],
      [24, 'B', false, false],
      [24, 'B', false, false],
      [24, 'R', false, false],
      [25, 'R', false, false],
      [25, 'R', false, false],
      [25, 'B', false, false],
      [26, 'B', false, false],
      [26, 'B', false, false],
      [26, 'R', false, false],
      [27, 'R', false, false],
      [27, 'R', false, false],
      [27, 'B', false, false],
      [27, 'B', false, true],
      [27, 'R', false, true],
    ])
  })
})

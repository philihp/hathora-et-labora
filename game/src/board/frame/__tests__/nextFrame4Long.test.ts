import { control } from '../../../control'
import { GameCommandConfigParams, GameStatePlaying, PlayerColor } from '../../../types'

describe('board/frame/nextFrame4Long', () => {
  it('gives a nice flow', () => {
    const c1 = {
      players: 4,
      length: 'long',
    } as GameCommandConfigParams
    const s1 = {
      config: c1,
      players: [
        { color: PlayerColor.Red },
        { color: PlayerColor.Blue },
        { color: PlayerColor.Green },
        { color: PlayerColor.White },
      ],
      frame: {
        round: 1,
        next: 2,
        activePlayerIndex: 0,
      },
    } as GameStatePlaying
    const s2 = control(s1, ['CONVERT'], 0)
    expect(s2.flow.map(({ round, player, bonus, settle }) => [round, player, bonus, settle])).toStrictEqual([
      [1, 'R', false, false],
      [1, 'B', false, false],
      [1, 'G', false, false],
      [1, 'W', false, false],
      [1, 'R', false, false],
      [2, 'B', false, false],
      [2, 'G', false, false],
      [2, 'W', false, false],
      [2, 'R', false, false],
      [2, 'B', false, false],
      [3, 'G', false, false],
      [3, 'W', false, false],
      [3, 'R', false, false],
      [3, 'B', false, false],
      [3, 'G', false, false],
      [4, 'W', false, false],
      [4, 'R', false, false],
      [4, 'B', false, false],
      [4, 'G', false, false],
      [4, 'W', false, false],
      [5, 'R', false, false],
      [5, 'B', false, false],
      [5, 'G', false, false],
      [5, 'W', false, false],
      [5, 'R', false, false],
      [6, 'B', false, false],
      [6, 'G', false, false],
      [6, 'W', false, false],
      [6, 'R', false, false],
      [6, 'B', false, false],
      [6, 'G', false, true],
      [6, 'W', false, true],
      [6, 'R', false, true],
      [6, 'B', false, true],
      [7, 'G', false, false],
      [7, 'W', false, false],
      [7, 'R', false, false],
      [7, 'B', false, false],
      [7, 'G', false, false],
      [8, 'W', false, false],
      [8, 'R', false, false],
      [8, 'B', false, false],
      [8, 'G', false, false],
      [8, 'W', false, false],
      [9, 'R', false, false],
      [9, 'B', false, false],
      [9, 'G', false, false],
      [9, 'W', false, false],
      [9, 'R', false, false],
      [9, 'B', false, true],
      [9, 'G', false, true],
      [9, 'W', false, true],
      [9, 'R', false, true],
      [10, 'B', false, false],
      [10, 'G', false, false],
      [10, 'W', false, false],
      [10, 'R', false, false],
      [10, 'B', false, false],
      [11, 'G', false, false],
      [11, 'W', false, false],
      [11, 'R', false, false],
      [11, 'B', false, false],
      [11, 'G', false, false],
      [12, 'W', false, false],
      [12, 'R', false, false],
      [12, 'B', false, false],
      [12, 'G', false, false],
      [12, 'W', false, false],
      [13, 'R', false, false],
      [13, 'B', false, false],
      [13, 'G', false, false],
      [13, 'W', false, false],
      [13, 'R', false, false],
      [14, 'B', false, false],
      [14, 'G', false, false],
      [14, 'W', false, false],
      [14, 'R', false, false],
      [14, 'B', false, false],
      [15, 'G', false, false],
      [15, 'W', false, false],
      [15, 'R', false, false],
      [15, 'B', false, false],
      [15, 'G', false, false],
      [15, 'W', false, true],
      [15, 'R', false, true],
      [15, 'B', false, true],
      [15, 'G', false, true],
      [16, 'W', false, false],
      [16, 'R', false, false],
      [16, 'B', false, false],
      [16, 'G', false, false],
      [16, 'W', false, false],
      [17, 'R', false, false],
      [17, 'B', false, false],
      [17, 'G', false, false],
      [17, 'W', false, false],
      [17, 'R', false, false],
      [18, 'B', false, false],
      [18, 'G', false, false],
      [18, 'W', false, false],
      [18, 'R', false, false],
      [18, 'B', false, false],
      [18, 'G', false, true],
      [18, 'W', false, true],
      [18, 'R', false, true],
      [18, 'B', false, true],
      [19, 'G', false, false],
      [19, 'W', false, false],
      [19, 'R', false, false],
      [19, 'B', false, false],
      [19, 'G', false, false],
      [20, 'W', false, false],
      [20, 'R', false, false],
      [20, 'B', false, false],
      [20, 'G', false, false],
      [20, 'W', false, false],
      [21, 'R', false, false],
      [21, 'B', false, false],
      [21, 'G', false, false],
      [21, 'W', false, false],
      [21, 'R', false, false],
      [22, 'B', false, false],
      [22, 'G', false, false],
      [22, 'W', false, false],
      [22, 'R', false, false],
      [22, 'B', false, false],
      [23, 'G', false, false],
      [23, 'W', false, false],
      [23, 'R', false, false],
      [23, 'B', false, false],
      [23, 'G', false, false],
      [24, 'W', false, false],
      [24, 'R', false, false],
      [24, 'B', false, false],
      [24, 'G', false, false],
      [24, 'W', false, false],
      [24, 'R', true, false],
      [24, 'B', true, false],
      [24, 'G', true, false],
      [24, 'W', true, false],
      [24, 'R', false, true],
      [24, 'B', false, true],
      [24, 'G', false, true],
      [24, 'W', false, true],
    ])
  })
})

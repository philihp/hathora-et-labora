import { pipe } from 'ramda'
import { match, P } from 'ts-pattern'
import { getPlayer, isLayBrother, isPrior, setPlayer } from '../board/player'
import { bakery } from '../buildings/bakery'
import { clayMound } from '../buildings/clayMound'
import { farmyard } from '../buildings/farmyard'
import { peatCoalKiln } from '../buildings/peatCoalKiln'
import { BuildingEnum, GameStatePlaying, Tile } from '../types'

export const findBuilding = (landscape: Tile[][], building: BuildingEnum): { row?: number; col?: number } => {
  let row
  let col
  landscape.forEach((landRow, r) => {
    landRow.forEach(([_l, b, _c], c) => {
      if (building === b) {
        row = r
        col = c
      }
    })
  })
  return { row, col }
}

export const moveClergyToOwnBuilding =
  (building: BuildingEnum, usePrior: boolean) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined => {
    if (state === undefined) return undefined
    const player = getPlayer(state)
    const { row, col } = findBuilding(player.landscape, building)
    if (row === undefined || col === undefined) return undefined
    const [land] = player.landscape[row][col]

    const layBrothers = player.clergy.filter(isLayBrother)
    const priors = player.clergy.filter(isPrior)
    if (usePrior && priors.length === 0) return undefined
    const nextClergy = (usePrior ? priors : player.clergy)[0]
    if (nextClergy === undefined) return undefined

    return setPlayer(state, {
      ...player,
      landscape: [
        ...player.landscape.slice(0, row),
        [
          ...player.landscape[row].slice(0, col),
          [land, building, nextClergy] as Tile,
          ...player.landscape[row].slice(col + 1),
        ],
        ...player.landscape.slice(row + 1),
      ],
      clergy: player.clergy.filter((c) => c !== nextClergy),
    })
  }

export const use = (building: BuildingEnum, params: string[]) =>
  pipe(
    moveClergyToOwnBuilding(
      building,
      false // TODO: we need a way of passing active player to the owner so they can choose
      // TODO: if building has already been built this round, use Prior
    ),
    match<[BuildingEnum, string[]], (state: GameStatePlaying | undefined) => GameStatePlaying | undefined>([
      building,
      params,
    ])
      .with(
        [
          P.union(BuildingEnum.FarmYardR, BuildingEnum.FarmYardG, BuildingEnum.FarmYardB, BuildingEnum.FarmYardW),
          [P.select()],
        ],
        farmyard
      )
      .with(
        [
          P.union(BuildingEnum.ClayMoundR, BuildingEnum.ClayMoundG, BuildingEnum.ClayMoundB, BuildingEnum.ClayMoundW),
          [P._],
        ],
        [
          P.union(BuildingEnum.ClayMoundR, BuildingEnum.ClayMoundG, BuildingEnum.ClayMoundB, BuildingEnum.ClayMoundW),
          [],
        ],
        ([_, params]) => clayMound(params[0])
      )
      .with([BuildingEnum.PeatCoalKiln, []], [BuildingEnum.PeatCoalKiln, [P._]], ([_, params]) =>
        peatCoalKiln(params[0])
      )
      .with([BuildingEnum.Bakery, [P._]], ([_, params]) => bakery(params[0]))
      .otherwise(() => () => {
        throw new Error(`Invalid params [${params}] for building ${building}`)
      })
  )

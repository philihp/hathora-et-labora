import { pipe } from 'ramda'
import { costForBuilding, isCloisterBuilding, terrainForBuilding } from '../board/buildings'
import { getPlayer, setPlayer } from '../board/player'
import { canAfford } from '../board/resource'
import { BuildingEnum, GameCommandBuildParams, GameStatePlaying, Tableau, Tile } from '../types'

const checkBuildingUnbuilt =
  (building: BuildingEnum) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined =>
    state?.buildings.includes(building) ? state : undefined

const checkLandscapeFree =
  (row: number, col: number) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined =>
    state && !state.players[state.activePlayerIndex].landscape[row][col][1] ? state : undefined

const checkLandTypeMatches =
  (row: number, col: number, building: BuildingEnum) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined =>
    state && terrainForBuilding(building).includes(state.players[state.activePlayerIndex].landscape[row][col][0])
      ? state
      : undefined

const checkPlayerHasBuildingCost =
  (building: BuildingEnum) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined =>
    state && canAfford(costForBuilding(building))(getPlayer(state)) ? state : undefined

const checkBuildingCloister =
  (row: number, col: number, building: BuildingEnum) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined =>
    state &&
    (!isCloisterBuilding(building) ||
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ].some(([rowMod, colMod]) => isCloisterBuilding(getPlayer(state).landscape[row + rowMod]?.[col + colMod]?.[1])))
      ? state
      : undefined

const removeBuildingFromUnbuilt =
  (building: BuildingEnum) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined =>
    state && {
      ...state,
      buildings: state?.buildings.filter((b) => b !== building),
    }

const addBuildingAtLandscape =
  (row: number, col: number, building: BuildingEnum) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined => {
    if (state === undefined) return undefined
    const player = getPlayer(state)
    const landscape = [
      ...player.landscape.slice(0, row),
      [
        ...player.landscape[row].slice(0, col),
        [player.landscape[row][col][0], building] as Tile,
        ...player.landscape[row].slice(col + 1),
      ],
      ...player.landscape.slice(row + 1),
    ]
    return setPlayer(state, {
      ...player,
      landscape,
    })
  }

const removeBuildingCost =
  (building: BuildingEnum) =>
  (state: GameStatePlaying | undefined): GameStatePlaying | undefined => {
    if (state === undefined) return undefined
    const player = Object.entries(costForBuilding(building)).reduce(
      (p: Tableau, [type, amountNeeded]) => ({
        ...p,
        // ugh typescript, don't make it weird.
        [type]: (p[type as keyof Tableau] as number) - amountNeeded,
      }),
      getPlayer(state)
    )
    return setPlayer(state, player)
  }

export const build = ({ row, col, building }: GameCommandBuildParams) =>
  pipe(
    checkBuildingUnbuilt(building),
    checkLandscapeFree(row, col),
    checkLandTypeMatches(row, col, building),
    checkPlayerHasBuildingCost(building),
    checkBuildingCloister(row, col, building),
    removeBuildingFromUnbuilt(building),
    addBuildingAtLandscape(row, col, building),
    removeBuildingCost(building)
  )

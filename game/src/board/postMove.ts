import { match, P } from 'ts-pattern'
import {
  GameCommandConfigParams,
  GameStatePlaying,
  GameStatusEnum,
  PostMoveHandler,
  SettlementRound,
  Tile,
} from '../types'
import { roundBuildings } from './buildings'
import { clergyForColor } from './player'
import { postRound } from './postRound'
import { pushArm } from './rondel'
import { roundSettlements } from './settlements'

export const postMove = (config: GameCommandConfigParams): PostMoveHandler => {
  return match<GameCommandConfigParams, PostMoveHandler>(config) // .
    .with({ players: 1, country: 'ireland' }, () => (state: GameStatePlaying) => {
      const newState = { ...state }
      let {
        buildings,
        players,
        activePlayerIndex,
        settling,
        extraRound,
        moveInRound,
        settlementRound,
        status,
        neutralBuildingPhase,
        rondel,
        round,
      } = state

      // clear any coins that may have been paid to neutral player
      players = [state.players[0], { ...state.players[1], penny: 0 }]

      if (state.extraRound && moveInRound === 2) {
        settling = true
        settlementRound = SettlementRound.E
        extraRound = false
      } else if (settlementRound === SettlementRound.E) {
        status = GameStatusEnum.FINISHED
      }

      if (settling && state.buildings.length === 0) {
        if (neutralBuildingPhase) {
          moveInRound++
          activePlayerIndex = (activePlayerIndex + 1) % state.players.length
          neutralBuildingPhase = false

          const neutralClergy = clergyForColor(players[1].color)
          if (players[1].clergy.length === 0) {
            players[1] = {
              ...players[1],
              clergy: neutralClergy,
              landscape: players[1].landscape.map((landRow) =>
                landRow.map((landStack) => {
                  const [land, building, clergy] = landStack
                  if (clergy && neutralClergy.includes(clergy)) return [land, building, undefined] as Tile
                  return landStack
                })
              ),
            }
          }
        } else {
          // board.postSettlement()
          settling = false
          buildings = roundBuildings(state.config, state.settlementRound)
          players = players.map((player) => ({
            ...player,
            settlements: [...player.settlements, ...roundSettlements(player.color, state.settlementRound)],
          }))
          if (state.settlementRound === SettlementRound.E) {
            status = GameStatusEnum.FINISHED
            rondel = pushArm(rondel, state.config.players)
          }
          round++
          moveInRound = 1
        }
      } else {
        moveInRound++
        if (!settling && moveInRound > 2) {
          // board.postRound()
          return postRound(state.config)({
            ...newState,
            players,
            buildings,
            activePlayerIndex,
            settling,
            extraRound,
            moveInRound,
            settlementRound,
            status,
            neutralBuildingPhase,
            rondel,
            round,
          })
        }
      }

      return {
        ...newState,
        players,
        buildings,
        activePlayerIndex,
        settling,
        extraRound,
        moveInRound,
        settlementRound,
        status,
        neutralBuildingPhase,
        rondel,
        round,
      }
    })
    .with({ players: 1, country: 'france' }, () => (state: GameStatePlaying) => {
      const newState = { ...state }
      let {
        buildings,
        players,
        activePlayerIndex,
        settling,
        extraRound,
        moveInRound,
        settlementRound,
        status,
        neutralBuildingPhase,
        rondel,
        round,
      } = state

      // clear any coins that may have been paid to neutral player
      players = [state.players[0], { ...state.players[1], penny: 0 }]

      if (state.extraRound) {
        moveInRound = 2
        settling = true
        settlementRound = SettlementRound.E
        extraRound = false
      } else if (settlementRound === SettlementRound.E) {
        status = GameStatusEnum.FINISHED
      }

      if (settling && state.buildings.length === 0) {
        if (neutralBuildingPhase) {
          moveInRound++
          activePlayerIndex = (activePlayerIndex + 1) % state.players.length
          neutralBuildingPhase = false

          const neutralClergy = clergyForColor(players[1].color)
          if (players[1].clergy.length === 0) {
            players[1] = {
              ...players[1],
              clergy: neutralClergy,
              landscape: players[1].landscape.map((landRow) =>
                landRow.map((landStack) => {
                  const [land, building, clergy] = landStack
                  if (clergy && neutralClergy.includes(clergy)) return [land, building, undefined] as Tile
                  return landStack
                })
              ),
            }
          }
        } else {
          // board.postSettlement()
          settling = false
          buildings = roundBuildings(state.config, state.settlementRound)
          players = players.map((player) => ({
            ...player,
            settlements: [...player.settlements, ...roundSettlements(player.color, state.settlementRound)],
          }))
          if (state.settlementRound === SettlementRound.E) {
            status = GameStatusEnum.FINISHED
            rondel = pushArm(rondel, state.config.players)
          }
          round++
          moveInRound = 1
        }
      } else {
        moveInRound++
        if (!settling && moveInRound > 2) {
          // board.postRound()
          return postRound(state.config)({
            ...newState,
            players,
            buildings,
            activePlayerIndex,
            settling,
            extraRound,
            moveInRound,
            settlementRound,
            status,
            neutralBuildingPhase,
            rondel,
            round,
          })
        }
      }

      return {
        ...newState,
        players,
        buildings,
        activePlayerIndex,
        settling,
        extraRound,
        moveInRound,
        settlementRound,
        status,
        neutralBuildingPhase,
        rondel,
        round,
      }
    })
    .with({ players: 2, length: 'long' }, () => (state: GameStatePlaying) => {
      if (state.players === undefined) return undefined
      if (state.moveInRound === undefined) return undefined
      if (state.round === undefined) return undefined
      if (state.config === undefined) return undefined
      if (state.rondel === undefined) return undefined

      let { rondel, status, players, buildings, round, settling, moveInRound, activePlayerIndex } = state
      let newState = state

      if (moveInRound === 2 || settling) {
        activePlayerIndex = (activePlayerIndex + 1) % state.players.length
      }
      moveInRound++

      if (settling && moveInRound === 3) {
        // board.postSettlement()
        settling = false
        buildings = roundBuildings(state.config, state.settlementRound)
        players = players.map((player) => ({
          ...player,
          settlements: [...player.settlements, ...roundSettlements(player.color, state.settlementRound)],
        }))
        if (state.settlementRound === SettlementRound.E) {
          status = GameStatusEnum.FINISHED
          rondel = pushArm(rondel, state.config.players)
        }

        round++
        moveInRound = 1
      } else if (!settling && moveInRound === 4) {
        const postRoundState = postRound(state.config)(newState)
        if (postRoundState === undefined) return undefined
        newState = postRoundState
      }

      return {
        ...newState,
        rondel,
        status,
        settling,
        moveInRound,
        activePlayerIndex,
        round,
        players,
      }
    })
    .with({ players: 2, length: 'short' }, (config) => (state: GameStatePlaying) => {
      if (state.players === undefined) return undefined
      if (state.moveInRound === undefined) return undefined
      if (state.config === undefined) return undefined
      if (state.round === undefined) return undefined
      if (state.rondel === undefined) return undefined
      if (state.startingPlayer === undefined) return undefined

      let { rondel, buildings, players, round, moveInRound, activePlayerIndex, settling, status } = state
      let newState = state
      const { settlementRound } = state
      moveInRound++

      if (settling) {
        activePlayerIndex = (activePlayerIndex + 1) % state.players.length
        if (moveInRound > 2) {
          // board.postSettlement()
          settling = false
          buildings = roundBuildings(state.config, state.settlementRound)
          players = players.map((player) => ({
            ...player,
            settlements: roundSettlements(player.color, state.settlementRound),
          }))
          if (state.settlementRound === SettlementRound.E) {
            status = GameStatusEnum.FINISHED
            rondel = pushArm(rondel, state.config.players)
          }
          round++
          moveInRound = 1
        }
      } else if (moveInRound > 2) {
        activePlayerIndex = (activePlayerIndex + 1) % state.players.length
        const postRoundState = postRound(state.config)(newState)
        if (postRoundState === undefined) return undefined
        newState = postRoundState
      }

      return {
        ...newState,
        rondel,
        buildings,
        players,
        round,
        moveInRound,
        activePlayerIndex,
        settlementRound,
        settling,
      }
    })
    .with({ players: P.union(3, 4) }, () => (state: GameStatePlaying) => {
      if (state.config === undefined) return undefined
      if (state.players === undefined) return undefined
      if (state.moveInRound === undefined) return undefined
      if (state.round === undefined) return undefined
      if (state.rondel === undefined) return undefined
      if (state.startingPlayer === undefined) return undefined

      let newState = state
      let { rondel, status, players, buildings, round, settling, extraRound, activePlayerIndex, moveInRound } = state
      activePlayerIndex = (activePlayerIndex + 1) % state.players.length
      moveInRound += 1

      if (extraRound && moveInRound === state.players.length + 1) {
        // board.postExtraRound()
        extraRound = false
        settling = true
        moveInRound = 1
      }

      if (moveInRound === state.players.length + 1 || settling) {
        // board.postSettlement()
        settling = false
        buildings = roundBuildings(state.config, state.settlementRound)
        players = players.map((player) => ({
          ...player,
          settlements: roundSettlements(player.color, state.settlementRound),
        }))
        if (state.settlementRound === SettlementRound.E) {
          status = GameStatusEnum.FINISHED
          rondel = pushArm(rondel, state.config.players)
        }
        round++
        moveInRound = 1
      } else if (!settling && moveInRound === state.players.length) {
        const postRoundState = postRound(state.config)(state)
        if (postRoundState === undefined) return undefined
        newState = postRoundState
      }

      return {
        ...newState,
        rondel,
        status,
        players,
        buildings,
        round,
        settling,
        extraRound,
        activePlayerIndex,
        moveInRound,
      }
    })
    .otherwise(() => () => undefined)
}

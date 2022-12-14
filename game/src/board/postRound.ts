import { match, P } from 'ts-pattern'
import { GameCommandConfigParams, GameStatePlaying, GameStatusEnum, PostRoundHandler, SettlementRound } from '../types'
import { isExtraRound } from './extraRound'
import { settlementOnRound } from './settlements'

export const postRound = (config: GameCommandConfigParams): PostRoundHandler =>
  match<GameCommandConfigParams, PostRoundHandler>(config)
    .with({ players: 1 }, () => (state: GameStatePlaying) => {
      if (state.round === undefined) return undefined
      if (state.config === undefined) return undefined
      if (state.startingPlayer === undefined) return undefined
      if (state.players === undefined) return undefined

      let { activePlayerIndex, moveInRound, extraRound, settling, round, startingPlayer } = state
      moveInRound = 1

      if (isExtraRound(state.config, state.round)) {
        round++
        extraRound = true
      } else if (state.round === settlementOnRound(state.config, state.settlementRound)) {
        // 			if(neutralPlayer.isClergymenAllPlaced())
        // 				neutralPlayer.resetClergymen();
        settling = true
        // TODO: neutralBuildingPhase = true
        activePlayerIndex = (activePlayerIndex + 1) % state.players.length
      } else {
        round++
      }

      // //5 -- pass starting player
      startingPlayer = (startingPlayer + 1) % state.players.length

      return {
        ...state,
        moveInRound,
        extraRound,
        settling,
        activePlayerIndex,
        round,
        startingPlayer,
      }
    })
    .with({ players: 2 }, () => (state: GameStatePlaying) => {
      if (state.round === undefined) return undefined
      if (state.config === undefined) return undefined
      if (state.startingPlayer === undefined) return undefined
      if (state.players === undefined) return undefined

      let { moveInRound, settling, round, status, startingPlayer } = state
      moveInRound = 1
      if (state.round === settlementOnRound(state.config, state.settlementRound)) {
        settling = true
      } else {
        round++
      }

      // begin 2-player end-game detection.
      if (!settling && state.settlementRound === SettlementRound.D && state.buildings.length <= 3) {
        status = GameStatusEnum.FINISHED
      }
      // end 2-player end-game detection.

      startingPlayer = (startingPlayer + 1) % state.players.length

      return {
        ...state,
        moveInRound,
        settling,
        round,
        status,
        startingPlayer,
      }
    })
    .with({ players: P.union(3, 4) }, () => (state: GameStatePlaying) => {
      if (state.round === undefined) return undefined
      if (state.config === undefined) return undefined
      if (state.startingPlayer === undefined) return undefined
      if (state.players === undefined) return undefined

      let { moveInRound, extraRound, settling, round, startingPlayer } = state
      moveInRound = 1

      if (isExtraRound(state.config, state.round)) {
        round++
        extraRound = true
      } else if (state.round === settlementOnRound(state.config, state.settlementRound)) {
        settling = true
      } else {
        round++
      }

      // //5 -- pass starting player
      startingPlayer = (startingPlayer + 1) % state.players.length

      return {
        ...state,
        moveInRound,
        extraRound,
        settling,
        round,
        startingPlayer,
      }
    })
    .exhaustive()

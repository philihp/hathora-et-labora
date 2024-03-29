import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  EngineStatus,EngineTableau,
  EngineColor,
  EngineCountry,
  EngineLength,
  EngineUser,
  EngineState,
  UserId,
  IInitializeRequest,
  IJoinRequest,
  IConfigRequest,
  IStartRequest,
  IMoveRequest,
  IUndoRequest,
  IRedoRequest,
  IControlRequest,
  EngineFlower,
} from "../api/types";
import {
  reducer, initialState, GameStatePlaying, Tableau, Tile, GameConfigCountry, GameConfigLength, control
} from 'hathora-et-labora-game';
import { PlayerColor } from "hathora-et-labora-game/dist/types";

type InternalUser = {
  id: UserId
  name: string
  picture: string
  color: EngineColor
}

type InternalState = {
  users: InternalUser[]
  active: boolean
  country?: GameConfigCountry
  length?: GameConfigLength
  gameState: GameStatePlaying[]
  commands: string[]
  commandIndex: number
  partial: string
}

const statusDongle = (status: string): EngineStatus => {
  switch(status) {
    case 'SETUP':
      return EngineStatus.SETUP;
    case 'FINISHED':
      return EngineStatus.FINISHED;
    case 'PLAYING':
    default:
      return EngineStatus.PLAYING;
  }
}
const colorDongle = (color: string): EngineColor => {
  switch(color) {
    case 'R':
      return EngineColor.Red;
    case 'G':
      return EngineColor.Green;
    case 'B':
      return EngineColor.Blue;
    case 'W':
    default:
      return EngineColor.White;
  }
}

const colorToChar = ({color}: InternalUser):string => {
  switch(color) {
    case EngineColor.Red:
      return 'R'
    case EngineColor.Blue:
      return 'B'
    case EngineColor.Green:
      return 'G'
    case EngineColor.White:
      return 'W'
    default:
      return ''
  }
}

const tileDongle = (tile: Tile): string[] => {
  return tile as string[]
}

const tableauDongle = (player: Tableau):EngineTableau => {
  return {
    ...player,
    color: colorDongle(player.color),
    landscape: player.landscape.map(
      (landscapeRow) => landscapeRow.map(tileDongle)
    )
  }
}

const activeUserId = (state: InternalState): string => {
  const currState = state.gameState[state.commandIndex - 1]
  const currColor = colorDongle(currState.players[currState.frame.activePlayerIndex].color)
  return state.users.filter(u => u.color == currColor)?.[0]?.id
}

const myPlayerIndex = (state: InternalState, userId: UserId): number | undefined => {
  const currState = state.gameState[state.commandIndex - 1]
  const myColor = state.users.find(u => u.id === userId)?.color
  const myIndex = currState.players.findIndex((p: Tableau) => colorDongle(p.color) === (myColor))
  if(myIndex === -1) return undefined
  return myIndex
}

const tokenizePartial = (partial: string): string[] => {
  const out = partial.split(/\s+/)
  if(out.length === 1 && out[0] === '') return []
  return out
}

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      users: [],
      active: false,
      gameState: [],
      commands: [],
      commandIndex: 0,
      partial: '',
    }
  }

  join(state: InternalState, userId: UserId, ctx: Context, request: IJoinRequest): Response {
    const { color, picture, name } = request
    if(state.users.some(u => u.color === color && u.id !== userId)) {
      return Response.error('Color already taken')
    }
    state.users = state.users.filter(u => u.id !== userId)
    if(color !== undefined) {
      state.users.push({ id: userId, color, name, picture })
    }
    return Response.ok()
  }

  config(state: InternalState, userId: UserId, ctx: Context, request: IConfigRequest): Response {
    const players = `${Math.max(1, state.users.length)}`
    if([EngineCountry.ireland, EngineCountry.france].includes(request.country) === false) return Response.error('Only the France variant is implemented');
    const country = request.country === EngineCountry.ireland ? 'ireland' : 'france'
    const length = request.length === EngineLength.long ? 'long' : 'short'
    if(reducer(initialState, ['CONFIG', players, country, length]) === undefined) return Response.error('Invalid config')
    state.country = country
    state.length = length
    return Response.ok()
  }

  start(state: InternalState, userId: UserId, ctx: Context, request: IStartRequest): Response {
    const s0 = initialState
    if(state.country === undefined) return Response.error('Country not configured');
    if(state.length === undefined) return Response.error('Length not configured');
    const c1 = ['CONFIG', `${state.users.length}`, state.country, state.length]
    const s1 = reducer(s0, c1)
    if(!s1) return Response.error(`Unable to configure with ${c1.join(' ')}`)

    const seed = `${ctx.chance.natural({min: 1, max: 999999999})}`
    const colors = state.users.map(colorToChar)
    const c2 = ['START', seed, ...colors]
    const s2 = reducer(s1, c2) as GameStatePlaying
    if(!s2) return Response.error(`Unable to configure with ${c2.join(' ')}`)

    state.gameState = [s2, s2]
    state.commands = [
      `CONFIG ${state.users.length} ${state.country} ${state.length}`,
      ['START', ...s2.players.map(p => p.color)].join(' ')
    ]
    state.commandIndex = 2
    return Response.ok()
  }

  move(state: InternalState, userId: UserId, ctx: Context, request: IMoveRequest): Response {
    const currState = state.gameState[state.commandIndex - 1]
    const activeUser = activeUserId(state)
    if(activeUser !== userId) {
      return Response.error(`Active user is ${activeUser}`)
    }

    const command = request.command.split(/\s+/)
    const nextState = reducer(currState, command) as GameStatePlaying
    if(nextState === undefined) return Response.error(`Invalid command ${command}`)

    state.gameState = [
      ...state.gameState.slice(0, state.commandIndex),
      nextState
    ]
    state.commands = [
      ...state.commands.slice(0, state.commandIndex),
      request.command
    ]
    state.commandIndex++
    return Response.ok()
  }

  control(state: InternalState, userId: string, ctx: Context, request: IControlRequest): Response {
    const activeUser = activeUserId(state)
    if(activeUser !== userId) {
      return Response.error(`Active user is ${activeUser}`)
    }
    state.partial = request.partial
    return Response.ok()
  }

  undo(state: InternalState, userId: string, ctx: Context, request: IUndoRequest): Response {
    const activeUser = activeUserId(state)
    if(activeUser !== userId) {
      return Response.error(`Active user is ${activeUser}`)
    }
    if(state.commandIndex <= 2) return Response.error('Cannot undo past beginning')
    state.commandIndex--;
    state.partial = ""
    return Response.ok()
  }

  redo(state: InternalState, userId: string, ctx: Context, request: IRedoRequest): Response {
    const activeUser = activeUserId(state)
    if(activeUser !== userId) {
      return Response.error(`Active user is ${activeUser}`)
    }
    if(state.commandIndex >= state.commands.length) return Response.error('Cannot redo past end of commands')
    state.commandIndex++;
    state.partial = ""
    return Response.ok()
  }

  getUserState(state: InternalState, userId: UserId): EngineState {
    if(!state.commandIndex) {
      return {
        users: state.users as EngineUser[],
        me: state.users.find(u => u.id === userId),
        status: EngineStatus.SETUP,
        config: state.country && state.length && {
          country: state.country === 'ireland' ? EngineCountry.ireland : EngineCountry.france,
          length: state.length === 'short' ? EngineLength.short : EngineLength.long,
          players: state.users.length
        },
        buildings: [],
        plotPurchasePrices: [],
        districtPurchasePrices: [],
        moves: [],
        control: undefined,
        flow: [],
        score: [],
      }
    }

    const currState = state.gameState[state.commandIndex -1] as GameStatePlaying
    const users: EngineUser[] = state.users
    const me = state.users.find(u => u.id === userId)
    const moves = state.commands.slice(0, state.commandIndex)

    const partial = tokenizePartial(state.partial)
    const controlSurface = control(currState, partial, myPlayerIndex(state, userId))
    const controlState = !controlSurface.active ? undefined : {
      partial: controlSurface.partial && controlSurface.partial.join(' '),
      completion: controlSurface.completion
    }
    const score = controlSurface.score

    return {
      users,
      me,
      moves,
      status: statusDongle(currState.status),
      config: {
        country: EngineCountry.france,
        length: currState.config?.length === 'short' ? EngineLength.short : EngineLength.long,
        players: currState.config?.players
      },
      rondel: currState.rondel,
      wonders:currState.wonders,
      players: currState.players.map(tableauDongle),
      neutralPlayer: undefined,
      buildings: currState.buildings,
      plotPurchasePrices: currState.plotPurchasePrices,
      districtPurchasePrices: currState.districtPurchasePrices,
      frame: currState.frame,
      control: controlState,
      flow: controlSurface.flow.map(flower => {
        const engineFlower: EngineFlower = {
          round: flower.round,
          player: colorDongle(flower.player as PlayerColor),
          settle: flower.settle,
          bonus: flower.bonus,
          introduced: flower.introduced,
        }
        return engineFlower
      }),
      score
    }
  }
}

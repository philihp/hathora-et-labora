import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  EngineStatus,EngineTableau,
  Color,
  Country,
  Length,
  User,
  EngineState,
  UserId,
  IInitializeRequest,
  IJoinRequest,
  IConfigRequest,
  IStartRequest,
  IMoveRequest,
  IUndoRequest,
  IRedoRequest,
} from "../api/types";
import {
  reducer, initialState, GameStatePlaying, Tableau, Tile, GameConfigCountry, GameConfigLength
} from 'hathora-et-labora-game';

type InternalUser = {
  id: UserId
  color: Color
}

type InternalState = {
  users: InternalUser[]
  country?: GameConfigCountry
  length?: GameConfigLength
  gameState: GameStatePlaying[]
  commands: string[]
  commandIndex: number
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
const colorDongle = (color: string): Color => {
  switch(color) {
    case 'R':
      return Color.Red;
    case 'G':
      return Color.Green;
    case 'B':
      return Color.Blue;
    case 'W':
    default:
      return Color.White;
  }
}

const colorToChar = ({color}: InternalUser):string => {
  switch(color) {
    case Color.Red:
      return 'R'
    case Color.Blue:
      return 'B'
    case Color.Green:
      return 'G'
    case Color.White:
      return 'W'
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


export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      users: [],
      gameState: [],
      commands: [],
      commandIndex: 0,
    }
  }

  join(state: InternalState, userId: UserId, ctx: Context, request: IJoinRequest): Response {
    const { color } = request
    state.users = state.users.filter(u => u.id !== userId && u.color !== color).concat({
      id: userId, color
    })
    return Response.ok()
  }

  config(state: InternalState, userId: UserId, ctx: Context, request: IConfigRequest): Response {
    const players = `${state.users.length}`
    if(request.country !== Country.france) return Response.error('Only the France variant is implemented');
    const country = 'france'
    const length = request.length === Length.long ? 'long' : 'short'  
    if(reducer(initialState, ['CONFIG', players, country, length]) === undefined) return Response.error('Invalid config')
    state.country = country
    state.length = length
    return Response.ok()
  }

  start(state: InternalState, userId: UserId, ctx: Context, request: IStartRequest): Response {
    const s0 = initialState

    if(state.country===undefined) return Response.error('Country not configured');
    if(state.length===undefined) return Response.error('Length not configured');
    const c1 = ['CONFIG', `${state.users.length}`, state.country, state.length]
    const s1 = reducer(s0, c1)
    if(!s1) return Response.error(`Unable to configure with ${c1.join(' ')}`)

    const seed = `${ctx.chance.natural({min: 1, max: 999999999})}`
    const colors = state.users.map(colorToChar)
    const c2 = ['START', seed, ...colors]
    const s2 = reducer(s1, c2) as GameStatePlaying
    if(!s2) return Response.error(`Unable to configure with ${c2.join(' ')}`)

    state.gameState = [s2]
    state.commands = ['START']
    state.commandIndex = 1
    return Response.ok()
  }

  move(state: InternalState, userId: UserId, ctx: Context, request: IMoveRequest): Response {
    const currState = state.gameState[state.commandIndex - 1]
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

  undo(state: InternalState, userId: string, ctx: Context, request: IUndoRequest): Response {
    if(state.commandIndex <= 1) return Response.error('Cannot undo past beginning')
    state.commandIndex--;
    return Response.ok()
  }
  redo(state: InternalState, userId: string, ctx: Context, request: IRedoRequest): Response {
    if(state.commandIndex >= state.commands.length) return Response.error('Cannot redo past end of commands')
    state.commandIndex++;
    return Response.ok()
  }
  
  getUserState(state: InternalState, userId: UserId): EngineState {
    if(!state.commandIndex) {
      return {
        users: state.users as User[],
        status: EngineStatus.SETUP,
        config: {
          country: state.country === 'france' ? Country.france : Country.ireland,
          length: state.length === 'short' ? Length.short : Length.long,
          players: state.users.length
        },
        buildings: [],
        plotPurchasePrices: [],
        districtPurchasePrices: [],
        moves: [],
      }
    }

    const currState = state.gameState[state.commandIndex -1] as GameStatePlaying
    return {
        users: state.users as User[],
        moves: state.commands.slice(0, state.commandIndex),
        status: statusDongle(currState.status),
        config: {
          country: Country.france,
          length: currState.config?.length === 'short' ? Length.short : Length.long,
          players: currState.config?.players
        },
        rondel: currState.rondel,
        wonders:currState.wonders,
        players: currState.players.map(tableauDongle),
        neutralPlayer: undefined,
        buildings: currState.buildings,
        plotPurchasePrices: currState.plotPurchasePrices,
        districtPurchasePrices: currState.districtPurchasePrices,
        frame: currState.frame
      }

  }
}

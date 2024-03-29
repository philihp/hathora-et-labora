import { addIndex, collectBy, find, flatten, map, range } from 'ramda'
import React from 'react'
import { useHathoraContext } from '../context/GameContext'
import { EngineColor, EngineFlower } from '../../../../api/types'
import { Frame } from './Frame'

const resetStyle = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  textIndent: 0,
  listStyleType: 'none',
}

type ColorStyle = {
  backgroundColor?: string
  borderColor?: string
}

const colorToStyle = (c?: EngineColor): ColorStyle => {
  switch (c) {
    case EngineColor.Blue:
      return { borderColor: '#80b1d3' } // , borderColor: '#5f849e' }
    case EngineColor.Red:
      return { borderColor: '#fb8072' } // , borderColor: '#ad574d' }
    case EngineColor.Green:
      return { borderColor: '#b3de69' } // , borderColor: '#87a74f' }
    case EngineColor.White:
      return { borderColor: '#d9d9d9' } // , borderColor: '#b1b1b1' }
    default:
      return {}
  }
}

export const MoveList = () => {
  const { state, undo, redo } = useHathoraContext()
  const completions = state?.control?.completion ?? []

  const flow = collectBy((f) => `${f.round}`, state?.flow ?? [])
  return (
    <div style={{ paddingTop: 20 }}>
      {/* {EngineColor[state?.users?.find((u) => u.id === state?.me?.id)?.color ?? -1]}
      <br /> */}
      <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
        {map(
          (i) => {
            const active = i === state?.frame?.activePlayerIndex
            const current = i === state?.frame?.currentPlayerIndex
            const player = state?.players?.[i]
            const score = state?.score?.[i]
            const user = find((user) => user.color === player?.color, state?.users ?? [])
            return (
              <div key={`player:${i}`} style={{ display: 'flex', gap: 4, alignItems: 'center', flexDirection: 'row' }}>
                <div style={{ minWidth: 20 }}>
                  {current && '🏵️'}
                  {!current && active && '⌚️'}
                </div>
                <div style={{}}>
                  <img
                    title={user?.name}
                    alt={user?.name}
                    src={user?.picture}
                    height="32"
                    width="32"
                    style={{
                      ...colorToStyle(user?.color),
                      borderRadius: 16,
                      borderWidth: 3,
                      borderStyle: 'solid',
                    }}
                  />
                </div>
                <div style={{}}>
                  {score?.total} points
                  {score?.settlements?.length !== 0 && (
                    <div style={{ fontSize: 'x-small' }}>Settlements: {score?.settlements?.join(', ')}</div>
                  )}
                </div>
              </div>
            )
          },
          range(0, state?.score?.length ?? 0)
        )}
      </div>
      <hr />

      {state?.control === undefined && (
        <div>Waiting on {EngineColor[state?.players?.[state?.frame?.activePlayerIndex ?? -1]?.color ?? -1]}...</div>
      )}
      {state?.control !== undefined && (
        <>
          <button type="button" onClick={undo}>
            Undo
          </button>
          <button type="button" onClick={redo}>
            Redo
          </button>
        </>
      )}

      <hr />

      <ul style={resetStyle}>
        {state?.moves.map((m, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${i}:${m}`} style={{ fontFamily: 'monospace' }}>
            {m}
          </li>
        ))}
        <li>
          <hr />
        </li>
        {addIndex(map<EngineFlower, React.JSX.Element>)(
          (frame: EngineFlower, n: number) => (
            <Frame key={n} frame={frame} />
          ),
          flatten(flow)
        )}
      </ul>
      <hr />
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'
import { useHathoraContext } from '../context/GameContext'
import { HeaderUser } from '../components/HeaderUser'
import { HathoraClient } from '../../../.hathora/client'

const getBuildMessage = (): ReactNode => {
  if (process.env.VERCEL_GIT_COMMIT_SHA === undefined) return null
  const fullHash = process.env.VERCEL_GIT_COMMIT_SHA
  const shortHash = fullHash.slice(fullHash.length - 7)
  return (
    <>
      <a href="https://amzn.to/3QdnouS">Ora et Labora</a> by <a href="http://lookout-spiele.de">Lookout Games</a>, made
      with &heart; in San Francisco.
    </>
  )
}

const Home = () => {
  const navigate = useNavigate()
  const { createPrivateLobby, createPublicLobby, getPublicLobbies, user } = useHathoraContext()

  const [lobbies, setLobbies] = useState<Awaited<ReturnType<HathoraClient['getPublicLobbies']>>>([])
  useEffect(() => {
    getPublicLobbies().then((lobbyInfo) => {
      setLobbies(lobbyInfo)
    })
  }, [setLobbies, getPublicLobbies])

  return (
    <>
      <HeaderUser />
      <h1>Hathora et Labora</h1>
      <p>
        This is a digital implementation of Uwe Rosenberg&apos;s <a href="https://amzn.to/3P94MLs">Ora et Labora</a>,
        built on the <a href="https://hathora.dev">Hathora</a> environment. It can be played alone, or with up to four
        total players. Create a room and share it with your friends to play. Rooms close after being idle for 5 minutes
        to save on server costs.
      </p>
      <h3>Public rooms</h3>
      <table border={1} cellPadding={3} cellSpacing={0}>
        <thead>
          <tr>
            <th>Room Code</th>
            <th>Region</th>
            <th colSpan={3}>Details</th>
          </tr>
        </thead>
        <tbody>
          {lobbies &&
            lobbies.map((lobby) => {
              const { roomId } = lobby
              const { region } = lobby
              const state = (lobby as unknown as { state: { players?: number; country?: string } })?.state
              return (
                <tr>
                  <td>{roomId}</td>
                  <td>{region}</td>
                  <td>
                    {state?.players} players
                    <br />
                    {state?.country}
                  </td>
                  <td>{!state?.players && !state?.country && JSON.stringify({ state })}</td>
                  <td>
                    <button
                      type="button"
                      onClick={async () => {
                        navigate(`/game/${roomId}`)
                      }}
                    >
                      Join
                    </button>
                  </td>
                </tr>
              )
            })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'center' }}>
              <i>No public rooms currently running</i>
            </td>
          </tr>
        </tfoot>
      </table>
      <p>
        <button
          disabled={!user}
          type="button"
          onClick={async () => {
            const roomId = await createPublicLobby()
            navigate(`/game/${roomId}`)
          }}
        >
          Create Public Room
        </button>
      </p>
      <p>
        <h3>Private rooms</h3>
        <p>To connect to a private room, someone in the room must share the URL with you.</p>
        <button
          disabled={!user}
          type="button"
          onClick={async () => {
            const roomId = await createPrivateLobby()
            navigate(`/game/${roomId}`)
          }}
        >
          Create Private Room
        </button>
      </p>
      <hr />
      {getBuildMessage()}
    </>
  )
}

export default Home

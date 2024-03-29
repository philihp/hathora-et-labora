import { GoogleLogin } from '@react-oauth/google'
import { EngineColor } from '../../../../api/types'
import { useHathoraContext } from '../context/GameContext'

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

export const HeaderUser = () => {
  const { user, state, login } = useHathoraContext()

  return (
    <div
      style={{
        position: 'sticky',
        backgroundColor: state?.control ? '#fdb462' : 'auto',
      }}
    >
      {!user && (
        <GoogleLogin
          auto_select
          onSuccess={login}
          onError={() => {
            console.log('Login Failed')
          }}
        />
      )}
      {/* <div style={{ display: 'flex' }}>{JSON.stringify({ user })}</div> */}
      {/* {user && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={user.picture}
            height="32"
            width="32"
            alt={user.name}
            style={{ ...colorToStyle(state?.me?.color), borderRadius: 16, borderWidth: 4, borderStyle: 'solid' }}
          />
        </div>
      )} */}
    </div>
  )
}

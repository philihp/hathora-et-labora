import { range } from 'ramda'

interface Props {
  wonders: number
}

export const UnbuiltWonders = ({ wonders }: Props) => (
  <div style={{ margin: 10 }}>
    Wonders:
    {range(0, wonders).map((n) => (
      <span key={n}>🖼️</span>
    ))}
  </div>
)

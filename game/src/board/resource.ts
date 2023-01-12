import { match, P } from 'ts-pattern'
import { Cost, GameStatePlaying, ResourceEnum, Tableau } from '../types'

const ResourceValues = Object.values(ResourceEnum)

function* resourceSlicer(s: string): Generator<ResourceEnum> {
  for (let i = 0; i + 1 < s.length; i += 2) {
    const scanned = s.slice(i, i + 2) as ResourceEnum
    if (ResourceValues.includes(scanned)) yield scanned
  }
}

const add = (resource: keyof Cost, cost: Cost) => () => {
  cost[resource] = 1 + (cost[resource] ?? 0)
}

export const parseResourceParam: (p?: string) => Cost = (p) => {
  const cost: Cost = {}
  if (p === undefined) return cost
  for (const r of resourceSlicer(p)) {
    match(r)
      .with(ResourceEnum.Wood, add('wood', cost))
      .with(ResourceEnum.Whiskey, add('whiskey', cost))
      .with(ResourceEnum.Grain, add('grain', cost))
      .with(ResourceEnum.Straw, add('straw', cost))
      .with(ResourceEnum.Sheep, add('sheep', cost))
      .with(ResourceEnum.Meat, add('meat', cost))
      .with(ResourceEnum.Clay, add('clay', cost))
      .with(ResourceEnum.Pottery, add('pottery', cost))
      .with(ResourceEnum.Peat, add('peat', cost))
      .with(ResourceEnum.Coal, add('coal', cost))
      .with(ResourceEnum.Penny, add('penny', cost))
      .with(ResourceEnum.Book, add('book', cost))
      .with(ResourceEnum.Stone, add('stone', cost))
      .with(ResourceEnum.Ornament, add('ornament', cost))
      .with(ResourceEnum.Flour, add('flour', cost))
      .with(ResourceEnum.Bread, add('bread', cost))
      .with(ResourceEnum.Grape, add('grape', cost))
      .with(ResourceEnum.Wine, add('wine', cost))
      .with(ResourceEnum.Nickel, add('nickel', cost))
      .with(ResourceEnum.Reliquary, add('reliquary', cost))
      .with(ResourceEnum.Hops, add('hops', cost))
      .with(ResourceEnum.Beer, add('beer', cost))
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .with(ResourceEnum.BonusPoint, () => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .with(ResourceEnum.Joker, () => {})
      .exhaustive()
  }
  return cost
}

export const costEnergy = ({ coal = 0, peat = 0, wood = 0, straw = 0 }) => coal * 3 + peat * 2 + wood + straw * 0.5

export const canAfford =
  (cost: Cost) =>
  (player: Tableau): boolean =>
    Object.entries(cost).every(([type, amountNeeded]) => player[type as keyof Tableau] >= amountNeeded)

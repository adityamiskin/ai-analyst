"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export type Weights = {
  team: number
  product: number
  market: number
  traction: number
}

export const defaultWeights: Weights = {
  team: 30,
  product: 25,
  market: 20,
  traction: 25,
}

type Props = {
  value: Weights
  onChange: (w: Weights) => void
}

export function WeightingPanel({ value, onChange }: Props) {
  function update(key: keyof Weights, v: number[]) {
    const next = { ...value, [key]: v[0] }
    onChange(next)
  }

  const total = value.team + value.product + value.market + value.traction

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="team">Team ({value.team}%)</Label>
          <Slider id="team" value={[value.team]} onValueChange={(v) => update("team", v)} max={50} step={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">Product & Moat ({value.product}%)</Label>
          <Slider id="product" value={[value.product]} onValueChange={(v) => update("product", v)} max={50} step={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="market">Market & Timing ({value.market}%)</Label>
          <Slider id="market" value={[value.market]} onValueChange={(v) => update("market", v)} max={50} step={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="traction">Traction ({value.traction}%)</Label>
          <Slider
            id="traction"
            value={[value.traction]}
            onValueChange={(v) => update("traction", v)}
            max={50}
            step={1}
          />
        </div>
      </div>
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">Total Weight</p>
        <p className={`mt-1 text-3xl font-semibold ${total === 100 ? "" : "text-destructive"}`}>{total}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ensure total equals 100% to compute the overall recommendation.
        </p>
      </div>
    </div>
  )
}

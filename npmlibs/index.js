import { vectorize, ColorMode, Hierarchical, PathSimplifyMode } from '@neplex/vectorizer'
import { readFile, writeFile } from 'node:fs/promises'

const src = await readFile('./test1.jpg')

const svg = await vectorize(src, {
  colorMode: ColorMode.Color,
  colorPrecision: 6,
  filterSpeckle: 4,
  spliceThreshold: 45,
  cornerThreshold: 60,
  hierarchical: Hierarchical.Stacked,
  mode: PathSimplifyMode.Spline,
  layerDifference: 5,
  lengthThreshold: 5,
  maxIterations: 2,
  pathPrecision: 5
})

console.log(svg) // <svg>...</svg>
await writeFile('./vector.svg', svg)
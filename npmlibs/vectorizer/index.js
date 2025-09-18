import { vectorize, ColorMode, Hierarchical, PathSimplifyMode, Preset } from '@neplex/vectorizer'
import { readFile, writeFile } from 'node:fs/promises'

const src = await readFile('./test1.jpg')

const svg = await vectorize(src, {
  colorMode: ColorMode.Color,
  colorPrecision: 16,
    filterSpeckle: 0,   // keeps all small details, no filtering
    spliceThreshold: 0, // prevents any path merging, keeps all segments
    cornerThreshold: 0, // detects all possible corners
    hierarchical: Hierarchical.Stacked, // preserves all layers
    mode: PathSimplifyMode.Spline, // smooth, detailed curves
    layerDifference: 0, // distinguishes even the smallest layer differences
    lengthThreshold: 0, // keeps even the shortest paths
    maxIterations: 100, // max value for most thorough optimization
    pathPrecision: 1    // lowest value for maximum path detail
})

// const svg = await vectorize(src, Preset.Photo)
// console.log(svg) // <svg>...</svg>
await writeFile('./vector.svg', svg)
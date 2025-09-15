## Parameters

| Name              | Purpose                                                      | Min   | Max   | Optimal | Description/Notes                                  |
|-------------------|--------------------------------------------------------------|-------|-------|---------|----------------------------------------------------|
| colorMode         | Color processing method                                      | Color | Gray  | Color   | Use 'Color' for full color, 'Gray' for grayscale.  |
| colorPrecision    | Precision of color values                                    | 1     | 16    | 6       | Higher = more accurate color, slower processing.   |
| filterSpeckle     | Remove small isolated regions                                | 0     | 100   | 4       | Higher removes more noise, may lose small details. |
| spliceThreshold   | Path joining threshold                                       | 0     | 180   | 45      | Higher joins more paths, may oversimplify.         |
| cornerThreshold   | Sensitivity for corner detection                             | 0     | 180   | 60      | Higher = fewer corners detected.                   |
| hierarchical      | Path grouping method                                         | Flat  | Stacked| Stacked | 'Stacked' for layers, 'Flat' for single layer.     |
| mode              | Path simplification algorithm                                | Linear| Spline | Spline  | 'Spline' for smooth, 'Linear' for straight lines.  |
| layerDifference   | Minimum difference between layers                            | 0     | 100   | 5       | Higher separates more layers.                      |
| lengthThreshold   | Minimum path length to keep                                  | 0     | 100   | 5       | Discards short/noisy paths.                        |
| maxIterations     | Max iterations for optimization                              | 1     | 100   | 2       | More = better result, slower processing.           |
| pathPrecision     | Precision/tolerance for path points                          | 1     | 20    | 5       | Lower = more detail, higher = smoother paths.      |

**Optimal settings** are suggested defaults for general use. If you prioritize accuracy, use the following recommendations:

| Name              | Accuracy-Optimized Setting | Notes                                                      |
|-------------------|---------------------------|------------------------------------------------------------|
| colorMode         | Color                     | Use full color for best detail.                            |
| colorPrecision    | 12                        | Higher precision preserves more color information.          |
| filterSpeckle     | 2                         | Lower value keeps more small details.                      |
| spliceThreshold   | 20                        | Lower value prevents over-simplification of paths.          |
| cornerThreshold   | 30                        | Lower value detects more corners for detailed shapes.       |
| hierarchical      | Stacked                   | Maintains layer separation for complex images.              |
| mode              | Spline                    | Spline mode for smooth, accurate curves.                    |
| layerDifference   | 2                         | Lower value distinguishes subtle layer differences.         |
| lengthThreshold   | 1                         | Keeps even very short paths for maximum detail.             |
| maxIterations     | 10                        | More iterations improve optimization accuracy.              |
| pathPrecision     | 2                         | Lower value increases path detail and fidelity.             |

These settings maximize detail and accuracy, but may increase processing time and resource usage.

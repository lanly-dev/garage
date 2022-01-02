import './style.css'
const d3 = await import('d3')

// 5 rects ------------------------------
const svg = d3.select('#g1').style('background-color', 'lightblue')
const rects = svg.selectAll('rect')
const data1 = [0, 1, 2, 3, 4]

rects
  .data(data1)
  .join('rect')
  .style('fill', 'black')
  .attr('height', 20)
  .attr('width', 20)
  .attr('y', 10)
  .attr('x', (d, i) => 10 + i * 30)

// donut graph ------------------------------
const width = 960
const height = 450
const radius = Math.min(width, height) / 2

const svg2 = d3
  .select('#g2')
  .style('background-color', 'lightblue')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`)

const data2 = { a: 9, b: 20, c: 30, d: 8, e: 12, f: 3, g: 7, h: 14 }

const color = d3.scaleOrdinal().domain(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).range(d3.schemeDark2)

const pie = d3
  .pie()
  .sort(null) // Do not sort group by size
  .value((d) => d[1])

const dataReady = pie(Object.entries(data2))

const arc = d3
  .arc()
  .outerRadius(radius * 0.5)
  .innerRadius(radius * 0.8)

const outerArc = d3
  .arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg2
  .selectAll('allSlices')
  .data(dataReady)
  .join('path')
  .attr('d', arc)
  .attr('fill', (d) => color(d.data[1]))
  .attr('stroke', 'white')
  .style('stroke-width', '2px')
  .style('opacity', 0.7)

// Add the polylines between chart and labels:
svg2
  .selectAll('allPolylines')
  .data(dataReady)
  .join('polyline')
  .attr('stroke', 'black')
  .style('fill', 'none')
  .attr('stroke-width', 1)
  .attr('points', (d) => {
    const posA = arc.centroid(d) // line insertion in the slice
    const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
    const posC = outerArc.centroid(d) // Label position = almost the same as posB
    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1) // multiply by 1 or -1 to put it on the right or on the left
    return [posA, posB, posC]
  })

// Add the polylines between chart and labels:
svg2
  .selectAll('allLabels')
  .data(dataReady)
  .join('text')
  .text((d) => d.data[0])
  .attr('transform', (d) => {
    const pos = outerArc.centroid(d)
    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1)
    return `translate(${pos})`
  })
  .style('text-anchor', (d) => {
    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    return midangle < Math.PI ? 'start' : 'end'
  })

// multi-layers donut graph ------------------------------

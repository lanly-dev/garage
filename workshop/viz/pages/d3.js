import '@bootstrap-css'
import '@bootstrap-js'

const d3 = await import('d3')

// 5 rects ------------------------------
function draw1() {
  const svg = d3.select('#g1').style('background-color', 'lightgrey')
  const rects = svg.selectAll('rect')
  const data = [0, 1, 2, 3, 4]

  rects
    .data(data)
    .join('rect')
    .style('fill', 'black')
    .attr('height', 20)
    .attr('width', 20)
    .attr('y', 10)
    .attr('x', (d, i) => 10 + i * 30)
}

// 5 rects with update
function draw2() {
  const svg = d3.select('#g2').style('background-color', 'lightgrey')
  const rects = svg.selectAll('rect1')
  const data = [0, 1, 2, 3, 4]

  rects
    .data(data)
    .join('rect1')
    .style('fill', 'black')
    .attr('height', 200)
    .attr('width', 200)
    .attr('y', 100)
    .attr('x', (d, i) => 100 + i * 300)
}

// donut graph with labels------------------------------
function draw3() {
  const width = 960
  const height = 450
  const radius = Math.min(width, height) / 2

  const svg = d3
    .select('#g3')
    .style('background-color', 'lightgrey')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  const data = { a: 9, b: 20, c: 30, d: 8, e: 12, f: 3, g: 7, h: 14 }

  const color = d3.scaleOrdinal().domain(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).range(d3.schemeDark2)

  const pie = d3
    .pie()
    .sort(null) // Do not sort group by size
    .value((d) => d[1])

  const dataReady = pie(Object.entries(data))

  const arc = d3
    .arc()
    .outerRadius(radius * 0.5)
    .innerRadius(radius * 0.8)

  const outerArc = d3
    .arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('allSlices')
    .data(dataReady)
    .join('path')
    .attr('d', arc)
    .attr('fill', (d) => color(d.data[1]))
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .style('opacity', 0.7)

  // Add the polylines between chart and labels:
  svg
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
  svg
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
}

// donut graph ------------------------------
function draw4() {
  const w = 960
  const h = 450
  const r = Math.min(w, h) / 2

  const svg = d3
    .select('#g4')
    .style('background-color', 'lightgrey')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .append('g')
    .attr('transform', `translate(${w / 2}, ${h / 2})`)

  const data = { a: 9, b: 20, c: 30, d: 8, e: 12, f: 3, g: 7, h: 14 }

  const c = d3.scaleOrdinal().domain(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).range(d3.schemeDark2)

  const pie = d3
    .pie()
    .sort(null) // Do not sort group by size
    .value((d) => d[1])

  const dataReady = pie(Object.entries(data))

  const arc = d3
    .arc()
    .outerRadius(r * 0.5)
    .innerRadius(r * 0.8)

  const outerArc = d3
    .arc()
    .innerRadius(r * 0.9)
    .outerRadius(r * 0.9)

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('allSlices')
    .data(dataReady)
    .join('path')
    .attr('d', arc)
    .attr('fill', (d) => c(d.data[1]))
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .style('opacity', 0.7)

  function getData() {}
}

draw1()
draw2()
draw3()
draw4()

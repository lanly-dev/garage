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

// multi-layers donut graph ------------------------------

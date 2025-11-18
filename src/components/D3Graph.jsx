import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// D3Graph component: displays bar chart for audio channel peaks
const D3Graph = ({ data }) => {
    const svgRef = useRef(null); // Reference to the SVG DOM element
    const [peaks, setPeaks] = useState({ drums: 0, bass: 0, chords: 0, lead: 0 }); // Store current peak values for channels

    // Update peaks whenever new data comes in
    useEffect(() => {
        if (!data || data.length === 0) return;

        const newPeaks = {};

        // Parse incoming data 
        data.forEach(entry => {
            if (typeof entry === 'string') {
                const parts = entry.split(':');
                const name = parts[0]; // channel name
                const value = parseFloat(parts[1]); // channel value

                // Only update known channels
                if (peaks[name] !== undefined) {
                    newPeaks[name] = value;
                }
            }
        });

        // Merge with previous peaks
        if (Object.keys(newPeaks).length > 0) {
            setPeaks({ ...peaks, ...newPeaks });
        }
    }, [data]);

    // Draw the chart whenever peaks change
    useEffect(() => {
        const config = {
            width: 600,
            height: 220,
            margin: { top: 20, right: 20, bottom: 40, left: 50 }
        };

        const innerWidth = config.width - config.margin.left - config.margin.right;
        const innerHeight = config.height - config.margin.top - config.margin.bottom;

        const channels = ['drums', 'bass', 'chords', 'lead'];
        const colors = {
            drums: '#e74c3c',
            bass: '#3498db',
            chords: '#2ecc71',
            lead: '#f39c12'
        };

        // Select the SVG and clear previous content
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // remove old bars/axes
        svg.attr('width', config.width).attr('height', config.height);

        const chartGroup = svg.append('g')
            .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);

        // X scale: channels
        const xScale = d3.scaleBand()
            .domain(channels)
            .range([0, innerWidth])
            .padding(0.3);

        // Y scale: values from 0 to 1
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([innerHeight, 0]);

        // Y axis
        chartGroup.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(d => `${d * 100}%`)) // show as percentages
            .style('color', '#666');

        // X axis
        chartGroup.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .style('color', '#666');

        // Draw bars for each channel
        channels.forEach(channel => {
            const value = peaks[channel] || 0;
            const barX = xScale(channel);
            const barY = yScale(value);
            const barWidth = xScale.bandwidth();
            const barHeight = innerHeight - barY;

            // Draw bar
            chartGroup.append('rect')
                .attr('x', barX)
                .attr('y', barY)
                .attr('width', barWidth)
                .attr('height', barHeight)
                .attr('fill', colors[channel]);

            // Add value label above the bar
            if (value > 0) {
                chartGroup.append('text')
                    .attr('x', barX + barWidth / 2)
                    .attr('y', barY - 5)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '12px')
                    .style('fill', colors[channel])
                    .text(`${(value * 100).toFixed(0)}%`);
            }
        });
    }, [peaks]); // redraw whenever peaks change

    // Check if there is any data to display
    const hasData = Object.values(peaks).some(v => v > 0);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {/* SVG container for the chart */}
            <svg ref={svgRef} style={{ display: 'block' }}></svg>
        </div>
    );
};

export default D3Graph;

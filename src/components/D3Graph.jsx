import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const D3Graph = ({ data }) => {
    const svgRef = useRef(null);
    const [peaks, setPeaks] = useState({ drums: 0, bass: 0, chords: 0, lead: 0 });

    useEffect(() => {
    if (!data || data.length === 0) return;
    
    const newPeaks = {};
    
    data.forEach(entry => {
            if (typeof entry === 'string') {
                const parts = entry.split(':');
                const name = parts[0];
                const value = parseFloat(parts[1]);
            
                if (peaks[name] !== undefined) {
                    newPeaks[name] = value;
                }
            }
        });
    
        if (Object.keys(newPeaks).length > 0) {
            setPeaks({ ...peaks, ...newPeaks });
        }
    }, [data]);

    useEffect(() => {
        // Chart configuration
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

        // Clear and initialize SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        svg.attr('width', config.width).attr('height', config.height);

        const chartGroup = svg.append('g')
            .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);

        // Create scales
        const xScale = d3.scaleBand()
            .domain(channels)
            .range([0, innerWidth])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([innerHeight, 0]);

        // Add Y axis
        chartGroup.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(d => `${d * 100}%`))
            .style('color', '#666');

        // Add X axis
        chartGroup.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .style('color', '#666');

        // Draw bars and labels
        channels.forEach(channel => {
            const value = peaks[channel] || 0;
            const barX = xScale(channel);
            const barY = yScale(value);
            const barWidth = xScale.bandwidth();
            const barHeight = innerHeight - barY;

            // Bar
            chartGroup.append('rect')
                .attr('x', barX)
                .attr('y', barY)
                .attr('width', barWidth)
                .attr('height', barHeight)
                .attr('fill', colors[channel]);

            // Label
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
    }, [peaks]);

    const hasData = Object.values(peaks).some(v => v > 0);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <svg ref={svgRef} style={{ display: 'block' }}></svg>
            {!hasData && (
                <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#999'
                }}>
                </div>
            )}
        </div>
    );
};

export default D3Graph;
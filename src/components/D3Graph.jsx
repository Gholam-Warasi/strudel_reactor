import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const D3Graph = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Parse current data
        const currentValues = {};
        data.forEach(entry => {
            if (typeof entry !== 'string') return;
            const match = entry.match(/(\w+):([\d.]+)/);
            if (match) {
                currentValues[match[1]] = parseFloat(match[2]);
            }
        });

        // Add to history (keep last 50 snapshots)
        setHistory(prev => {
            const newHistory = [...prev, { timestamp: Date.now(), values: currentValues }];
            return newHistory.slice(-50);
        });
    }, [data]);

    useEffect(() => {
        if (history.length === 0) return;

        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 600;
        const height = 350;
        const margin = { top: 30, right: 20, bottom: 50, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Clear previous SVG
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Define channels and colors
        const channels = ['drums', 'bass', 'chords', 'lead'];
        const colorScale = {
            'drums': '#e74c3c',
            'bass': '#3498db',
            'chords': '#2ecc71',
            'lead': '#f39c12'
        };

        // Prepare data for each channel
        const channelData = channels.map(channel => ({
            channel,
            values: history.map((snapshot, i) => ({
                index: i,
                value: snapshot.values[channel] || 0,
                timestamp: snapshot.timestamp
            }))
        }));

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, Math.max(49, history.length - 1)])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([innerHeight, 0]);

        // Add gradient definitions
        const defs = svg.append('defs');
        channels.forEach(channel => {
            const gradient = defs.append('linearGradient')
                .attr('id', `gradient-${channel}`)
                .attr('x1', '0%')
                .attr('x2', '0%')
                .attr('y1', '0%')
                .attr('y2', '100%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', colorScale[channel])
                .attr('stop-opacity', 0.6);

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', colorScale[channel])
                .attr('stop-opacity', 0.1);
        });

        // Grid
        g.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.15)
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickSize(-innerWidth)
                .tickFormat('')
            );

        // Axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(5))
            .style('font-size', '11px');

        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d.toFixed(1)))
            .style('font-size', '11px');

        // Axis labels
        g.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + 40)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#666')
            .text('Time →');

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerHeight / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#666')
            .text('Gain Level');

        // Area generator
        const area = d3.area()
            .x(d => xScale(d.index))
            .y0(innerHeight)
            .y1(d => yScale(d.value))
            .curve(d3.curveCatmullRom);

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.index))
            .y(d => yScale(d.value))
            .curve(d3.curveCatmullRom);

        // Draw areas and lines
        channelData.forEach(({ channel, values }) => {
            if (values.length === 0) return;

            // Draw filled area
            g.append('path')
                .datum(values)
                .attr('fill', `url(#gradient-${channel})`)
                .attr('d', area)
                .attr('opacity', 0.6);

            // Draw line
            g.append('path')
                .datum(values)
                .attr('fill', 'none')
                .attr('stroke', colorScale[channel])
                .attr('stroke-width', 2.5)
                .attr('d', line);

            // Add glow effect to current point
            const lastPoint = values[values.length - 1];
            if (lastPoint) {
                g.append('circle')
                    .attr('cx', xScale(lastPoint.index))
                    .attr('cy', yScale(lastPoint.value))
                    .attr('r', 6)
                    .attr('fill', colorScale[channel])
                    .attr('opacity', 0.3);

                g.append('circle')
                    .attr('cx', xScale(lastPoint.index))
                    .attr('cy', yScale(lastPoint.value))
                    .attr('r', 4)
                    .attr('fill', colorScale[channel])
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
            }
        });

        // Legend with current values
        const legend = g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(10, -20)`);

        const latestValues = history[history.length - 1]?.values || {};

        channels.forEach((channel, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(${i * (innerWidth / 4)}, 0)`);

            legendRow.append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('r', 6)
                .attr('fill', colorScale[channel]);

            legendRow.append('text')
                .attr('x', 12)
                .attr('y', 4)
                .style('font-size', '12px')
                .style('font-weight', '600')
                .style('fill', colorScale[channel])
                .style('text-transform', 'capitalize')
                .text(channel);

            legendRow.append('text')
                .attr('x', 12)
                .attr('y', 4)
                .attr('dx', channel.length * 7)
                .style('font-size', '11px')
                .style('fill', '#666')
                .text(` ${(latestValues[channel] || 0).toFixed(3)}`);
        });

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .style('fill', '#333')
            .text('Channel Gain History');

    }, [history]);

    return (
        <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
            <svg ref={svgRef} style={{ display: 'block', width: '100%' }}></svg>
            {history.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#999',
                    fontStyle: 'italic',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    margin: '20px 0'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎵</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        Waiting for audio data...
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        Adjust controls to see the visualization
                    </div>
                </div>
            )}
        </div>
    );
};

export default D3Graph;
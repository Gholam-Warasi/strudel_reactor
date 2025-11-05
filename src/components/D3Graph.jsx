import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const D3Graph = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [peaks, setPeaks] = useState({ drums: 0, bass: 0, chords: 0, lead: 0 });
    const animationRef = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Parse current data and update peaks
        const newPeaks = { drums: 0, bass: 0, chords: 0, lead: 0 };
        data.forEach(entry => {
            if (typeof entry !== 'string') return;
            const match = entry.match(/(\w+):([\d.]+)/);
            if (match) {
                newPeaks[match[1]] = parseFloat(match[2]);
            }
        });

        setPeaks(newPeaks);
    }, [data]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 600;
        const height = 400;
        const margin = { top: 40, right: 20, bottom: 20, left: 20 };
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

        const channelWidth = innerWidth / channels.length;
        const barWidth = channelWidth * 0.7;
        const spacing = channelWidth * 0.15;

        // Add gradients for each channel
        const defs = svg.append('defs');
        channels.forEach(channel => {
            const gradient = defs.append('linearGradient')
                .attr('id', `bar-gradient-${channel}`)
                .attr('x1', '0%')
                .attr('x2', '0%')
                .attr('y1', '0%')
                .attr('y2', '100%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', d3.color(colorScale[channel]).brighter(0.5))
                .attr('stop-opacity', 1);

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', colorScale[channel])
                .attr('stop-opacity', 1);

            // Glow filter
            const filter = defs.append('filter')
                .attr('id', `glow-${channel}`)
                .attr('x', '-50%')
                .attr('y', '-50%')
                .attr('width', '200%')
                .attr('height', '200%');

            filter.append('feGaussianBlur')
                .attr('stdDeviation', '4')
                .attr('result', 'coloredBlur');

            const feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode').attr('in', 'coloredBlur');
            feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
        });

        // Scale
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([innerHeight, 0]);

        // Draw background bars (track outline)
        channels.forEach((channel, i) => {
            const x = i * channelWidth + spacing;

            // Background track
            g.append('rect')
                .attr('x', x)
                .attr('y', 0)
                .attr('width', barWidth)
                .attr('height', innerHeight)
                .attr('fill', '#2c3e50')
                .attr('opacity', 0.2)
                .attr('rx', 8);

            // Grid lines inside track
            for (let j = 0; j <= 10; j++) {
                g.append('line')
                    .attr('x1', x)
                    .attr('x2', x + barWidth)
                    .attr('y1', (innerHeight / 10) * j)
                    .attr('y2', (innerHeight / 10) * j)
                    .attr('stroke', '#95a5a6')
                    .attr('stroke-width', 1)
                    .attr('opacity', 0.2);
            }
        });

        // Draw peak indicators and bars
        channels.forEach((channel, i) => {
            const x = i * channelWidth + spacing;
            const value = peaks[channel] || 0;
            const barHeight = innerHeight * value;

            // Animated bar group
            const barGroup = g.append('g')
                .attr('class', `bar-${channel}`);

            // Main bar
            barGroup.append('rect')
                .attr('x', x)
                .attr('y', innerHeight - barHeight)
                .attr('width', barWidth)
                .attr('height', barHeight)
                .attr('fill', `url(#bar-gradient-${channel})`)
                .attr('filter', `url(#glow-${channel})`)
                .attr('rx', 8);

            // Peak indicator line
            if (value > 0.05) {
                barGroup.append('rect')
                    .attr('x', x - 5)
                    .attr('y', innerHeight - barHeight - 3)
                    .attr('width', barWidth + 10)
                    .attr('height', 6)
                    .attr('fill', colorScale[channel])
                    .attr('opacity', 0.8)
                    .attr('rx', 3);
            }

            // Value text on top
            barGroup.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', Math.max(20, innerHeight - barHeight - 15))
                .attr('text-anchor', 'middle')
                .style('font-size', '18px')
                .style('font-weight', '700')
                .style('fill', colorScale[channel])
                .style('text-shadow', '0 0 10px rgba(0,0,0,0.5)')
                .text((value * 100).toFixed(0) + '%');

            // Channel label at bottom
            g.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', innerHeight + 18)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('font-weight', '600')
                .style('fill', colorScale[channel])
                .style('text-transform', 'uppercase')
                .text(channel);

            // Exact value below label
            g.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', innerHeight + 35)
                .attr('text-anchor', 'middle')
                .style('font-size', '11px')
                .style('fill', '#7f8c8d')
                .text(value.toFixed(3));
        });

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', '700')
            .style('fill', '#2c3e50')
            .text('LIVE CHANNEL METERS');

    }, [peaks]);

    return (
        <div ref={containerRef} style={{
            width: '100%',
            overflow: 'hidden',
            backgroundColor: '#ecf0f1',
            borderRadius: '8px',
            padding: '10px'
        }}>
            <svg ref={svgRef} style={{ display: 'block', width: '100%' }}></svg>
            {Object.values(peaks).every(v => v === 0) && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    padding: '40px',
                    color: '#95a5a6',
                    fontStyle: 'italic',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '8px',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                        Waiting for audio...
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        Adjust mixer controls to see meters
                    </div>
                </div>
            )}
        </div>
    );
};

export default D3Graph;
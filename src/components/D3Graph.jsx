import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const D3Graph = ({ data }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    // Use state to store only the *current* peaks
    const [peaks, setPeaks] = useState({ drums: 0, bass: 0, chords: 0, lead: 0 });

    // This effect updates the state when new data arrives
    useEffect(() => {
        if (!data || data.length === 0) return;

        const newPeaks = { ...peaks }; // Start with previous peaks
        let hasNewData = false;

        data.forEach(entry => {
            if (typeof entry !== 'string') return;
            const match = entry.match(/(\w+):([\d.]+)/);
            if (match && newPeaks.hasOwnProperty(match[1])) {
                newPeaks[match[1]] = parseFloat(match[2]);
                hasNewData = true;
            }
        });

        if (hasNewData) {
            setPeaks(newPeaks);
        }
    }, [data]); // Only re-run when 'data' prop changes

    // This effect re-draws the graph when 'peaks' state changes
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 600;
        const height = 220; // Use the height from your line graph
        const margin = { top: 30, right: 30, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Background (from your line chart)
        g.append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('fill', '#1a1a2e')
            .attr('rx', 4);

        const channels = ['drums', 'bass', 'chords', 'lead'];
        const colors = {
            drums: '#e74c3c',
            bass: '#3498db',
            chords: '#2ecc71',
            lead: '#f39c12'
        };

        // X Scale (Band) - for categorical bars
        const xScale = d3.scaleBand()
            .domain(channels)
            .range([0, innerWidth])
            .padding(0.2);

        // Y Scale (Linear) - for values 0 to 1
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([innerHeight, 0]);

        // Y-axis grid and labels (from your line chart)
        const yTicks = [0, 0.25, 0.5, 0.75, 1];
        yTicks.forEach(tick => {
            g.append('line')
                .attr('x1', 0)
                .attr('x2', innerWidth)
                .attr('y1', yScale(tick))
                .attr('y2', yScale(tick))
                .attr('stroke', '#34495e')
                .attr('stroke-width', 1)
                .attr('opacity', 0.3);

            g.append('text')
                .attr('x', -10)
                .attr('y', yScale(tick))
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'middle')
                .style('font-size', '10px')
                .style('fill', '#7f8c8d')
                .text((tick * 100).toFixed(0) + '%');
        });

        // X-axis labels
        g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .style('fill', '#ecf0f1')
            .style('font-size', '11px');

        // Remove X-axis line
        g.selectAll('.domain').remove();

        // Draw Bars
        channels.forEach(channel => {
            const value = peaks[channel] || 0;

            // Bar
            g.append('rect')
                .attr('x', xScale(channel))
                .attr('y', yScale(value))
                .attr('width', xScale.bandwidth())
                .attr('height', innerHeight - yScale(value))
                .attr('fill', colors[channel])
                .attr('opacity', 0.8);

            // Value text on top
            g.append('text')
                .attr('x', xScale(channel) + xScale.bandwidth() / 2)
                .attr('y', yScale(value) - 5) // 5px above the bar
                .attr('text-anchor', 'middle')
                .style('font-size', '11px')
                .style('font-weight', '600')
                .style('fill', colors[channel])
                .text((value * 100).toFixed(0) + '%');
        });

        // Title (from your line chart)
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 20) // Adjusted for margin
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '700')
            .style('fill', '#ecf0f1')
            .text('LIVE AUDIO METERS');

    }, [peaks]); // Re-run this effect only when 'peaks' state changes

    // Check current peaks, not history
    const hasData = Object.values(peaks).some(v => v > 0);

    return (
        // This JSX is from your line chart, it's perfect
        <div ref={containerRef} style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: '8px',
            position: 'relative',
            backgroundColor: '#0f0f1e',
            padding: '10px'
        }}>
            <svg ref={svgRef} style={{ display: 'block', width: '100%' }}></svg>
            {!hasData && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    padding: '20px',
                    color: '#95a5a6',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '8px',
                    pointerEvents: 'none'
                }}>
                    
                    <div style={{ fontSize: '11px' }}>
                        Play your Strudel pattern
                    </div>
                </div>
            )}
        </div>
    );
};

export default D3Graph;
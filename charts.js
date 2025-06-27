// Shared color palette for hours (0-23), high-contrast and visually distinct
const BAR_MAP_HOUR_COLORS = [
    '#FF0000',   // 0 Red
    '#0074D9',   // 1 Blue
    '#2ECC40',   // 2 Green
    '#FFDC00',   // 3 Yellow
    '#FF851B',   // 4 Orange
    '#B10DC9',   // 5 Purple
    '#111111',   // 6 Black
    '#7FDBFF',   // 7 Cyan
    '#F012BE',   // 8 Magenta
    '#01FF70',   // 9 Lime
    '#85144b',   // 10 Maroon
    '#AAAAAA',   // 11 Gray
    '#FF4136',   // 12 Bright Red
    '#39CCCC',   // 13 Teal
    '#3D9970',   // 14 Olive
    '#F39C12',   // 15 Gold
    '#8B4513',   // 16 Saddle Brown
    '#E67E22',   // 17 Carrot Orange
    '#2980B9',   // 18 Strong Blue
    '#E74C3C',   // 19 Strong Red
    '#16A085',   // 20 Dark Cyan
    '#D35400',   // 21 Pumpkin
    '#34495E',   // 22 Dark Blue Gray
    '#C0392B'    // 23 Strong Maroon
];
window.BAR_MAP_HOUR_COLORS = BAR_MAP_HOUR_COLORS;

// Global variables for charts
let barChart, scatterPlot;
let barData, scatterData;
let allChartData = [];
let currentFilteredData = []; // Track currently filtered data

// Initialize all charts
function initCharts(trips) {
    allChartData = trips;
    currentFilteredData = trips; // Initialize with all data
    processChartData(trips);
    createBarChart();
    createScatterPlot();
}

// Process data for charts
function processChartData(trips) {
    // Process data for bar chart (trips by hour)
    const hourCounts = d3.rollup(trips, v => v.length, d => {
        const startTime = new Date(d.properties.starttime);
        return startTime.getHours();
    });
    
    barData = Array.from({length: 24}, (_, i) => ({
        hour: i,
        count: hourCounts.get(i) || 0
    }));
    
    // Process data for scatter plot (speed vs distance)
    scatterData = trips.map((trip, index) => ({
        id: index,
        distance: trip.properties.distance / 1000, // Convert meters to kilometers
        speed: trip.properties.avspeed,
        duration: trip.properties.duration,
        startTime: new Date(trip.properties.starttime),
        trip: trip
    })).filter(d => d.distance > 0 && d.speed > 0); // Filter out invalid data
}

// Create bar chart
function createBarChart() {
    const margin = {top: 20, right: 20, bottom: 40, left: 60};
    const width = document.getElementById('barChart').clientWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;
    
    // Clear existing chart
    d3.select('#barChart').selectAll('*').remove();
    
    const svg = d3.select('#barChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Define patterns for selected and clicked states
    const defs = svg.append('defs');
    
    // Pattern for selected bars (red diagonal stripes)
    const selectedPattern = defs.append('pattern')
        .attr('id', 'selectedPattern')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 8)
        .attr('height', 8);
    
    selectedPattern.append('rect')
        .attr('width', 8)
        .attr('height', 8)
        .attr('fill', 'transparent');
    
    selectedPattern.append('path')
        .attr('d', 'M0,8 l8,-8 M-2,2 l4,-4 M6,10 l4,-4')
        .attr('stroke', 'rgba(231, 76, 60, 0.6)')
        .attr('stroke-width', 2);
    
    // Pattern for clicked bars (dark diagonal stripes)
    const clickedPattern = defs.append('pattern')
        .attr('id', 'clickedPattern')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 6)
        .attr('height', 6);
    
    clickedPattern.append('rect')
        .attr('width', 6)
        .attr('height', 6)
        .attr('fill', 'transparent');
    
    clickedPattern.append('path')
        .attr('d', 'M0,6 l6,-6 M-1,1 l2,-2 M5,7 l2,-2')
        .attr('stroke', 'rgba(44, 62, 80, 0.7)')
        .attr('stroke-width', 2);
    
    // For the bar chart, only show hours up to and including 13:00
    const visibleBarData = barData.filter(d => d.hour <= 13);
    console.log('Visible hours:', visibleBarData.map(d => d.hour));
    if (visibleBarData.length === 0) {
        d3.select('#barChart').append('div')
          .text('No data for hours 0-13')
          .style('color', 'red')
          .style('text-align', 'center');
        return;
    }
    const xDomain = visibleBarData.map(d => d.hour);
    const x = d3.scaleBand()
        .range([0, width])
        .domain(xDomain)
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(visibleBarData, d => d.count) || 1])
        .range([height, 0]);
    
    // Color scale for bars
    const color = d3.scaleOrdinal()
        .domain(xDomain)
        .range(xDomain.map(h => BAR_MAP_HOUR_COLORS[h % 24]));
    
    // Axes
    const xAxis = d3.axisBottom(x)
        .tickValues(xDomain)
        .tickFormat(d => `${d}:00`);
    
    const yAxis = d3.axisLeft(y);
    
    // Add axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'axis')
        .call(yAxis);
    
    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .text('Hour of Day');
    
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .text('Number of Trips');
    
    // Add bars
    const barGroups = svg.selectAll('.bar-group')
        .data(visibleBarData)
        .enter().append('g')
        .attr('class', 'bar-group');
    
    // Add main colored bars
    barGroups.append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.hour))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .attr('fill', (d, i) => color(d.hour));
    
    // Add pattern overlay bars (initially hidden)
    barGroups.append('rect')
        .attr('class', 'bar-overlay')
        .attr('x', d => x(d.hour))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count))
        .attr('fill', 'transparent')
        .attr('pointer-events', 'none'); // Don't interfere with mouse events
    
    // Add mouse events to the bar groups
    barGroups
        .on('mouseover', function(event, d) {
            // Highlight bars
            d3.select(this).select('.bar').classed('selected', true);
            d3.select(this).select('.bar-overlay').attr('fill', 'url(#selectedPattern)');
            // Show tooltip
            showTooltip(event, `Hour ${d.hour}:00<br>${d.count} trips`);
        })
        .on('mouseout', function(event, d) {
            // Remove highlight
            d3.select(this).select('.bar').classed('selected', false);
            if (!d3.select(this).select('.bar').classed('clicked')) {
                d3.select(this).select('.bar-overlay').attr('fill', 'transparent');
            }
            // Hide tooltip
            hideTooltip();
        })
        .on('click', function(event, d) {
            // Remove 'clicked' class from all bars
            d3.selectAll('.bar').classed('clicked', false);
            d3.selectAll('.bar-overlay').attr('fill', 'transparent');
            
            // Add 'clicked' class to the clicked bar
            d3.select(this).select('.bar').classed('clicked', true);
            d3.select(this).select('.bar-overlay').attr('fill', 'url(#clickedPattern)');
            
            // Filter data for the selected hour
            const filteredTrips = allChartData.filter(trip => {
                const startTime = new Date(trip.properties.starttime);
                return startTime.getHours() === d.hour;
            });
            
            currentFilteredData = filteredTrips;
            
            // Update scatter plot with filtered data
            updateScatterPlotData(filteredTrips);
            
            // Update stats
            updateStatsForFilter(filteredTrips, d.hour);
            
            // Use interactivity system to update the map
            if (window.interactivityFunctions) {
                window.interactivityFunctions.filterByHour(d.hour);
            } else {
                // Fallback: directly update map if interactivity system not available
                if (window.mapFunctions) {
                    window.mapFunctions.drawTrips(filteredTrips);
                }
            }
        });
    
    barChart = svg;
}

// Create scatter plot
function createScatterPlot() {
    const margin = {top: 20, right: 20, bottom: 40, left: 60};
    const width = document.getElementById('scatterPlot').clientWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;
    
    // Clear existing chart
    d3.select('#scatterPlot').selectAll('*').remove();
    
    const svg = d3.select('#scatterPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d.distance)])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d.speed)])
        .range([height, 0]);
    
    // Axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
    
    // Add axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'axis')
        .call(yAxis);
    
    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .text('Distance (km)');
    
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .text('Average Speed (km/h)');
    
    // Add dots
    svg.selectAll('.dot')
        .data(scatterData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.distance))
        .attr('cy', d => y(d.speed))
        .attr('r', 3)
        .attr('fill', d => {
            const hour = d.startTime.getHours();
            return BAR_MAP_HOUR_COLORS[hour % 24];
        })
        .attr('stroke', d => {
            const hour = d.startTime.getHours();
            return BAR_MAP_HOUR_COLORS[hour % 24];
        })
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
            // Highlight dot
            d3.select(this).classed('selected', true);
            
            // Highlight the corresponding trip on the map without filtering
            if (window.mapFunctions) {
                window.mapFunctions.highlightTrip(d.trip);
            }
            
            // Show tooltip
            showTooltip(event, `
                Trip ID: ${d.trip.properties.tripid}<br>
                Taxi ID: ${d.trip.properties.taxiid}<br>
                Distance: ${d.distance.toFixed(2)} km<br>
                Speed: ${d.speed.toFixed(1)} km/h<br>
                Duration: ${(d.duration / 60).toFixed(1)} min
            `);
        })
        .on('mouseout', function(event, d) {
            // Remove highlight
            d3.select(this).classed('selected', false);
            
            // Remove trip highlighting but don't change the displayed trips
            if (window.mapFunctions) {
                // Reset all trip styles to normal without changing what trips are displayed
                window.mapFunctions.resetTripStyles();
            }
            
            // Hide tooltip
            hideTooltip();
        })
        .on('click', function(event, d) {
            // Remove 'clicked' class from all dots
            d3.selectAll('.dot').classed('clicked', false);
            // Add 'clicked' class to the clicked dot
            d3.select(this).classed('clicked', true);
            
            // Show only this trip on the map with GPS markers
            if (window.mapFunctions) {
                window.mapFunctions.drawTrips([d.trip]);
            }
            
            displayTripInfo(d.trip);
            
            console.log(`Scatter plot point clicked - Trip ID: ${d.trip.properties.tripid}, Distance: ${d.distance.toFixed(2)}km, Speed: ${d.speed.toFixed(1)}km/h`);
        });
    
    scatterPlot = svg;
}

// Update scatter plot data without recreating the entire chart
function updateScatterPlotData(trips) {
    // Process filtered data for scatter plot
    const filteredScatterData = trips.map((trip, index) => ({
        id: index,
        distance: trip.properties.distance / 1000, // Convert meters to kilometers
        speed: trip.properties.avspeed,
        duration: trip.properties.duration,
        startTime: new Date(trip.properties.starttime),
        trip: trip
    })).filter(d => d.distance > 0 && d.speed > 0);
    
    // Update the scatter plot with new data
    updateScatterPlotVisualization(filteredScatterData);
}

// Update scatter plot visualization with new data
function updateScatterPlotVisualization(data) {
    const margin = {top: 20, right: 20, bottom: 40, left: 60};
    const width = document.getElementById('scatterPlot').clientWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;
    
    // Clear existing chart
    d3.select('#scatterPlot').selectAll('*').remove();
    
    const svg = d3.select('#scatterPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.distance)])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.speed)])
        .range([height, 0]);
    
    // Axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
    
    // Add axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'axis')
        .call(yAxis);
    
    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .text('Distance (km)');
    
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .text('Average Speed (km/h)');
    
    // Add dots
    svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.distance))
        .attr('cy', d => y(d.speed))
        .attr('r', 3)
        .attr('fill', d => {
            const hour = d.startTime.getHours();
            return BAR_MAP_HOUR_COLORS[hour % 24];
        })
        .attr('stroke', d => {
            const hour = d.startTime.getHours();
            return BAR_MAP_HOUR_COLORS[hour % 24];
        })
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
            // Highlight dot
            d3.select(this).classed('selected', true);
            
            // Highlight the corresponding trip on the map without filtering
            if (window.mapFunctions) {
                window.mapFunctions.highlightTrip(d.trip);
            }
            
            // Show tooltip
            showTooltip(event, `
                Trip ID: ${d.trip.properties.tripid}<br>
                Taxi ID: ${d.trip.properties.taxiid}<br>
                Distance: ${d.distance.toFixed(2)} km<br>
                Speed: ${d.speed.toFixed(1)} km/h<br>
                Duration: ${(d.duration / 60).toFixed(1)} min
            `);
        })
        .on('mouseout', function(event, d) {
            // Remove highlight
            d3.select(this).classed('selected', false);
            
            // Remove trip highlighting but don't change the displayed trips
            if (window.mapFunctions) {
                // Reset all trip styles to normal without changing what trips are displayed
                window.mapFunctions.resetTripStyles();
            }
            
            // Hide tooltip
            hideTooltip();
        })
        .on('click', function(event, d) {
            // Remove 'clicked' class from all dots
            d3.selectAll('.dot').classed('clicked', false);
            // Add 'clicked' class to the clicked dot
            d3.select(this).classed('clicked', true);
            
            // Show only this trip on the map with GPS markers
            if (window.mapFunctions) {
                window.mapFunctions.drawTrips([d.trip]);
            }
            
            displayTripInfo(d.trip);
            
            console.log(`Scatter plot point clicked - Trip ID: ${d.trip.properties.tripid}, Distance: ${d.distance.toFixed(2)}km, Speed: ${d.speed.toFixed(1)}km/h`);
        });
    
    scatterPlot = svg;
}

// Update stats for filtered data
function updateStatsForFilter(filteredTrips, hour) {
    const totalTrips = allChartData.length;
    const filteredCount = filteredTrips.length;
    
    document.getElementById('totalTrips').textContent = `Total Trips: ${totalTrips}`;
    document.getElementById('selectedTrips').textContent = `Filtered: ${filteredCount} (Hour ${hour}:00)`;
}

// Display trip information under the map
function displayTripInfo(trip) {
    const tripInfoPanel = document.getElementById('tripInfo');
    const tripInfoContent = document.getElementById('tripInfoContent');
    
    if (!trip || !trip.properties) {
        tripInfoPanel.style.display = 'none';
        return;
    }
    
    const props = trip.properties;
    const startTime = new Date(props.starttime);
    const endTime = new Date(props.endtime);
    
    // Format time for display
    const formatTime = (date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    
    tripInfoContent.innerHTML = `
        <div class="trip-info-item">
            <span class="trip-info-label">Trip ID:</span>
            <span class="trip-info-value">${props.tripid}</span>
        </div>
        <div class="trip-info-item">
            <span class="trip-info-label">Taxi ID:</span>
            <span class="trip-info-value">${props.taxiid}</span>
        </div>
        <div class="trip-info-item">
            <span class="trip-info-label">Start Time:</span>
            <span class="trip-info-value">${formatTime(startTime)}</span>
        </div>
        <div class="trip-info-item">
            <span class="trip-info-label">End Time:</span>
            <span class="trip-info-value">${formatTime(endTime)}</span>
        </div>
        <div class="trip-info-item">
            <span class="trip-info-label">Distance:</span>
            <span class="trip-info-value">${(props.distance / 1000).toFixed(2)} km</span>
        </div>
        <div class="trip-info-item">
            <span class="trip-info-label">Duration:</span>
            <span class="trip-info-value">${(props.duration / 60).toFixed(1)} min</span>
        </div>
        <div class="trip-info-item">
            <span class="trip-info-label">Avg Speed:</span>
            <span class="trip-info-value">${props.avspeed.toFixed(1)} km/h</span>
        </div>
        <div class="trip-info-item">
            <span class="trip-info-label">Max Speed:</span>
            <span class="trip-info-value">${props.maxspeed.toFixed(1)} km/h</span>
        </div>
    `;
    
    tripInfoPanel.style.display = 'block';
}

// Hide trip information panel
function hideTripInfo() {
    const tripInfoPanel = document.getElementById('tripInfo');
    tripInfoPanel.style.display = 'none';
}

// Update charts when a trip is selected
function updateChartsForSelection(selectedTrip) {
    if (!selectedTrip || !selectedTrip.properties) {
        console.warn('updateChartsForSelection: selectedTrip is invalid or missing properties', selectedTrip);
        return;
    }
    
    const startTime = new Date(selectedTrip.properties.starttime);
    const selectedHour = startTime.getHours();
    
    // Highlight bar in bar chart
    d3.selectAll('.bar')
        .classed('selected', (d, i, nodes) => d.hour === selectedHour);
    
    // Highlight dot in scatter plot
    const tripIndex = currentFilteredData.findIndex(trip => trip === selectedTrip);
    d3.selectAll('.dot')
        .classed('selected', (d, i, nodes) => d.id === tripIndex);
    
    // Display trip information under the map
    displayTripInfo(selectedTrip);
}

// Update charts when data is filtered
function updateChartsForFilter(filteredTrips) {
    // Update the current filtered data
    currentFilteredData = filteredTrips;
    
    // Only update the scatter plot with filtered data
    // The bar chart should always show all hours
    updateScatterPlotData(filteredTrips);
    
    // Update bar chart highlighting based on the filtered data
    // Find which hour is being filtered (if any)
    if (filteredTrips.length > 0) {
        const firstTrip = filteredTrips[0];
        const startTime = new Date(firstTrip.properties.starttime);
        const filteredHour = startTime.getHours();
        
        // Highlight the corresponding bar but keep all bars visible
        d3.selectAll('.bar')
            .classed('clicked', (d) => d.hour === filteredHour);
    }
}

// Reset charts to show all data
function resetCharts() {
    // Remove all selections
    d3.selectAll('.bar, .dot').classed('selected clicked', false);
    
    // Hide trip information panel
    hideTripInfo();
    
    // Reset to show all data
    currentFilteredData = allChartData;
    processChartData(allChartData);
    createBarChart();
    createScatterPlot();
    
    // Update stats
    document.getElementById('totalTrips').textContent = `Total Trips: ${allChartData.length}`;
    document.getElementById('selectedTrips').textContent = `Selected: 0`;
}

// Tooltip functions
function showTooltip(event, content) {
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    tooltip.transition()
        .duration(200)
        .style('opacity', 1);
    
    tooltip.html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
}

function hideTooltip() {
    d3.selectAll('.tooltip').remove();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (barChart && scatterPlot) {
        createBarChart();
        createScatterPlot();
    }
});

// Export functions for interactivity
window.chartFunctions = {
    updateChartsForSelection,
    updateChartsForFilter,
    resetCharts,
    displayTripInfo,
    hideTripInfo
}; 
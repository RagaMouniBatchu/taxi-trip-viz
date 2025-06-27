// Global variables for map and data
let map;
let tripLayers = [];
let allTrips = [];
let filteredTrips = [];
let currentDisplayedTrips = []; // Track currently displayed trips
let startMarker = null; // Marker for trip start point
let endMarker = null; // Marker for trip end point

// Initialize the map
function initMap() {
    // Create map centered on average coordinates (will be updated after data load)
    map = L.map('map').setView([41.1446, -8.6063], 12);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    console.log('Map initialized');
}

// Load and process trip data
async function loadTripData() {
    try {
        const response = await fetch('data/trips.json');
        const data = await response.json();
        
        allTrips = data.features;
        filteredTrips = [...allTrips];
        currentDisplayedTrips = [...allTrips];
        
        // Make allTrips globally accessible
        window.allTrips = allTrips;
        
        console.log(`Loaded ${allTrips.length} trips`);
        
        // Update stats
        document.getElementById('totalTrips').textContent = `Total Trips: ${allTrips.length}`;
        
        // Calculate center coordinates
        const centerCoords = calculateMapCenter(allTrips);
        map.setView(centerCoords, 12);
        
        // Draw all trips
        drawTrips(allTrips);
        
        // Initialize charts after data is loaded
        if (typeof initCharts === 'function') {
            initCharts(allTrips);
        }
        
    } catch (error) {
        console.error('Error loading trip data:', error);
        document.getElementById('totalTrips').textContent = 'Error loading data';
    }
}

// Calculate center coordinates from all trips
function calculateMapCenter(trips) {
    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;
    
    trips.forEach(trip => {
        if (trip.geometry.coordinates && trip.geometry.coordinates.length > 0) {
            trip.geometry.coordinates.forEach(coord => {
                totalLng += coord[0];
                totalLat += coord[1];
                pointCount++;
            });
        }
    });
    
    return [totalLat / pointCount, totalLng / pointCount];
}

// Draw trips on the map
function drawTrips(trips) {
    // Clear existing layers
    clearMapLayers();
    
    // Update current displayed trips
    currentDisplayedTrips = trips;
    
    // Handle GPS markers based on number of trips
    if (trips.length === 1) {
        // Single trip - add GPS markers
        addTripMarkers(trips[0]);
    } else {
        // Multiple trips - remove GPS markers
        removeTripMarkers();
    }
    
    trips.forEach((trip, index) => {
        if (trip.geometry.coordinates && trip.geometry.coordinates.length > 1) {
            const coordinates = trip.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const properties = trip.properties;
            
            // Create polyline for the trip
            // Use thicker line for single trip, normal thickness for multiple trips
            const lineWeight = trips.length === 1 ? 5 : 2;
            const lineOpacity = trips.length === 1 ? 1 : 0.7;
            
            const polyline = L.polyline(coordinates, {
                color: getTripColor(properties),
                weight: lineWeight,
                opacity: lineOpacity
            }).addTo(map);
            
            // Add popup with trip information
            const popupContent = `
                <div class="trip-popup">
                    <h4>Trip ID: ${properties.tripid}</h4>
                    <p><strong>Taxi ID:</strong> ${properties.taxiid}</p>
                    <p><strong>Start:</strong> ${properties.starttime}</p>
                    <p><strong>End:</strong> ${properties.endtime}</p>
                    <p><strong>Distance:</strong> ${properties.distance.toFixed(2)} km</p>
                    <p><strong>Duration:</strong> ${(properties.duration / 60).toFixed(1)} min</p>
                    <p><strong>Avg Speed:</strong> ${properties.avspeed.toFixed(1)} km/h</p>
                    <p><strong>Max Speed:</strong> ${properties.maxspeed.toFixed(1)} km/h</p>
                </div>
            `;
            
            polyline.bindPopup(popupContent);
            
            // Add hover events to display trip information as map tooltip
            polyline.on('mouseover', (e) => {
                // Create trip information tooltip content
                const tooltipContent = `
                    <div style="font-family: 'Segoe UI', sans-serif; font-size: 12px; line-height: 1.4;">
                        <strong style="color: #2c3e50; font-size: 13px;">Trip ID: ${properties.tripid}</strong><br>
                        <strong>Taxi ID:</strong> ${properties.taxiid}<br>
                        <strong>Distance:</strong> ${(properties.distance / 1000).toFixed(2)} km<br>
                        <strong>Duration:</strong> ${(properties.duration / 60).toFixed(1)} min<br>
                        <strong>Avg Speed:</strong> ${properties.avspeed.toFixed(1)} km/h<br>
                        <strong>Start:</strong> ${new Date(properties.starttime).toLocaleTimeString()}<br>
                        <strong>End:</strong> ${new Date(properties.endtime).toLocaleTimeString()}
                    </div>
                `;
                
                // Show tooltip at mouse position
                polyline.bindTooltip(tooltipContent, {
                    permanent: false,
                    direction: 'top',
                    offset: [0, -10],
                    className: 'trip-hover-tooltip'
                }).openTooltip(e.latlng);
                
                // Highlight this trip on the map
                highlightTrip(trip);
            });
            
            polyline.on('mouseout', () => {
                // Close and unbind the tooltip
                polyline.closeTooltip();
                polyline.unbindTooltip();
                
                // Reset trip styles
                resetTripStyles();
            });
            
            // Add click event for interactivity
            polyline.on('click', () => {
                selectTrip(index, trip);
            });
            
            // Store layer reference
            tripLayers.push({
                layer: polyline,
                tripIndex: index,
                trip: trip
            });
        }
    });
}

// Get color for trip based on properties
function getTripColor(properties) {
    const startTime = new Date(properties.starttime);
    const hour = startTime.getHours();
    // Use shared palette from window if available
    const palette = window.BAR_MAP_HOUR_COLORS || [
        '#FF0000','#0074D9','#2ECC40','#FFDC00','#FF851B','#B10DC9','#111111','#7FDBFF','#F012BE','#01FF70','#85144b','#AAAAAA',
        '#FF4136','#39CCCC','#3D9970','#F39C12','#8B4513','#E67E22','#2980B9','#E74C3C','#16A085','#D35400','#34495E','#C0392B']
    return palette[hour % 24];
}

// Clear all map layers
function clearMapLayers() {
    tripLayers.forEach(layerObj => {
        map.removeLayer(layerObj.layer);
    });
    tripLayers = [];
}

// Select a specific trip
function selectTrip(index, trip) {
    // Use interactivity system if available
    if (window.interactivityFunctions) {
        window.interactivityFunctions.selectTrip(trip, index);
    } else {
        // Fallback to direct updates
        highlightTrip(index);
        if (window.chartFunctions) {
            window.chartFunctions.updateChartsForSelection(trip);
        }
    }
}

// Highlight a specific trip on the map
function highlightTrip(indexOrTrip, addMarkers = false) {
    let targetTrip = null;
    
    // If it's a number, treat it as an index into currentDisplayedTrips
    if (typeof indexOrTrip === 'number') {
        targetTrip = currentDisplayedTrips[indexOrTrip];
    } else {
        // If it's an object, treat it as the trip itself
        targetTrip = indexOrTrip;
    }
    
    if (!targetTrip) {
        console.warn('highlightTrip: No trip found for', indexOrTrip);
        return;
    }
    
    console.log('Highlighting trip:', targetTrip.properties?.starttime);
    
    // Add GPS markers only if explicitly requested (for clicks, not hovers)
    if (addMarkers) {
        addTripMarkers(targetTrip);
    }
    
    tripLayers.forEach(layerObj => {
        if (layerObj.trip === targetTrip) {
            layerObj.layer.setStyle({
                color: '#e74c3c',
                weight: 4,
                opacity: 1
            });
        } else {
            layerObj.layer.setStyle({
                color: getTripColor(layerObj.trip.properties),
                weight: currentDisplayedTrips.length === 1 ? 5 : 2,
                opacity: 0.3
            });
        }
    });
}

// Reset all trip styles to normal without changing displayed trips
function resetTripStyles() {
    const isingleTrip = currentDisplayedTrips.length === 1;
    const normalWeight = isingleTrip ? 5 : 2;
    const normalOpacity = isingleTrip ? 1 : 0.7;
    
    tripLayers.forEach(layerObj => {
        layerObj.layer.setStyle({
            color: getTripColor(layerObj.trip.properties),
            weight: normalWeight,
            opacity: normalOpacity
        });
    });
    
    // Don't remove GPS markers here - they should stay if showing single trip
}

// Filter trips by hour
function filterTripsByHour(hour) {
    if (hour === null) {
        // Reset to show all trips
        filteredTrips = [...allTrips];
        drawTrips(filteredTrips);
        if (window.chartFunctions) {
            window.chartFunctions.updateChartsForFilter(filteredTrips);
        }
        document.getElementById('selectedTrips').textContent = `Selected: 0`;
    } else {
        // Filter trips by hour
        filteredTrips = allTrips.filter(trip => {
            const startTime = new Date(trip.properties.starttime);
            return startTime.getHours() === hour;
        });
        
        drawTrips(filteredTrips);
        if (window.chartFunctions) {
            window.chartFunctions.updateChartsForFilter(filteredTrips);
        }
        document.getElementById('selectedTrips').textContent = `Filtered: ${filteredTrips.length} (Hour ${hour}:00)`;
    }
}

// Reset map to show all trips
function resetMap() {
    filteredTrips = [...allTrips];
    currentDisplayedTrips = [...allTrips];
    drawTrips(filteredTrips);
    if (window.chartFunctions) {
        window.chartFunctions.resetCharts();
    }
    document.getElementById('selectedTrips').textContent = `Selected: 0`;
}

// Add GPS markers for trip start and end points
function addTripMarkers(trip) {
    // Remove existing markers
    removeTripMarkers();
    
    if (!trip || !trip.geometry || !trip.geometry.coordinates || trip.geometry.coordinates.length < 2) {
        return;
    }
    
    const coordinates = trip.geometry.coordinates;
    const startCoord = coordinates[0]; // [lng, lat]
    const endCoord = coordinates[coordinates.length - 1]; // [lng, lat]
    
    // Create start marker (green)
    startMarker = L.marker([startCoord[1], startCoord[0]], {
        icon: L.divIcon({
            className: 'trip-marker start-marker',
            html: '<div class="marker-icon">🟢</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map);
    
    // Create end marker (red)
    endMarker = L.marker([endCoord[1], endCoord[0]], {
        icon: L.divIcon({
            className: 'trip-marker end-marker',
            html: '<div class="marker-icon">🔴</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map);
    
    // Add popups to markers
    const startTime = new Date(trip.properties.starttime);
    const endTime = new Date(trip.properties.endtime);
    
    startMarker.bindPopup(`
        <div class="marker-popup">
            <h4>🟢 Trip Start</h4>
            <p><strong>Time:</strong> ${startTime.toLocaleString()}</p>
            <p><strong>Location:</strong> [${startCoord[1].toFixed(4)}, ${startCoord[0].toFixed(4)}]</p>
        </div>
    `);
    
    endMarker.bindPopup(`
        <div class="marker-popup">
            <h4>🔴 Trip End</h4>
            <p><strong>Time:</strong> ${endTime.toLocaleString()}</p>
            <p><strong>Location:</strong> [${endCoord[1].toFixed(4)}, ${endCoord[0].toFixed(4)}]</p>
                                <p><strong>Duration:</strong> ${(trip.properties.duration / 60).toFixed(1)} minutes</p>
        </div>
    `);
}

// Remove GPS markers
function removeTripMarkers() {
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadTripData();
});

// Export functions for interactivity
window.mapFunctions = {
    selectTrip,
    filterTripsByHour,
    resetMap,
    getTripColor,
    drawTrips,
    highlightTrip,
    addTripMarkers,
    removeTripMarkers,
    resetTripStyles
}; 
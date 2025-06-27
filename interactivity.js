// Global state management
window.appState = {
    selectedTrip: null,
    selectedTripIndex: null,
    filteredTrips: null,
    currentFilter: null,
    clickedBarHour: null // Track which bar is currently clicked
};

// Event dispatcher for cross-chart communication
const eventDispatcher = d3.dispatch('tripSelected', 'hourFiltered', 'reset');

// Initialize interactivity
function initInteractivity() {
    // Set up event listeners
    setupEventListeners();
    
    // Set up global event handlers
    setupGlobalEvents();
    
    console.log('Interactivity initialized');
}

// Set up event listeners
function setupEventListeners() {
    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllViews);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Set up global event handlers
function setupGlobalEvents() {
    // Handle trip selection
    eventDispatcher.on('tripSelected', (trip, index) => {
        window.appState.selectedTrip = trip;
        window.appState.selectedTripIndex = index;
        
        // Update all visualizations
        updateAllVisualizations();
    });
    
    // Handle hour filtering
    eventDispatcher.on('hourFiltered', (hour) => {
        window.appState.currentFilter = hour;
        window.appState.clickedBarHour = hour;
        let tripsToShowOnMap;

        if (hour === null) {
            // Reset filter, show all trips on map
            window.appState.filteredTrips = null;
            window.appState.clickedBarHour = null;
            tripsToShowOnMap = window.allTrips;
        } else {
            // Apply filter
            const filtered = window.allTrips.filter(trip => {
                const startTime = new Date(trip.properties.starttime);
                return startTime.getHours() === hour;
            });
            window.appState.filteredTrips = filtered;
            tripsToShowOnMap = filtered;
        }
        
        // Update the map and stats. Do not redraw charts on hover.
        if (window.mapFunctions) {
            window.mapFunctions.drawTrips(tripsToShowOnMap);
        }
        updateStats();
    });
    
    // Handle reset
    eventDispatcher.on('reset', () => {
        window.appState.selectedTrip = null;
        window.appState.selectedTripIndex = null;
        window.appState.filteredTrips = null;
        window.appState.currentFilter = null;
        window.appState.clickedBarHour = null;
        
        // Update all visualizations
        updateAllVisualizations();
    });
}

// Update all visualizations based on current state
function updateAllVisualizations() {
    // This function is now mainly for selection and reset, not hover-filtering.
    const trips = window.appState.filteredTrips || window.allTrips;

    // Update map
    if (window.mapFunctions) {
        window.mapFunctions.drawTrips(trips);
        if (window.appState.selectedTrip) {
            window.mapFunctions.highlightTrip(window.appState.selectedTrip);
        }
    }
    
    // Update charts
    if (window.chartFunctions) {
        if (window.appState.filteredTrips) {
            // This case is now only hit on a persistent filter, not hover.
            window.chartFunctions.updateChartsForFilter(window.appState.filteredTrips);
        } else {
            window.chartFunctions.resetCharts();
        }
        
        if (window.appState.selectedTrip) {
            window.chartFunctions.updateChartsForSelection(window.appState.selectedTrip);
        }
    }
    
    // Update stats
    updateStats();
}

// Update statistics display
function updateStats() {
    const totalTrips = window.allTrips ? window.allTrips.length : 0;
    const selectedCount = window.appState.selectedTrip ? 1 : 0;
    const filteredCount = window.appState.filteredTrips ? window.appState.filteredTrips.length : 0;
    
    document.getElementById('totalTrips').textContent = `Total Trips: ${totalTrips}`;
    
    if (window.appState.currentFilter !== null) {
        document.getElementById('selectedTrips').textContent = `Filtered: ${filteredCount} (Hour ${window.appState.currentFilter}:00)`;
    } else if (selectedCount > 0) {
        document.getElementById('selectedTrips').textContent = `Selected: ${selectedCount}`;
    } else {
        document.getElementById('selectedTrips').textContent = `Selected: 0`;
    }
}

// Reset all views
function resetAllViews() {
    eventDispatcher.call('reset');
    
    // Clear any tooltips
    d3.selectAll('.tooltip').remove();
    
    // Remove all selections from charts
    d3.selectAll('.bar, .dot').classed('selected clicked', false);
    
    // Reset charts to show all data
    if (window.chartFunctions) {
        window.chartFunctions.resetCharts();
    }
    
    // Reset map to show all trips
    if (window.mapFunctions) {
        window.mapFunctions.drawTrips(window.allTrips);
    }
    
    console.log('All views reset');
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    switch(event.key) {
        case 'Escape':
            resetAllViews();
            break;
        case 'r':
        case 'R':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                resetAllViews();
            }
            break;
    }
}

// Public functions for external use
function selectTrip(trip, index) {
    eventDispatcher.call('tripSelected', null, trip, index);
}

function filterByHour(hour) {
    eventDispatcher.call('hourFiltered', null, hour);
}

function resetViews() {
    eventDispatcher.call('reset');
}

// Export functions for global access
window.interactivityFunctions = {
    selectTrip,
    filterByHour,
    resetViews,
    resetAllViews,
    eventDispatcher
};

// Toggle How to Use section
function toggleHowTo() {
    console.log('toggleHowTo called');
    const content = document.getElementById('howToContent');
    const arrow = document.getElementById('howToArrow');
    
    if (!content || !arrow) {
        console.error('Elements not found:', { content, arrow });
        return;
    }
    
    // Simple display toggle without complex transitions
    if (content.style.display === 'none' || content.style.display === '') {
        // Show content
        console.log('Showing content');
        content.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        // Hide content
        console.log('Hiding content');
        content.style.display = 'none';
        arrow.textContent = '▼';
    }
}

// Make toggleHowTo globally available
window.toggleHowTo = toggleHowTo;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other modules to load
    setTimeout(initInteractivity, 100);
    
    // Test if toggle function is accessible
    console.log('toggleHowTo function available:', typeof window.toggleHowTo);
    
    // Test if elements exist and add event listener as backup
    setTimeout(() => {
        const content = document.getElementById('howToContent');
        const arrow = document.getElementById('howToArrow');
        const button = document.querySelector('.how-to-toggle');
        console.log('Elements found:', { 
            content: !!content, 
            arrow: !!arrow, 
            button: !!button 
        });
        
        // Add event listener as backup to onclick
        if (button) {
            button.addEventListener('click', function() {
                console.log('Button clicked via event listener');
                toggleHowTo();
            });
        }
    }, 200);
});

// Add some utility functions for debugging
window.debugState = () => {
    console.log('Current App State:', window.appState);
    console.log('Total Trips:', window.allTrips ? window.allTrips.length : 'Not loaded');
    console.log('Map Functions:', !!window.mapFunctions);
    console.log('Chart Functions:', !!window.chartFunctions);
}; 
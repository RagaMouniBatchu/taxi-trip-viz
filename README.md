# 🚕 Interactive Taxi Trip Visualization

A comprehensive web-based visualization of taxi trip data featuring interactive maps, charts, and cross-chart filtering capabilities with advanced pattern-based visual feedback and detailed trip information display.

## ✨ Key Features

### 🗺️ Interactive Map
- **Leaflet-based visualization** with OpenStreetMap tiles
- **Color-coded trip routes** by hour of the day (24 distinct colors)
- **Interactive popups** with detailed trip information including actual Trip IDs and Taxi IDs
- **GPS markers** for individual trip exploration (green start 🟢, red end 🔴)
- **Dynamic trip highlighting** with enhanced line thickness for selected trips
- **Automatic filtering** based on chart interactions

### 📊 Bar Chart (Trips by Hour)
- **Hourly distribution** of taxi trips (0-13 hours displayed for optimal visibility)
- **Pattern-based visual feedback** using diagonal stripe overlays
- **Interactive hover effects** with red diagonal stripes
- **Click selection** with dark blue diagonal stripes that persist
- **Color preservation** - Original hour-based colors remain visible under patterns
- **Cross-chart filtering** - Click any bar to filter scatter plot and map

### 📈 Scatter Plot (Speed vs Distance)
- **Speed vs Distance correlation** analysis with color-coded points by hour
- **Dual interaction modes:**
  - **Hover** - Highlights corresponding trip on map (red outline)
  - **Click** - Shows only that trip with GPS markers and enhanced visualization
- **Dynamic filtering** - Updates to show only trips from selected hour
- **Detailed tooltips** with actual Trip IDs, Taxi IDs, and accurate duration in minutes

### 🔄 Advanced Interactivity System
- **Multi-level trip exploration:**
  - Bar chart filtering by hour
  - Individual trip selection from scatter plot
  - Map-based trip highlighting
- **Persistent visual states** with pattern overlays
- **GPS marker system** for precise trip start/end visualization
- **Coordinated highlighting** across all three visualizations

### 📋 Trip Information Panel
- **Detailed trip display** appears below the map when scatter plot points are clicked
- **Comprehensive trip data:**
  - Actual Trip ID (e.g., 417118) and Taxi ID from JSON data
  - Formatted start/end timestamps
  - Distance in kilometers (converted from meters)
  - Duration in minutes (converted from seconds)
  - Average and maximum speed statistics
- **Professional styling** with two-column grid layout
- **Responsive design** adapts to mobile screens

## 🎯 Enhanced User Experience

### Visual Feedback System
- **Pattern Approach** - Uses diagonal stripe overlays instead of color changes
- **State Preservation** - Original colors remain visible under selection patterns
- **Clear Visual Hierarchy:**
  - Light red stripes for hover states
  - Dark blue stripes for clicked/selected states
  - Orange highlighting for active scatter plot points

### Data Accuracy
- **Authentic Trip IDs** - Displays actual trip IDs from dataset (not array indices)
- **Corrected Time Units** - Duration properly converted from seconds to minutes
- **Precise Measurements** - Distance converted from meters to kilometers
- **Formatted Timestamps** - Human-readable date/time display

## 🚀 Quick Start

1. **Navigate to the project directory:**
   ```bash
   cd final-project
   ```

2. **Start the local server:**
   ```bash
   ./start-server.sh
   ```
   Or manually:
   ```bash
   python3 -m http.server 8000
   ```

3. **Open your browser:**
   ```
   http://localhost:8000
   ```

## 🎮 How to Use

### Basic Exploration
1. **Hover over bars** - See hourly trip counts with red stripe patterns
2. **Click a bar** - Filter all visualizations to that specific hour
3. **Hover scatter points** - Highlight corresponding trips on map
4. **Click scatter points** - View detailed trip information and GPS markers

### Advanced Trip Analysis
1. **Select an hour** using the bar chart to focus on specific time periods
2. **Explore individual trips** by clicking scatter plot points
3. **View comprehensive trip details** in the information panel below the map
4. **Observe GPS markers** showing exact start (🟢) and end (🔴) locations
5. **Reset everything** using the "Reset All Views" button

## 🛠️ Technical Implementation

### Advanced Visual Design
- **SVG Pattern System** - Diagonal stripe overlays for selection states
- **Color Palette Management** - 24 distinct colors shared across all visualizations
- **State Management** - Sophisticated handling of hover, click, and selection states
- **Performance Optimization** - Efficient pattern rendering and state updates

### Data Processing Pipeline
- **Unit Conversion** - Automatic conversion of distance (m→km) and duration (s→min)
- **ID Mapping** - Proper handling of actual trip IDs vs. array indices
- **Time Parsing** - Robust timestamp processing for temporal analysis
- **Coordinate Transformation** - GeoJSON coordinate handling for map display

### Architecture
- **Modular JavaScript** - Separate files for map, charts, and interactivity
- **Event-driven communication** - D3 event dispatcher for cross-chart updates
- **Centralized state management** - Consistent filtering and selection across components
- **Responsive CSS Grid** - Professional layout that adapts to all screen sizes

### Technologies
- **Leaflet.js 1.9.4** - Interactive mapping with custom markers
- **D3.js v7** - Advanced data visualization with pattern support
- **OpenStreetMap** - High-quality map tiles
- **Modern CSS** - Grid layout, flexbox, and custom properties
- **Vanilla JavaScript** - No frameworks for optimal performance

## 📊 Data Insights Revealed

### Temporal Patterns
- **Peak hours** clearly visible in bar chart distribution
- **Time-based filtering** allows focused analysis of specific periods
- **Color coding** makes hour identification intuitive across all charts

### Trip Characteristics
- **Speed-distance relationships** revealed through scatter plot analysis
- **Individual trip details** accessible through interactive selection
- **Geographic patterns** visible through map-based exploration

### Data Quality
- **Authentic identifiers** - Real trip and taxi IDs from source data
- **Accurate measurements** - Proper unit conversions throughout
- **Temporal precision** - Exact start/end times and calculated durations

## 🎨 User Experience Excellence

### Visual Design
- **Professional aesthetics** with modern color schemes and typography
- **Intuitive interactions** with clear visual feedback
- **Accessibility** - High contrast patterns work for users with color vision differences
- **Responsive layout** - Optimal viewing on desktop, tablet, and mobile

### Performance Features
- **Smooth animations** with CSS transitions
- **Efficient rendering** - Only updates necessary components
- **Memory management** - Proper cleanup of event listeners and map layers
- **Fast filtering** - Real-time updates across all visualizations

## 🔧 Extensibility & Maintenance

### Modular Architecture
- **Easy feature addition** - Well-structured component system
- **Configurable styling** - CSS custom properties for easy theming
- **Scalable data handling** - Efficient processing pipeline
- **Cross-browser compatibility** - Modern web standards

### Code Quality
- **Clear separation of concerns** - Map, charts, and interactivity modules
- **Consistent naming conventions** - Easy to understand and maintain
- **Comprehensive error handling** - Robust data validation
- **Performance optimizations** - Efficient DOM manipulation and event handling

## 📁 Project Structure

```
final-project/
├── index.html              # Main HTML with trip information panel
├── style.css               # Enhanced CSS with pattern support
├── map.js                  # Leaflet map with GPS markers & highlighting
├── charts.js               # D3.js charts with pattern overlays & trip info
├── interactivity.js        # Advanced cross-chart communication
├── data/
│   └── trips.json          # GeoJSON taxi trip dataset
├── start-server.sh         # Easy server startup script
├── README.md               # This comprehensive documentation
└── PROJECT_SUMMARY.md      # Detailed project summary
```

## 🎯 Complete Interaction Guide

### Bar Chart Interactions
- **Hover** - Red diagonal stripes appear with trip count tooltip
- **Click** - Dark blue diagonal stripes persist, filters all other views
- **Pattern overlays** - Original colors remain visible underneath

### Scatter Plot Interactions
- **Hover** - Point highlights, corresponding trip highlights on map (red outline)
- **Click** - Orange highlighting, shows only that trip with GPS markers
- **Tooltip details** - Actual Trip ID, Taxi ID, distance, speed, duration

### Map Interactions
- **Automatic filtering** - Shows trips from selected hour
- **Individual trip display** - Single trip with thick lines and GPS markers
- **Trip highlighting** - Temporary highlighting during hover interactions
- **Popup information** - Detailed trip data with correct IDs and units

### Trip Information Panel
- **Automatic display** - Appears when scatter plot point is clicked
- **Comprehensive data** - All relevant trip details in organized format
- **Professional layout** - Two-column grid with clear labels and values
- **Responsive design** - Adapts to smaller screens

### Global Controls
- **Reset All Views** - Clears all filters, selections, and trip information
- **Statistics display** - Shows total trips and current filter status
- **Keyboard shortcuts** - Escape key for quick reset


---

**🎉 Experience the most comprehensive taxi trip visualization with authentic data, advanced interactions, and professional visual feedback!** 
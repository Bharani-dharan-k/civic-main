import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different categories
const createCategoryIcon = (category, color) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
    ">${category.charAt(0).toUpperCase()}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Category colors mapping
const categoryColors = {
  'Water Supply': '#3b82f6',
  'Roads': '#ef4444',
  'Waste Management': '#22c55e',
  'Street Lighting': '#f59e0b',
  'Drainage': '#8b5cf6',
  'Public Transport': '#06b6d4',
  'Health': '#ec4899',
  'Education': '#10b981',
  'Other': '#6b7280'
};

const InteractiveMap = ({ analyticsData, onMarkerClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [heatmapData, setHeatmapData] = useState([]);
  const mapRef = useRef();

  // Generate mock coordinates for demonstration
  // In a real application, this would come from your database
  const generateMockLocations = () => {
    const locations = [];
    const categories = Object.keys(categoryColors);
    
    // Generate random coordinates around a central point (you can adjust this)
    const centerLat = 20.5937; // Example: Nagpur coordinates
    const centerLng = 78.9629;
    
    for (let i = 0; i < 50; i++) {
      const lat = centerLat + (Math.random() - 0.5) * 0.1;
      const lng = centerLng + (Math.random() - 0.5) * 0.1;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = Math.random() > 0.3 ? 'resolved' : 'pending';
      
      locations.push({
        id: i,
        lat,
        lng,
        category,
        status,
        title: `Issue ${i + 1}`,
        description: `Sample ${category} issue`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return locations;
  };

  const [mapData, setMapData] = useState(generateMockLocations());

  useEffect(() => {
    // In a real application, you would fetch actual location data here
    // For now, we're using mock data
    setMapData(generateMockLocations());
  }, [analyticsData]);

  const filteredData = mapData.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const MapUpdater = ({ data }) => {
    const map = useMap();
    
    useEffect(() => {
      if (data.length > 0) {
        const group = new L.featureGroup(data.map(item => 
          L.marker([item.lat, item.lng])
        ));
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }, [data, map]);
    
    return null;
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Issue Location Map</h3>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {Object.keys(categoryColors).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-1 text-xs">
            <div 
              className="w-3 h-3 rounded-full border border-white shadow"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-gray-600">{category}</span>
          </div>
        ))}
      </div>

      <div className="h-96 border rounded-lg overflow-hidden">
        <MapContainer
          center={[20.5937, 78.9629]} // Center coordinates (Nagpur as example)
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapUpdater data={filteredData} />
          
          {filteredData.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createCategoryIcon(item.category, categoryColors[item.category])}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(item)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded text-white ${
                      item.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1">
                    <span className="font-medium">Category:</span> {item.category}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-blue-600 font-semibold">Total Issues</div>
          <div className="text-2xl font-bold text-blue-700">{mapData.length}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-green-600 font-semibold">Resolved</div>
          <div className="text-2xl font-bold text-green-700">
            {mapData.filter(item => item.status === 'resolved').length}
          </div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-yellow-600 font-semibold">Pending</div>
          <div className="text-2xl font-bold text-yellow-700">
            {mapData.filter(item => item.status === 'pending').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;

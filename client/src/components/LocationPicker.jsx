import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Check,
  Loader,
  RefreshCw
} from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '300px',
};

// Default center - Delhi, India
const center = {
  lat: 28.6139,
  lng: 77.2090,
};

const LocationPicker = ({ onLocationSelect, onClose, initialLocation = null }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [map, setMap] = useState(null);
  const geocoderRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "demo_key",
    libraries: ['places']
  });

  // Initialize geocoder when maps is loaded
  useEffect(() => {
    if (isLoaded && window.google && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle map click to select location
  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setSelectedLocation({
      lat,
      lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    });

    // Reverse geocode to get address
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            setSelectedLocation(prev => ({
              ...prev,
              address: results[0].formatted_address
            }));
          }
        }
      );
    }
  }, []);

  // Get current location using GPS
  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setUseCurrentLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const newLocation = {
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };

        setSelectedLocation(newLocation);
        setUseCurrentLocation(false);

        // Center map on current location
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }

        // Reverse geocode to get address
        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                setSelectedLocation(prev => ({
                  ...prev,
                  address: results[0].formatted_address
                }));
              }
            }
          );
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Unable to retrieve your location. Please try again or select manually.');
        setUseCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Search for location
  const searchLocation = async () => {
    if (!searchQuery.trim() || !geocoderRef.current) return;

    setIsSearching(true);

    geocoderRef.current.geocode(
      { address: searchQuery },
      (results, status) => {
        setIsSearching(false);

        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          const newLocation = {
            lat,
            lng,
            address: results[0].formatted_address
          };

          setSelectedLocation(newLocation);

          // Center map on searched location
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
        } else {
          setLocationError('Location not found. Please try a different search term.');
        }
      }
    );
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  // Fallback UI when Google Maps API is not available
  if (!isLoaded || process.env.REACT_APP_GOOGLE_MAPS_API_KEY === "demo_key") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Google Maps API not configured</p>
              <p className="text-sm text-gray-500 mt-1">Please enter location manually</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Location
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address or location"
                onKeyPress={(e) => e.key === 'Enter' && setSelectedLocation({
                  lat: 0,
                  lng: 0,
                  address: searchQuery
                })}
              />
            </div>

            <button
              onClick={getCurrentLocation}
              disabled={useCurrentLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {useCurrentLocation ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {useCurrentLocation ? 'Getting Location...' : 'Use Current Location'}
            </button>

            {locationError && (
              <p className="text-red-600 text-sm">{locationError}</p>
            )}

            {(selectedLocation || searchQuery) && (
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const location = selectedLocation || {
                      lat: 0,
                      lng: 0,
                      address: searchQuery
                    };
                    onLocationSelect(location);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a location..."
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              />
            </div>
            <button
              onClick={searchLocation}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>

          {/* Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={useCurrentLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {useCurrentLocation ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {useCurrentLocation ? 'Getting Current Location...' : 'Use Current Location'}
          </button>

          {locationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{locationError}</p>
            </div>
          )}

          {/* Map */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={selectedLocation || center}
              zoom={selectedLocation ? 15 : 10}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                  title="Selected Location"
                />
              )}
            </GoogleMap>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Selected Location:</span>
              </div>
              <p className="text-blue-800 text-sm">{selectedLocation.address}</p>
              <p className="text-blue-600 text-xs mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationPicker;
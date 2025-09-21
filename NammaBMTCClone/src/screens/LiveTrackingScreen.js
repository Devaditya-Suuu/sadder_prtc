import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import ApiService from '../services/api';

export default function LiveTrackingScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const fetchNearbyBuses = async (userLocation) => {
    try {
      const response = await ApiService.getNearbyBuses(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        10000 // 10km radius
      );
      
      if (response.success) {
        // Transform API data to match component expectations
        const transformedBuses = response.data.map(bus => ({
          id: bus._id,
          number: bus.busNumber,
          route: bus.route,
          latitude: bus.currentLocation.latitude,
          longitude: bus.currentLocation.longitude,
          speed: bus.speed,
          nextStop: bus.nextStop || 'Next stop',
          eta: bus.eta || 'N/A',
          occupancy: bus.occupancy,
          busType: bus.busType,
          routeId: bus.routeId
        }));
        
        setBuses(transformedBuses);
      } else {
        Alert.alert('Error', 'Failed to fetch bus locations');
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      Alert.alert('Error', 'Unable to fetch bus locations. Please try again.');
    }
  };

  // Mock bus route polyline
  const busRoute = [
    { latitude: 12.9767, longitude: 77.5693 },
    { latitude: 12.9698, longitude: 77.5659 },
    { latitude: 12.9794, longitude: 77.5912 },
    { latitude: 12.9718, longitude: 77.5924 },
    { latitude: 12.9719, longitude: 77.6109 },
  ];

  useEffect(() => {
    getCurrentLocation();
    // Simulate real-time bus updates
    const interval = setInterval(() => {
      updateBusPositions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for live tracking.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Fetch nearby buses from API
      await fetchNearbyBuses(currentLocation);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location.');
      setLoading(false);
    }
  };

  const updateBusPositions = () => {
    if (location) {
      fetchNearbyBuses(location);
    }
  };

  const getOccupancyColor = (occupancy) => {
    switch (occupancy) {
      case 'Low':
        return Colors.accent;
      case 'Medium':
        return Colors.warning;
      case 'High':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getBusMarkerColor = (bus) => {
    return bus.id === selectedBus?.id ? Colors.secondary : Colors.primary;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading live tracking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={Layout.iconSize.md} color={Colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Bus Tracking</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={updateBusPositions}>
          <Ionicons name="refresh" size={Layout.iconSize.md} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User location marker */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              pinColor={Colors.accent}
            />
          )}

          {/* Bus route polyline */}
          <Polyline
            coordinates={busRoute}
            strokeColor={Colors.busRoute}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />

          {/* Bus markers */}
          {buses.map((bus) => (
            <Marker
              key={bus.id}
              coordinate={{
                latitude: bus.latitude,
                longitude: bus.longitude,
              }}
              onPress={() => setSelectedBus(bus)}
            >
              <View style={[styles.busMarker, { backgroundColor: getBusMarkerColor(bus) }]}>
                <Ionicons name="bus" size={20} color={Colors.textLight} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Bus info overlay */}
        {selectedBus && (
          <View style={styles.busInfoOverlay}>
            <View style={styles.busInfoHeader}>
              <View style={styles.busNumberContainer}>
                <Text style={styles.busNumber}>{selectedBus.number}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedBus(null)}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.busRoute}>{selectedBus.route}</Text>
            
            <View style={styles.busDetails}>
              <View style={styles.busDetailItem}>
                <Ionicons name="speedometer" size={16} color={Colors.textSecondary} />
                <Text style={styles.busDetailText}>{selectedBus.speed} km/h</Text>
              </View>
              
              <View style={styles.busDetailItem}>
                <Ionicons name="time" size={16} color={Colors.textSecondary} />
                <Text style={styles.busDetailText}>ETA: {selectedBus.eta}</Text>
              </View>
              
              <View style={styles.busDetailItem}>
                <Ionicons 
                  name="people" 
                  size={16} 
                  color={getOccupancyColor(selectedBus.occupancy)} 
                />
                <Text style={[
                  styles.busDetailText,
                  { color: getOccupancyColor(selectedBus.occupancy) }
                ]}>
                  {selectedBus.occupancy} occupancy
                </Text>
              </View>
            </View>

            <Text style={styles.nextStopText}>
              Next stop: {selectedBus.nextStop}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="list" size={Layout.iconSize.md} color={Colors.primary} />
          <Text style={styles.controlButtonText}>Bus List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="filter" size={Layout.iconSize.md} color={Colors.primary} />
          <Text style={styles.controlButtonText}>Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="navigate" size={Layout.iconSize.md} color={Colors.primary} />
          <Text style={styles.controlButtonText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  backButton: {
    padding: Layout.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  refreshButton: {
    padding: Layout.spacing.sm,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  busMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.textLight,
  },
  busInfoOverlay: {
    position: 'absolute',
    top: Layout.spacing.md,
    left: Layout.spacing.md,
    right: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  busInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  busNumberContainer: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  busNumber: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  busRoute: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  busDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  busDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busDetailText: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  nextStopText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  bottomControls: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  controlButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  controlButtonText: {
    marginTop: Layout.spacing.xs,
    fontSize: Layout.fontSize.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
});

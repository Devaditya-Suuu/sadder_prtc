import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import ApiService from '../services/api';

export default function JourneyPlannerScreen() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchRoutes = async () => {
    if (!fromLocation.trim() || !toLocation.trim()) {
      Alert.alert('Error', 'Please enter both source and destination locations.');
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await ApiService.planJourney(fromLocation, toLocation);
      
      if (response.success && response.data.length > 0) {
        // Transform API data to match component expectations
        const transformedRoutes = response.data.map(journey => ({
          id: journey.route._id,
          busNumber: journey.route.routeNumber,
          duration: `${journey.estimatedTime} mins`,
          distance: `${journey.distance} km`,
          fare: `₹${journey.fare}`,
          stops: journey.stops,
          route: [], // Route details would need separate API call
          type: journey.route.busType === 'vajra' ? 'AC Volvo' : 
                journey.route.busType === 'atal_sarige' ? 'Semi-luxury' : 'Direct',
          frequency: journey.route.frequency?.peakHours || '15-20 mins',
          fromStop: journey.fromStop,
          toStop: journey.toStop,
          routeName: journey.route.routeName
        }));
        
        setRoutes(transformedRoutes);
      } else {
        setRoutes([]);
        Alert.alert('No Routes Found', 'No direct routes found between the selected locations. Please try different locations.');
      }
    } catch (error) {
      console.error('Error planning journey:', error);
      
      // Show more specific error messages
      if (error.message.includes('Unable to connect to server')) {
        Alert.alert(
          'Connection Error', 
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('Request timed out')) {
        Alert.alert(
          'Timeout Error', 
          'The request took too long to complete. Please try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Unable to plan journey. Please try again.');
      }
      
      setRoutes([]);
    } finally {
      setIsSearching(false);
    }
  };


  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const renderRoute = (route) => (
    <View key={route.id} style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <View style={styles.busInfo}>
          <View style={styles.busNumberContainer}>
            <Text style={styles.busNumber}>{route.busNumber}</Text>
          </View>
          <View style={styles.routeDetails}>
            <Text style={styles.routeType}>{route.type}</Text>
            <Text style={styles.frequency}>Every {route.frequency}</Text>
          </View>
        </View>
        <View style={styles.routeStats}>
          <Text style={styles.fare}>{route.fare}</Text>
          <Text style={styles.duration}>{route.duration}</Text>
        </View>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{route.duration}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{route.distance}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="bus" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{route.stops} stops</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Route Details</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Form */}
        <View style={styles.searchForm}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="radio-button-on" size={20} color={Colors.accent} />
              <TextInput
                style={styles.textInput}
                placeholder="From (Source)"
                value={fromLocation}
                onChangeText={setFromLocation}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
            <Ionicons name="swap-vertical" size={24} color={Colors.primary} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="location" size={20} color={Colors.error} />
              <TextInput
                style={styles.textInput}
                placeholder="To (Destination)"
                value={toLocation}
                onChangeText={setToLocation}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
            onPress={searchRoutes}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? 'Searching...' : 'Search Routes'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickDestinations}>
              {['Majestic', 'Koramangala', 'BTM Layout', 'Electronic City', 'Whitefield', 'Airport'].map((dest, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickDestChip}
                  onPress={() => setToLocation(dest)}
                >
                  <Text style={styles.quickDestText}>{dest}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Routes Results */}
        {routes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Routes</Text>
            <Text style={styles.resultsCount}>{routes.length} routes found</Text>
            {routes.map(renderRoute)}
          </View>
        )}

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={20} color={Colors.info} />
              <Text style={styles.tipText}>Peak hours: 8-10 AM, 6-8 PM</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="card" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Use BMTC card for cashless travel</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.warning} />
              <Text style={styles.tipText}>Keep your belongings safe</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchForm: {
    backgroundColor: Colors.surface,
    margin: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: Layout.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.background,
  },
  textInput: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
  },
  swapButton: {
    alignSelf: 'center',
    padding: Layout.spacing.sm,
    marginVertical: Layout.spacing.xs,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  section: {
    margin: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  quickDestinations: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  quickDestChip: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickDestText: {
    color: Colors.text,
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  busNumberContainer: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    marginRight: Layout.spacing.sm,
  },
  busNumber: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
  },
  routeDetails: {
    flex: 1,
  },
  routeType: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  frequency: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  routeStats: {
    alignItems: 'flex-end',
  },
  fare: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  duration: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewDetailsText: {
    color: Colors.primary,
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
    marginRight: Layout.spacing.xs,
  },
  tipsContainer: {
    gap: Layout.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  tipText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    flex: 1,
  },
});

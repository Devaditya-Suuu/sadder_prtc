import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function SOSScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const emergencyContacts = [
    {
      id: 1,
      name: 'Police',
      number: '100',
      icon: 'shield',
      color: Colors.info,
      description: 'For immediate police assistance',
    },
    {
      id: 2,
      name: 'Fire Department',
      number: '101',
      icon: 'flame',
      color: Colors.error,
      description: 'Fire emergency services',
    },
    {
      id: 3,
      name: 'Ambulance',
      number: '108',
      icon: 'medical',
      color: Colors.accent,
      description: 'Medical emergency services',
    },
    {
      id: 4,
      name: 'Women Helpline',
      number: '1091',
      icon: 'woman',
      color: Colors.warning,
      description: '24/7 women safety helpline',
    },
    {
      id: 5,
      name: 'BMTC Control Room',
      number: '080-22961111',
      icon: 'bus',
      color: Colors.primary,
      description: 'BMTC emergency assistance',
    },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      triggerEmergency();
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is needed for emergency services to locate you.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setLocationLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
    }
  };

  const startEmergencyCountdown = () => {
    Alert.alert(
      'Emergency Alert',
      'This will send your location to emergency services and trusted contacts. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Emergency',
          style: 'destructive',
          onPress: () => {
            setCountdown(10);
            setIsEmergencyActive(true);
          },
        },
      ]
    );
  };

  const cancelEmergency = () => {
    setCountdown(null);
    setIsEmergencyActive(false);
    Alert.alert('Emergency Cancelled', 'Emergency alert has been cancelled.');
  };

  const triggerEmergency = () => {
    setCountdown(null);
    setIsEmergencyActive(false);
    
    // In a real app, this would:
    // 1. Send location to emergency services
    // 2. Notify trusted contacts
    // 3. Send alert to BMTC control room
    // 4. Start recording audio/video if permissions allow
    
    Alert.alert(
      'Emergency Alert Sent!',
      'Your location has been shared with emergency services and your trusted contacts.',
      [
        {
          text: 'Call Police (100)',
          onPress: () => makeCall('100'),
        },
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const makeCall = (number) => {
    const phoneNumber = `tel:${number}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((err) => console.error('Error making call:', err));
  };

  const shareLocation = () => {
    if (!location) {
      Alert.alert('Location Not Available', 'Please wait while we get your location.');
      return;
    }

    const locationText = `Emergency! My location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    
    // In a real app, this would use sharing APIs
    Alert.alert(
      'Location Shared',
      'Your location has been prepared for sharing:\n\n' + locationText,
      [{ text: 'OK' }]
    );
  };

  const renderEmergencyContact = (contact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      onPress={() => makeCall(contact.number)}
      activeOpacity={0.8}
    >
      <View style={[styles.contactIcon, { backgroundColor: contact.color }]}>
        <Ionicons name={contact.icon} size={Layout.iconSize.lg} color={Colors.textLight} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactDescription}>{contact.description}</Text>
        <Text style={styles.contactNumber}>{contact.number}</Text>
      </View>
      <Ionicons name="call" size={Layout.iconSize.md} color={contact.color} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={Layout.iconSize.md} color={Colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Emergency Button */}
        <View style={styles.emergencySection}>
          {isEmergencyActive && countdown > 0 ? (
            <View style={styles.countdownContainer}>
              <View style={styles.countdownCircle}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
              <Text style={styles.countdownLabel}>Emergency in {countdown} seconds</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergency}>
                <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emergencyButtonContainer}>
              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={startEmergencyCountdown}
                activeOpacity={0.8}
              >
                <Ionicons name="warning" size={60} color={Colors.textLight} />
                <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
                <Text style={styles.emergencyButtonSubtext}>Hold to activate</Text>
              </TouchableOpacity>
              <Text style={styles.emergencyInfo}>
                Press to send your location to emergency services and trusted contacts
              </Text>
            </View>
          )}
        </View>

        {/* Location Status */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={Layout.iconSize.md} color={Colors.primary} />
            <Text style={styles.locationTitle}>Your Location</Text>
          </View>
          
          {locationLoading ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.locationLoadingText}>Getting your location...</Text>
            </View>
          ) : location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Lat: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Lng: {location.coords.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationAccuracy}>
                Accuracy: ±{Math.round(location.coords.accuracy)}m
              </Text>
              <TouchableOpacity style={styles.shareLocationButton} onPress={shareLocation}>
                <Ionicons name="share" size={16} color={Colors.primary} />
                <Text style={styles.shareLocationText}>Share Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.locationError}>
              Location not available. Please check your settings.
            </Text>
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.contactsList}>
            {emergencyContacts.map(renderEmergencyContact)}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Stay calm and alert in emergency situations</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Share your travel plans with trusted contacts</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Keep your phone charged during travel</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Trust your instincts and seek help when needed</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.error,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  emergencySection: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emergencyButtonText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    marginTop: Layout.spacing.sm,
  },
  emergencyButtonSubtext: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.sm,
    opacity: 0.8,
    marginTop: Layout.spacing.xs,
  },
  emergencyInfo: {
    textAlign: 'center',
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    maxWidth: 280,
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  countdownText: {
    color: Colors.textLight,
    fontSize: 48,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: Layout.fontSize.lg,
    color: Colors.error,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.md,
  },
  cancelButton: {
    backgroundColor: Colors.textSecondary,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  locationSection: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  locationTitle: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLoadingText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  locationInfo: {
    gap: Layout.spacing.xs,
  },
  locationText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  locationAccuracy: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  shareLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  shareLocationText: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  locationError: {
    fontSize: Layout.fontSize.sm,
    color: Colors.error,
  },
  contactsSection: {
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  contactsList: {
    gap: Layout.spacing.sm,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  contactDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  contactNumber: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: Layout.spacing.md,
  },
  tipsList: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
});

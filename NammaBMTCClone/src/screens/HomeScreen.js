import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function HomeScreen({ navigation }) {
  const quickActions = [
    {
      id: 1,
      title: 'Live Bus Tracking',
      subtitle: 'Track buses in real-time',
      icon: 'bus',
      color: Colors.primary,
      onPress: () => navigation.navigate('LiveTracking'),
    },
    {
      id: 2,
      title: 'Nearby Stops',
      subtitle: 'Find bus stops near you',
      icon: 'location',
      color: Colors.info,
      onPress: () => navigation.navigate('Nearby'),
    },
    {
      id: 3,
      title: 'Plan Journey',
      subtitle: 'Get route suggestions',
      icon: 'map',
      color: Colors.accent,
      onPress: () => navigation.navigate('Journey'),
    },
    {
      id: 4,
      title: 'Fare Calculator',
      subtitle: 'Calculate bus fare',
      icon: 'calculator',
      color: Colors.warning,
      onPress: () => navigation.navigate('FareCalculator'),
    },
  ];

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon} size={Layout.iconSize.lg} color={Colors.textLight} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{action.title}</Text>
        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={Layout.iconSize.md} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.welcomeBanner}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandText}>Namma BMTC</Text>
            <Text style={styles.tagline}>Your Smart Transit Companion</Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="bus" size={60} color={Colors.textLight} />
          </View>
        </LinearGradient>

        {/* Emergency SOS Button */}
        <TouchableOpacity 
          style={styles.sosButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SOS')}
        >
          <LinearGradient
            colors={[Colors.error, '#D32F2F']}
            style={styles.sosGradient}
          >
            <Ionicons name="warning" size={Layout.iconSize.lg} color={Colors.textLight} />
            <Text style={styles.sosText}>Emergency SOS</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Recent Trips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <View style={styles.recentTripsCard}>
            <Text style={styles.noTripsText}>No recent trips</Text>
            <Text style={styles.noTripsSubtext}>Start planning your journey to see your trips here</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={Layout.iconSize.lg} color={Colors.primary} />
              <Text style={styles.featureText}>Real-time Updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={Layout.iconSize.lg} color={Colors.accent} />
              <Text style={styles.featureText}>Safe & Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="card" size={Layout.iconSize.lg} color={Colors.info} />
              <Text style={styles.featureText}>Digital Payments</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={Layout.iconSize.lg} color={Colors.warning} />
              <Text style={styles.featureText}>Community</Text>
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
  welcomeBanner: {
    margin: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
  },
  welcomeText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.md,
    opacity: 0.9,
  },
  brandText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    marginVertical: Layout.spacing.xs,
  },
  tagline: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.sm,
    opacity: 0.8,
  },
  bannerIcon: {
    opacity: 0.8,
  },
  sosButton: {
    margin: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
  },
  sosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.md,
  },
  sosText: {
    color: Colors.textLight,
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.sm,
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
  quickActions: {
    gap: Layout.spacing.sm,
  },
  quickActionCard: {
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  actionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  actionSubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  recentTripsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xl,
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
  noTripsText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  noTripsSubtext: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Layout.spacing.xs,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Layout.spacing.md,
  },
  featureItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    alignItems: 'center',
    width: '47%',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    fontWeight: '500',
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
});

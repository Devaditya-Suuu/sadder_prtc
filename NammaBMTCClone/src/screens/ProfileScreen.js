import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function ProfileScreen() {
  const profileOptions = [
    {
      id: 1,
      title: 'My Trips',
      subtitle: 'View your travel history',
      icon: 'time',
      onPress: () => Alert.alert('My Trips', 'Feature coming soon!'),
    },
    {
      id: 2,
      title: 'Saved Places',
      subtitle: 'Home, Work, and favorite locations',
      icon: 'bookmark',
      onPress: () => Alert.alert('Saved Places', 'Feature coming soon!'),
    },
    {
      id: 3,
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      icon: 'card',
      onPress: () => Alert.alert('Payment Methods', 'Feature coming soon!'),
    },
    {
      id: 4,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: 'notifications',
      onPress: () => Alert.alert('Notifications', 'Feature coming soon!'),
    },
    {
      id: 5,
      title: 'Language',
      subtitle: 'English, ಕನ್ನಡ, हिंदी',
      icon: 'language',
      onPress: () => Alert.alert('Language', 'Feature coming soon!'),
    },
    {
      id: 6,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle',
      onPress: () => Alert.alert('Help & Support', 'Feature coming soon!'),
    },
    {
      id: 7,
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle',
      onPress: () => Alert.alert('About', 'Namma BMTC Clone v1.0.0\nBuilt with React Native & Expo'),
    },
  ];

  const quickStats = [
    {
      label: 'Total Trips',
      value: '0',
      icon: 'bus',
      color: Colors.primary,
    },
    {
      label: 'Distance Traveled',
      value: '0 km',
      icon: 'map',
      color: Colors.info,
    },
    {
      label: 'Money Saved',
      value: '₹0',
      icon: 'wallet',
      color: Colors.accent,
    },
  ];

  const renderProfileOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionCard}
      onPress={option.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionIcon}>
        <Ionicons name={option.icon} size={Layout.iconSize.md} color={Colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={Layout.iconSize.md} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderQuickStat = (stat, index) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
        <Ionicons name={stat.icon} size={Layout.iconSize.md} color={Colors.textLight} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.textLight} />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Guest User</Text>
          <Text style={styles.userEmail}>Sign in to sync your data</Text>
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Travel Stats</Text>
          <View style={styles.statsContainer}>
            {quickStats.map(renderQuickStat)}
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <View style={styles.optionsContainer}>
            {profileOptions.map(renderProfileOption)}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.emergencyCard} activeOpacity={0.8}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="warning" size={Layout.iconSize.lg} color={Colors.error} />
            </View>
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Emergency SOS</Text>
              <Text style={styles.emergencySubtitle}>Quick access to emergency services</Text>
            </View>
            <Ionicons name="chevron-forward" size={Layout.iconSize.md} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Namma BMTC Clone - Your Smart Transit Companion
          </Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={Layout.iconSize.md} color={Colors.info} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={Layout.iconSize.md} color={Colors.info} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={Layout.iconSize.md} color={Colors.info} />
            </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    marginBottom: Layout.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userName: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  userEmail: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
  },
  signInText: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  optionSubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  emergencyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: Layout.spacing.xs,
  },
  emergencySubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    marginTop: Layout.spacing.lg,
  },
  appVersion: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  appDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        ApiService.setToken(token);
        const profile = await ApiService.getUserProfile();
        setProfileData(profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profile', screen: 'EditProfile' },
    { icon: 'school-outline', title: 'Learning Preferences', screen: 'LearningStyle' },
    { icon: 'heart-outline', title: 'Interests', screen: 'Interests' },
    { icon: 'settings-outline', title: 'Settings', screen: 'Settings' },
    { icon: 'help-circle-outline', title: 'Help & Support', screen: 'Help' },
    { icon: 'log-out-outline', title: 'Sign Out', action: 'logout' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : profileData ? (
          <>
            <View style={styles.profileCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
                style={styles.avatar}
              />
              <Text style={styles.name}>{profileData.name}</Text>
              <Text style={styles.email}>{profileData.email}</Text>
              
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{profileData.examFocus}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{profileData.learningStyle}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{profileData.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{profileData.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={24} color={colors.primary} />
                <Text style={styles.statValue}>#{profileData.rank}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{profileData.accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            <View style={styles.menuSection}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => item.screen ? navigation.navigate(item.screen) : console.log(item.action)}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons name={item.icon} size={24} color={colors.white} />
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.slate500} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load profile</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    height: 44,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: colors.cardDark,
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.slate500,
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    width: '47%',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardDark,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuTitle: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: colors.slate500,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default ProfileScreen;
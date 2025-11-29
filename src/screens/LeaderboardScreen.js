import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const LeaderboardScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Overall');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        ApiService.setToken(token);
        const data = await ApiService.getLeaderboard();
        setLeaderboardData(data || []);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Overall', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

  const mockData = [
    {
      rank: 1,
      name: 'Adebayo Tunde',
      points: 2450,
      accuracy: 92,
      streak: 25,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      isCurrentUser: true
    },
    {
      rank: 2,
      name: 'Fatima Ibrahim',
      points: 2380,
      accuracy: 89,
      streak: 18,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
      isCurrentUser: false
    },
    {
      rank: 3,
      name: 'Chidi Okafor',
      points: 2290,
      accuracy: 87,
      streak: 22,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      isCurrentUser: false
    },
    {
      rank: 4,
      name: 'Aisha Mohammed',
      points: 2150,
      accuracy: 85,
      streak: 15,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      isCurrentUser: false
    },
    {
      rank: 5,
      name: 'Emeka Nwankwo',
      points: 2050,
      accuracy: 83,
      streak: 12,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
      isCurrentUser: false
    }
  ];

  const displayData = leaderboardData.length > 0 ? leaderboardData : mockData;
  const currentUserRank = displayData.find(user => user.isCurrentUser);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity>
          <Ionicons name="trophy" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.activeCategoryButton]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryButtonText, selectedCategory === category && styles.activeCategoryButtonText]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {currentUserRank && (
          <View style={styles.currentUserCard}>
            <Text style={styles.currentUserTitle}>Your Position</Text>
            <View style={styles.currentUserInfo}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{currentUserRank.rank}</Text>
              </View>
              <Image source={{ uri: currentUserRank.avatar }} style={styles.currentUserAvatar} />
              <View style={styles.currentUserDetails}>
                <Text style={styles.currentUserName}>{currentUserRank.name}</Text>
                <Text style={styles.currentUserPoints}>{currentUserRank.points} points</Text>
              </View>
              <View style={styles.currentUserStats}>
                <Text style={styles.statValue}>{currentUserRank.accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.podiumContainer}>
          <View style={styles.podium}>
            {/* Second Place */}
            <View style={[styles.podiumPosition, styles.secondPlace]}>
              <Image source={{ uri: displayData[1]?.avatar }} style={styles.podiumAvatar} />
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>2</Text>
              </View>
              <Text style={styles.podiumName}>{displayData[1]?.name.split(' ')[0]}</Text>
              <Text style={styles.podiumPoints}>{displayData[1]?.points}</Text>
            </View>

            {/* First Place */}
            <View style={[styles.podiumPosition, styles.firstPlace]}>
              <View style={styles.crownContainer}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
              </View>
              <Image source={{ uri: displayData[0]?.avatar }} style={styles.podiumAvatar} />
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>1</Text>
              </View>
              <Text style={styles.podiumName}>{displayData[0]?.name.split(' ')[0]}</Text>
              <Text style={styles.podiumPoints}>{displayData[0]?.points}</Text>
            </View>

            {/* Third Place */}
            <View style={[styles.podiumPosition, styles.thirdPlace]}>
              <Image source={{ uri: displayData[2]?.avatar }} style={styles.podiumAvatar} />
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>3</Text>
              </View>
              <Text style={styles.podiumName}>{displayData[2]?.name.split(' ')[0]}</Text>
              <Text style={styles.podiumPoints}>{displayData[2]?.points}</Text>
            </View>
          </View>
        </View>

            <View style={styles.leaderboardList}>
              <Text style={styles.listTitle}>Full Rankings</Text>
              {displayData.map((user, index) => (
                <View key={index} style={[styles.leaderboardItem, user.isCurrentUser && styles.currentUserItem]}>
                  <View style={styles.userRank}>
                    <Text style={styles.userRankText}>#{user.rank}</Text>
                  </View>
                  
                  <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={styles.userStats}>
                      <Text style={styles.userPoints}>{user.points} pts</Text>
                      <Text style={styles.userAccuracy}>{user.accuracy}% accuracy</Text>
                    </View>
                  </View>
                  
                  <View style={styles.userBadges}>
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={16} color={colors.primary} />
                      <Text style={styles.streakText}>{user.streak}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
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
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardDark,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  activeCategoryButtonText: {
    color: colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currentUserCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  currentUserTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  currentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  currentUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  currentUserDetails: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  currentUserPoints: {
    fontSize: 14,
    color: colors.slate500,
  },
  currentUserStats: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  podiumContainer: {
    marginBottom: 32,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
  },
  podiumPosition: {
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  firstPlace: {
    minHeight: 140,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  secondPlace: {
    minHeight: 120,
    borderColor: '#C0C0C0',
    borderWidth: 2,
  },
  thirdPlace: {
    minHeight: 100,
    borderColor: '#CD7F32',
    borderWidth: 2,
  },
  crownContainer: {
    position: 'absolute',
    top: -12,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  podiumRank: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.black,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  podiumPoints: {
    fontSize: 12,
    color: colors.slate500,
  },
  leaderboardList: {
    marginBottom: 32,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userRank: {
    width: 30,
    alignItems: 'center',
  },
  userRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  userPoints: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  userAccuracy: {
    fontSize: 12,
    color: colors.slate500,
  },
  userBadges: {
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

export default LeaderboardScreen;
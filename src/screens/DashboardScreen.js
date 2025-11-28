import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const DashboardScreen = ({ navigation }) => {
  const quickAccessItems = [
    { id: 'ai-tutor', name: 'AI Tutor', icon: 'chatbubbles', screen: 'AITutorChat' },
    { id: 'content-generator', name: 'Content Generator', icon: 'create', screen: 'ContentGenerator' },
    { id: 'smart-scheduler', name: 'Smart Scheduler', icon: 'calendar', screen: 'SmartSchedule' },
    { id: 'practice-tests', name: 'Practice Tests', icon: 'help-circle', screen: 'ExerciseInterface' },
    { id: 'progress-analytics', name: 'Progress Analytics', icon: 'analytics', screen: 'ProgressAnalytics' },
    { id: 'digital-notebook', name: 'Digital Notebook', icon: 'book', screen: 'DigitalNotebook' },
    { id: 'leaderboard', name: 'Leaderboard', icon: 'trophy', screen: 'Leaderboard' },
    { id: 'virtual-lab', name: 'Virtual Lab', icon: 'flask', screen: 'VirtualLabHub' },
  ];

  const weeklyData = [
    { day: 'Mon', percentage: 60 },
    { day: 'Tue', percentage: 75 },
    { day: 'Wed', percentage: 50 },
    { day: 'Thu', percentage: 85 },
    { day: 'Fri', percentage: 70 },
    { day: 'Sat', percentage: 95 },
    { day: 'Sun', percentage: 65 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Tunde!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={48} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.learningPathCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop' }}
            style={styles.cardImage}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>MY LEARNING PATH</Text>
            <Text style={styles.cardTitle}>Physics: Kinematics</Text>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressPercentage}>65%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.encouragementText}>You are making great progress!</Text>
              <TouchableOpacity style={styles.continueButton}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="flame" size={18} color={colors.aiBubble} />
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <Text style={styles.statValue}>12 days</Text>
            <Text style={styles.statChange}>+2 today</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="star" size={18} color={colors.aiBubble} />
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <Text style={styles.statValue}>1,500</Text>
            <Text style={styles.statChange}>+100</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trophy" size={18} color={colors.aiBubble} />
              <Text style={styles.statLabel}>Rank</Text>
            </View>
            <Text style={styles.statValue}>#12</Text>
            <View style={styles.rankChange}>
              <Ionicons name="arrow-up" size={16} color="#0bda5b" />
              <Text style={styles.statChange}>1</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          {quickAccessItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.quickAccessIcon}>
                <Ionicons name={item.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickAccessText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {weeklyData.map((data, index) => (
              <View key={data.day} style={styles.chartColumn}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${data.percentage}%`,
                      backgroundColor: index === 6 ? colors.aiBubble : colors.aiBubble + '40',
                    },
                  ]}
                />
                <Text style={[
                  styles.chartLabel,
                  index === 6 && styles.activeChartLabel
                ]}>
                  {data.day}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartDescription}>Correct Answers (%)</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  learningPathCard: {
    margin: 16,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.slate500,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.slate700,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 16,
    color: colors.slate500,
    flex: 1,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 14,
    color: '#0bda5b',
    fontWeight: '500',
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 32,
  },
  quickAccessCard: {
    width: '22%',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  quickAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 14,
  },
  chartCard: {
    margin: 16,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 192,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.slate600,
    paddingBottom: 8,
    paddingLeft: 8,
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '75%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  activeChartLabel: {
    color: colors.white,
    fontWeight: 'bold',
  },
  chartDescription: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DashboardScreen;
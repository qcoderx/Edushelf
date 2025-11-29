import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const ProgressAnalyticsScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');

  const periods = ['Week', 'Month', 'Year'];

  const analyticsData = {
    overall: {
      accuracy: 75,
      streak: 12,
      totalQuestions: 450,
      correctAnswers: 338
    },
    subjects: [
      { name: 'Mathematics', accuracy: 85, progress: 85, color: '#FF6B6B' },
      { name: 'Physics', accuracy: 70, progress: 70, color: '#4ECDC4' },
      { name: 'Chemistry', accuracy: 78, progress: 78, color: '#45B7D1' },
      { name: 'Biology', accuracy: 82, progress: 82, color: '#96CEB4' },
      { name: 'English', accuracy: 68, progress: 68, color: '#FFEAA7' },
    ],
    weeklyData: [
      { day: 'Mon', score: 60 },
      { day: 'Tue', score: 75 },
      { day: 'Wed', score: 50 },
      { day: 'Thu', score: 85 },
      { day: 'Fri', score: 70 },
      { day: 'Sat', score: 95 },
      { day: 'Sun', score: 65 },
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Analytics</Text>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.activePeriodButton]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === period && styles.activePeriodButtonText]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.overallCard}>
          <Text style={styles.cardTitle}>Overall Performance</Text>
          <View style={styles.overallStats}>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>{analyticsData.overall.accuracy}%</Text>
              <Text style={styles.overallLabel}>Accuracy</Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>{analyticsData.overall.streak}</Text>
              <Text style={styles.overallLabel}>Day Streak</Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>{analyticsData.overall.totalQuestions}</Text>
              <Text style={styles.overallLabel}>Questions</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Weekly Performance</Text>
          <View style={styles.chart}>
            {analyticsData.weeklyData.map((data, index) => (
              <View key={data.day} style={styles.chartColumn}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${data.score}%`,
                      backgroundColor: index === 6 ? colors.primary : colors.primary + '40',
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
        </View>

        <View style={styles.subjectsCard}>
          <Text style={styles.cardTitle}>Subject Performance</Text>
          {analyticsData.subjects.map((subject, index) => (
            <View key={index} style={styles.subjectItem}>
              <View style={styles.subjectHeader}>
                <View style={styles.subjectInfo}>
                  <View style={[styles.subjectColor, { backgroundColor: subject.color }]} />
                  <Text style={styles.subjectName}>{subject.name}</Text>
                </View>
                <Text style={styles.subjectAccuracy}>{subject.accuracy}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.cardTitle}>Insights & Recommendations</Text>
          <View style={styles.insight}>
            <Ionicons name="trending-up" size={20} color="#0bda5b" />
            <Text style={styles.insightText}>Your Mathematics performance improved by 15% this week!</Text>
          </View>
          <View style={styles.insight}>
            <Ionicons name="alert-circle" size={20} color="#ff9500" />
            <Text style={styles.insightText}>Focus more on English - it's your weakest subject.</Text>
          </View>
          <View style={styles.insight}>
            <Ionicons name="flame" size={20} color={colors.primary} />
            <Text style={styles.insightText}>Keep up your 12-day streak! You're doing great.</Text>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.cardDark,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  activePeriodButtonText: {
    color: colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  overallCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overallStat: {
    alignItems: 'center',
  },
  overallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  overallLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  chartCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '70%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  activeChartLabel: {
    color: colors.white,
    fontWeight: 'bold',
  },
  subjectsCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  subjectItem: {
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectName: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  subjectAccuracy: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.slate700,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
});

export default ProgressAnalyticsScreen;
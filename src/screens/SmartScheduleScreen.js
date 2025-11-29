import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const SmartScheduleScreen = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState('Today');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      // Schedule endpoint not available in current API
      // Using default data for now
      setSchedule([]);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultScheduleData = {
    Today: [
      { time: '09:00', subject: 'Mathematics', topic: 'Algebra', duration: '45 min', completed: true },
      { time: '10:30', subject: 'Physics', topic: 'Mechanics', duration: '60 min', completed: true },
      { time: '14:00', subject: 'Chemistry', topic: 'Organic Chemistry', duration: '45 min', completed: false },
      { time: '16:00', subject: 'English', topic: 'Essay Writing', duration: '30 min', completed: false },
    ],
    Tomorrow: [
      { time: '09:00', subject: 'Biology', topic: 'Cell Structure', duration: '45 min', completed: false },
      { time: '11:00', subject: 'Mathematics', topic: 'Calculus', duration: '60 min', completed: false },
      { time: '15:00', subject: 'Physics', topic: 'Waves', duration: '45 min', completed: false },
    ]
  };

  const days = ['Today', 'Tomorrow'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Schedule</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === day && styles.activeDayButton]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayButtonText, selectedDay === day && styles.activeDayButtonText]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <View style={styles.progressStats}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>2/4</Text>
                  <Text style={styles.progressLabel}>Completed</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>2h 15m</Text>
                  <Text style={styles.progressLabel}>Study Time</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>50%</Text>
                  <Text style={styles.progressLabel}>Progress</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '50%' }]} />
              </View>
            </View>

            <View style={styles.scheduleList}>
              {(schedule.length > 0 ? schedule : defaultScheduleData[selectedDay] || []).map((item, index) => (
                <View key={index} style={[styles.scheduleItem, item.completed && styles.completedItem]}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                  
                  <View style={styles.contentContainer}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                    <Text style={styles.topicText}>{item.topic}</Text>
                  </View>
                  
                  <TouchableOpacity style={[styles.statusButton, item.completed && styles.completedButton]}>
                    <Ionicons 
                      name={item.completed ? 'checkmark' : 'play'} 
                      size={20} 
                      color={item.completed ? colors.white : colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color={colors.black} />
              <Text style={styles.addButtonText}>Add Study Session</Text>
            </TouchableOpacity>
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
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.cardDark,
    alignItems: 'center',
  },
  activeDayButton: {
    backgroundColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
  activeDayButtonText: {
    color: colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  progressCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.slate500,
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
  scheduleList: {
    gap: 12,
    marginBottom: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  completedItem: {
    opacity: 0.7,
    backgroundColor: colors.slate800,
  },
  timeContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  durationText: {
    fontSize: 12,
    color: colors.slate500,
  },
  contentContainer: {
    flex: 1,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 14,
    color: colors.slate500,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 32,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

export default SmartScheduleScreen;
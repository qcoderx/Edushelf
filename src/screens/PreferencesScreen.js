import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const PreferencesScreen = ({ navigation }) => {
  const [studyTime, setStudyTime] = useState('Evening');
  const [sessionLength, setSessionLength] = useState('30 minutes');
  const [environment, setEnvironment] = useState('Quiet');

  const handleFinish = async () => {
    try {
      // Get stored onboarding data
      const examFocus = await AsyncStorage.getItem('selectedExam');
      const learningStyle = await AsyncStorage.getItem('selectedLearningStyle');
      const interests = await AsyncStorage.getItem('selectedInterests');
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        ApiService.setToken(token);
        
        // Update user profile with all onboarding data
        await ApiService.updateUserProfile({
          examFocus,
          learningStyle,
          interests: interests ? JSON.parse(interests) : [],
          studyPreferences: {
            studyTime,
            sessionLength,
            environment
          }
        });
        
        // Clear temporary onboarding data
        await AsyncStorage.multiRemove(['selectedExam', 'selectedLearningStyle', 'selectedInterests']);
      }
      
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={[styles.progressBar, styles.activeProgress]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Study Preferences</Text>
        <Text style={styles.subtitle}>Help us create the perfect study schedule for you.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Study Time</Text>
          <View style={styles.optionsContainer}>
            {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.option, studyTime === time && styles.selectedOption]}
                onPress={() => setStudyTime(time)}
              >
                <Text style={[styles.optionText, studyTime === time && styles.selectedOptionText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Length</Text>
          <View style={styles.optionsContainer}>
            {['15 minutes', '30 minutes', '45 minutes', '1 hour'].map((length) => (
              <TouchableOpacity
                key={length}
                style={[styles.option, sessionLength === length && styles.selectedOption]}
                onPress={() => setSessionLength(length)}
              >
                <Text style={[styles.optionText, sessionLength === length && styles.selectedOptionText]}>
                  {length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Environment</Text>
          <View style={styles.optionsContainer}>
            {['Quiet', 'Background Music', 'Nature Sounds', 'White Noise'].map((env) => (
              <TouchableOpacity
                key={env}
                style={[styles.option, environment === env && styles.selectedOption]}
                onPress={() => setEnvironment(env)}
              >
                <Text style={[styles.optionText, environment === env && styles.selectedOptionText]}>
                  {env}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.slate700,
    borderRadius: 2,
  },
  activeProgress: {
    backgroundColor: colors.aiBubble,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: colors.slate500,
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.slate700,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate600,
  },
  selectedOption: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.backgroundDark,
  },
  finishButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default PreferencesScreen;
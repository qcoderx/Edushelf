import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const LearningChallengesScreen = ({ navigation }) => {
  const [selectedChallenges, setSelectedChallenges] = useState([]);

  const challenges = [
    { id: 'time_management', name: 'Time Management', icon: 'time-outline', description: 'Struggling to organize study time effectively' },
    { id: 'concentration', name: 'Concentration Issues', icon: 'eye-off-outline', description: 'Difficulty focusing during study sessions' },
    { id: 'memory_retention', name: 'Memory & Retention', icon: 'brain-outline', description: 'Trouble remembering what I study' },
    { id: 'math_anxiety', name: 'Math Anxiety', icon: 'calculator-outline', description: 'Fear or stress when dealing with mathematics' },
    { id: 'exam_anxiety', name: 'Exam Anxiety', icon: 'alert-circle-outline', description: 'Nervousness during tests and exams' },
    { id: 'motivation', name: 'Lack of Motivation', icon: 'battery-dead-outline', description: 'Difficulty staying motivated to study' },
    { id: 'understanding', name: 'Concept Understanding', icon: 'help-circle-outline', description: 'Trouble grasping complex concepts' },
    { id: 'note_taking', name: 'Note Taking', icon: 'document-text-outline', description: 'Difficulty organizing and taking effective notes' },
  ];

  const toggleChallenge = (challengeId) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleNext = async () => {
    await AsyncStorage.setItem('selectedChallenges', JSON.stringify(selectedChallenges));
    navigation.navigate('MotivationFactors');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What challenges do you face?</Text>
        <Text style={styles.subtitle}>Help us understand your learning obstacles so we can provide targeted support.</Text>

        <View style={styles.challengesContainer}>
          {challenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.challengeCard,
                selectedChallenges.includes(challenge.id) && styles.selectedCard
              ]}
              onPress={() => toggleChallenge(challenge.id)}
            >
              <View style={styles.challengeHeader}>
                <View style={styles.challengeIcon}>
                  <Ionicons 
                    name={challenge.icon} 
                    size={24} 
                    color={selectedChallenges.includes(challenge.id) ? colors.primary : colors.slate500} 
                  />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={[styles.challengeName, selectedChallenges.includes(challenge.id) && styles.selectedText]}>
                    {challenge.name}
                  </Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedChallenges.includes(challenge.id) && styles.checkedBox
                ]}>
                  {selectedChallenges.includes(challenge.id) && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
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
  backButton: {
    padding: 8,
    marginLeft: -8,
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
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: colors.slate500,
    marginBottom: 32,
    lineHeight: 22,
  },
  challengesContainer: {
    gap: 12,
    paddingBottom: 100,
  },
  challengeCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate600,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.slate700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeContent: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  selectedText: {
    color: colors.primary,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.slate500,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.slate500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.backgroundDark,
  },
  nextButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default LearningChallengesScreen;
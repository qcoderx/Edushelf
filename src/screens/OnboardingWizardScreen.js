import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const OnboardingWizardScreen = ({ navigation }) => {
  const [selectedExams, setSelectedExams] = useState(['WAEC']);

  const exams = [
    { id: 'WAEC', name: 'WAEC', description: 'Senior School Certificate', color: '#2DE2E6' },
    { id: 'JAMB', name: 'JAMB', description: 'University Matriculation', color: '#FF6B35' },
    { id: 'POST_UTME', name: 'Post-UTME', description: 'University Screening', color: '#FF1744' },
    { id: 'A_LEVELS', name: 'A-Levels', description: 'Advanced Level Exams', color: '#00C853' },
  ];

  const toggleExam = (examId) => {
    setSelectedExams(prev => 
      prev.includes(examId) 
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const handleContinue = async () => {
    // Save selected exam (use first selected exam as primary)
    const primaryExam = selectedExams[0];
    await AsyncStorage.setItem('selectedExam', primaryExam);
    navigation.navigate('LearningStyle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome to Lumina! What are you preparing for?</Text>
        <Text style={styles.subtitle}>Select all that apply to personalize your learning plan.</Text>

        <View style={styles.examGrid}>
          {exams.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              style={[
                styles.examCard,
                selectedExams.includes(exam.id) && styles.selectedCard
              ]}
              onPress={() => toggleExam(exam.id)}
            >
              <View style={[styles.examImage, { backgroundColor: exam.color + '20' }]}>
                <View style={[styles.examIcon, { backgroundColor: exam.color }]} />
              </View>
              <Text style={styles.examName}>{exam.name}</Text>
              <Text style={styles.examDescription}>{exam.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
    marginBottom: 24,
    lineHeight: 22,
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 100,
  },
  examCard: {
    width: '47%',
    backgroundColor: colors.slate700,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  examImage: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  examName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  examDescription: {
    fontSize: 14,
    color: colors.slate500,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.backgroundDark,
  },
  continueButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default OnboardingWizardScreen;
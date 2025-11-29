import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const PracticeTestSetupScreen = ({ navigation }) => {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const examTypes = [
    { id: 'JAMB', name: 'JAMB (UTME)', icon: 'school' },
    { id: 'WAEC', name: 'WAEC (SSCE)', icon: 'library' },
    { id: 'General', name: 'General Practice', icon: 'book' }
  ];

  const subjects = {
    JAMB: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'],
    WAEC: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Geography', 'History'],
    General: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Computer Science']
  };

  const difficulties = [
    { id: 'easy', name: 'Easy', description: 'Basic concepts' },
    { id: 'medium', name: 'Medium', description: 'Intermediate level' },
    { id: 'hard', name: 'Hard', description: 'Advanced concepts' }
  ];

  const canProceed = selectedExam && selectedSubject && selectedDifficulty;

  const handleStartTest = () => {
    navigation.navigate('ExerciseInterface', {
      examType: selectedExam,
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      questionCount: 10
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Test Setup</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Select Exam Type</Text>
        <View style={styles.optionsGrid}>
          {examTypes.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              style={[styles.optionCard, selectedExam === exam.id && styles.selectedCard]}
              onPress={() => setSelectedExam(exam.id)}
            >
              <Ionicons name={exam.icon} size={32} color={selectedExam === exam.id ? colors.primary : colors.slate400} />
              <Text style={[styles.optionText, selectedExam === exam.id && styles.selectedText]}>
                {exam.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedExam && (
          <>
            <Text style={styles.sectionTitle}>Select Subject</Text>
            <View style={styles.subjectGrid}>
              {subjects[selectedExam].map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[styles.subjectChip, selectedSubject === subject && styles.selectedChip]}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text style={[styles.chipText, selectedSubject === subject && styles.selectedChipText]}>
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {selectedSubject && (
          <>
            <Text style={styles.sectionTitle}>Select Difficulty</Text>
            <View style={styles.difficultyList}>
              {difficulties.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty.id}
                  style={[styles.difficultyCard, selectedDifficulty === difficulty.id && styles.selectedCard]}
                  onPress={() => setSelectedDifficulty(difficulty.id)}
                >
                  <View style={styles.difficultyContent}>
                    <Text style={[styles.difficultyName, selectedDifficulty === difficulty.id && styles.selectedText]}>
                      {difficulty.name}
                    </Text>
                    <Text style={styles.difficultyDesc}>{difficulty.description}</Text>
                  </View>
                  {selectedDifficulty === difficulty.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.startButton, !canProceed && styles.disabledButton]} 
          onPress={handleStartTest}
          disabled={!canProceed}
        >
          <Text style={[styles.startButtonText, !canProceed && styles.disabledText]}>
            Start 10-Question Test
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    height: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 24,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  selectedText: {
    color: colors.primary,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  subjectChip: {
    backgroundColor: colors.cardDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.slate600,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  selectedChipText: {
    color: colors.black,
  },
  difficultyList: {
    gap: 12,
  },
  difficultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyContent: {
    flex: 1,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  difficultyDesc: {
    fontSize: 14,
    color: colors.slate400,
  },
  footer: {
    padding: 16,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.slate600,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  disabledText: {
    color: colors.slate400,
  },
});

export default PracticeTestSetupScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const ExerciseInterfaceScreen = ({ navigation, route }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  const { examType, subject, difficulty, questionCount } = route.params || {};

  useEffect(() => {
    loadUserProfile();
    generateQuestions();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const generateQuestions = async () => {
    try {
      const response = await fetch('https://edushelf-re0u.onrender.com/api/practice-test/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: examType || 'General',
          subject: subject || 'Mathematics',
          difficulty: difficulty || 'medium',
          questionCount: questionCount || 10,
          userProfile
        })
      });
      
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleNext = () => {
    if (selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer
      }));
      
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
      } else {
        // Test completed
        navigation.navigate('ExerciseResults', {
          questions,
          userAnswers: { ...userAnswers, [currentQuestionIndex]: selectedAnswer },
          examType,
          subject
        });
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Generating your practice test...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load questions</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateQuestions}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{examType} {subject}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.questionCounter}>Question {currentQuestionIndex + 1} of {totalQuestions}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionTitle}>Question {currentQuestionIndex + 1}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedAnswer === option.id && styles.selectedOption
              ]}
              onPress={() => setSelectedAnswer(option.id)}
            >
              <View style={[
                styles.radioButton,
                selectedAnswer === option.id && styles.selectedRadio
              ]}>
                {selectedAnswer === option.id && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.optionText}>{option.id.toUpperCase()}. {option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, !selectedAnswer && styles.disabledButton]} 
          onPress={handleNext}
          disabled={!selectedAnswer}
        >
          <Text style={[styles.submitButtonText, !selectedAnswer && styles.disabledText]}>
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Test'}
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionCounter: {
    fontSize: 14,
    color: colors.aiBubble,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.slate700,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.aiBubble,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    color: colors.slate500,
    lineHeight: 22,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 100,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate700,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate600,
    gap: 16,
  },
  selectedOption: {
    borderColor: colors.aiBubble,
    backgroundColor: colors.primary + '10',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.slate500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.backgroundDark,
  },
  submitButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  disabledButton: {
    backgroundColor: colors.slate600,
  },
  disabledText: {
    color: colors.slate400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.slate400,
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

export default ExerciseInterfaceScreen;
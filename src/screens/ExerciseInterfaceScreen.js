import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const ExerciseInterfaceScreen = ({ navigation }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('C');
  const currentQuestion = 5;
  const totalQuestions = 20;
  const progress = (currentQuestion / totalQuestions) * 100;

  const question = {
    text: "In a series R-L-C circuit, the voltage across the resistor and the inductor are 20V and 40V respectively. What is the voltage across the capacitor if the source voltage is 50V?",
    options: [
      { id: 'A', text: 'A. 10V' },
      { id: 'B', text: 'B. 20V' },
      { id: 'C', text: 'C. 30V' },
      { id: 'D', text: 'D. 40V' },
    ]
  };

  const handleSubmit = () => {
    navigation.navigate('ExerciseResults', { 
      selectedAnswer, 
      correctAnswer: 'C',
      currentQuestion,
      totalQuestions 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Physics - Practice Set 1</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.questionCounter}>Question {currentQuestion} of {totalQuestions}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionTitle}>Question {currentQuestion}</Text>
        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
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
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Answer</Text>
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
});

export default ExerciseInterfaceScreen;
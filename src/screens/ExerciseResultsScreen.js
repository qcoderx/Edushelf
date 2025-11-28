import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const ExerciseResultsScreen = ({ navigation, route }) => {
  const { selectedAnswer, correctAnswer, currentQuestion, totalQuestions } = route?.params || {};
  const isCorrect = selectedAnswer === correctAnswer;

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question {currentQuestion} of {totalQuestions}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={[styles.resultCard, isCorrect ? styles.correctCard : styles.incorrectCard]}>
          <View style={styles.resultIcon}>
            <Ionicons 
              name={isCorrect ? 'checkmark-circle' : 'close-circle'} 
              size={80} 
              color={isCorrect ? '#0bda5b' : '#ff4444'} 
            />
          </View>
          
          <Text style={styles.resultTitle}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </Text>
          
          <Text style={styles.resultSubtitle}>
            {isCorrect 
              ? 'Great job! You got it right.' 
              : `The correct answer is ${correctAnswer}.`
            }
          </Text>
        </View>

        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>Explanation</Text>
          <Text style={styles.explanationText}>
            In a series R-L-C circuit, we can use Kirchhoff's voltage law. The source voltage equals the vector sum of voltages across all components. Given that VR = 20V, VL = 40V, and Vsource = 50V, we can find VC using the relationship: Vsource² = VR² + (VL - VC)²
          </Text>
          <Text style={styles.explanationText}>
            Solving: 50² = 20² + (40 - VC)²
            2500 = 400 + (40 - VC)²
            2100 = (40 - VC)²
            √2100 ≈ 45.8 = |40 - VC|
            Therefore, VC = 30V
          </Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>75%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+50</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentQuestion < totalQuestions ? 'Next Question' : 'Finish'}
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  correctCard: {
    borderColor: '#0bda5b',
  },
  incorrectCard: {
    borderColor: '#ff4444',
  },
  resultIcon: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: colors.slate500,
    textAlign: 'center',
  },
  explanationCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    color: colors.slate500,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.slate500,
  },
  footer: {
    padding: 16,
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

export default ExerciseResultsScreen;
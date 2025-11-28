import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

const QuestionCard = ({ question, options, onShowExplanation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>{question}</Text>
        <View style={styles.optionsContainer}>
          <Text style={styles.options}>{options}</Text>
          <TouchableOpacity style={styles.button} onPress={onShowExplanation}>
            <Text style={styles.buttonText}>Show Explanation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.slate200,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 10,
  },
  options: {
    fontSize: 16,
    color: colors.slate600,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.userBubble,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default QuestionCard;
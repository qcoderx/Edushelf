import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const LearningStyleScreen = ({ navigation }) => {
  const [selectedStyle, setSelectedStyle] = useState('Visual');

  const learningStyles = [
    {
      id: 'Visual',
      name: 'Visual',
      description: 'I understand concepts best with diagrams, charts, and videos.',
      icon: 'eye',
    },
    {
      id: 'Auditory',
      name: 'Auditory',
      description: 'I learn well by listening to lectures, discussions, and audio.',
      icon: 'volume-high',
    },
    {
      id: 'Kinesthetic',
      name: 'Kinesthetic',
      description: 'I prefer to learn by doing, practicing, and hands-on activities.',
      icon: 'hand-left',
    },
    {
      id: 'Reading',
      name: 'Reading & Writing',
      description: 'I absorb information best by reading texts and taking detailed notes.',
      icon: 'document-text',
    },
  ];

  const handleNext = async () => {
    // Save selected learning style
    await AsyncStorage.setItem('selectedLearningStyle', selectedStyle);
    navigation.navigate('LearningChallenges');
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
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How do you learn best?</Text>
        <Text style={styles.subtitle}>
          Select the style that sounds most like you. This helps us personalize your lessons.
        </Text>

        <View style={styles.optionsContainer}>
          {learningStyles.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.optionCard,
                selectedStyle === style.id && styles.selectedOption
              ]}
              onPress={() => setSelectedStyle(style.id)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={style.icon} size={24} color={colors.aiBubble} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{style.name}</Text>
                <Text style={styles.optionDescription}>{style.description}</Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedStyle === style.id && styles.selectedRadio
              ]}>
                {selectedStyle === style.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
    paddingHorizontal: 20,
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
  optionsContainer: {
    gap: 16,
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
    borderColor: colors.userBubble,
    backgroundColor: colors.userBubble + '10',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.aiBubble + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.slate500,
    lineHeight: 20,
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
    borderColor: colors.userBubble,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.userBubble,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.backgroundDark,
  },
  nextButton: {
    height: 56,
    backgroundColor: colors.aiBubble,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default LearningStyleScreen;
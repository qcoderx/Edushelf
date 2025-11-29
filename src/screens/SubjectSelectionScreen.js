import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const SubjectSelectionScreen = ({ navigation }) => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: 'calculator', color: '#FF6B35' },
    { id: 'physics', name: 'Physics', icon: 'planet', color: '#4ECDC4' },
    { id: 'chemistry', name: 'Chemistry', icon: 'flask', color: '#45B7D1' },
    { id: 'biology', name: 'Biology', icon: 'leaf', color: '#96CEB4' },
    { id: 'english', name: 'English Language', icon: 'book', color: '#FFEAA7' },
    { id: 'literature', name: 'Literature', icon: 'library', color: '#DDA0DD' },
    { id: 'geography', name: 'Geography', icon: 'earth', color: '#98D8C8' },
    { id: 'economics', name: 'Economics', icon: 'trending-up', color: '#F7DC6F' },
    { id: 'government', name: 'Government', icon: 'business', color: '#BB8FCE' },
    { id: 'history', name: 'History', icon: 'time', color: '#F8C471' },
    { id: 'commerce', name: 'Commerce', icon: 'storefront', color: '#85C1E9' },
    { id: 'accounting', name: 'Accounting', icon: 'receipt', color: '#F1948A' },
  ];

  const toggleSubject = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleNext = async () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }
    await AsyncStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
    navigation.navigate('LearningStyle');
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
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Which subjects are you studying?</Text>
        <Text style={styles.subtitle}>Select all subjects you want to focus on. We'll personalize your learning path accordingly.</Text>

        <View style={styles.subjectsGrid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={[
                styles.subjectCard,
                selectedSubjects.includes(subject.id) && styles.selectedCard
              ]}
              onPress={() => toggleSubject(subject.id)}
            >
              <View style={[styles.subjectIcon, { backgroundColor: subject.color + '20' }]}>
                <Ionicons name={subject.icon} size={24} color={subject.color} />
              </View>
              <Text style={styles.subjectName}>{subject.name}</Text>
              {selectedSubjects.includes(subject.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, selectedSubjects.length === 0 && styles.disabledButton]} 
          onPress={handleNext}
          disabled={selectedSubjects.length === 0}
        >
          <Text style={styles.nextButtonText}>Next ({selectedSubjects.length} selected)</Text>
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
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 100,
  },
  subjectCard: {
    width: '47%',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  disabledButton: {
    backgroundColor: colors.slate600,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default SubjectSelectionScreen;
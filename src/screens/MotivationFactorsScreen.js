import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const MotivationFactorsScreen = ({ navigation }) => {
  const [selectedFactors, setSelectedFactors] = useState([]);

  const motivationFactors = [
    { id: 'career_goals', name: 'Career Goals', icon: 'briefcase', description: 'Achieving my dream job or profession' },
    { id: 'family_pride', name: 'Family Pride', icon: 'heart', description: 'Making my family proud of my achievements' },
    { id: 'university_admission', name: 'University Admission', icon: 'school', description: 'Getting into my preferred university' },
    { id: 'personal_growth', name: 'Personal Growth', icon: 'trending-up', description: 'Becoming a better version of myself' },
    { id: 'competition', name: 'Healthy Competition', icon: 'trophy', description: 'Competing with friends and peers' },
    { id: 'financial_security', name: 'Financial Security', icon: 'card', description: 'Securing a stable financial future' },
    { id: 'knowledge_love', name: 'Love of Learning', icon: 'book-open', description: 'Genuine curiosity and love for knowledge' },
    { id: 'role_model', name: 'Being a Role Model', icon: 'star', description: 'Inspiring others through my success' },
  ];

  const toggleFactor = (factorId) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const handleNext = async () => {
    await AsyncStorage.setItem('selectedMotivationFactors', JSON.stringify(selectedFactors));
    navigation.navigate('Interests');
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
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={styles.progressBar} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What motivates you to study?</Text>
        <Text style={styles.subtitle}>Understanding your motivation helps us keep you engaged and focused on your goals.</Text>

        <View style={styles.factorsContainer}>
          {motivationFactors.map((factor) => (
            <TouchableOpacity
              key={factor.id}
              style={[
                styles.factorCard,
                selectedFactors.includes(factor.id) && styles.selectedCard
              ]}
              onPress={() => toggleFactor(factor.id)}
            >
              <View style={styles.factorHeader}>
                <View style={[styles.factorIcon, selectedFactors.includes(factor.id) && styles.selectedIcon]}>
                  <Ionicons 
                    name={factor.icon} 
                    size={24} 
                    color={selectedFactors.includes(factor.id) ? colors.white : colors.primary} 
                  />
                </View>
                <View style={styles.factorContent}>
                  <Text style={[styles.factorName, selectedFactors.includes(factor.id) && styles.selectedText]}>
                    {factor.name}
                  </Text>
                  <Text style={styles.factorDescription}>{factor.description}</Text>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedFactors.includes(factor.id) && styles.checkedBox
                ]}>
                  {selectedFactors.includes(factor.id) && (
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
  factorsContainer: {
    gap: 12,
    paddingBottom: 100,
  },
  factorCard: {
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
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  factorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    backgroundColor: colors.primary,
  },
  factorContent: {
    flex: 1,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  selectedText: {
    color: colors.primary,
  },
  factorDescription: {
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

export default MotivationFactorsScreen;
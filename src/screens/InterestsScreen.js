import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const InterestsScreen = ({ navigation }) => {
  const [selectedInterests, setSelectedInterests] = useState(['Football', 'Movies', 'Art']);
  const [searchText, setSearchText] = useState('');

  const interests = [
    { id: 'Football', name: 'Football', icon: 'football' },
    { id: 'Music', name: 'Music', icon: 'musical-notes' },
    { id: 'Movies', name: 'Movies', icon: 'film' },
    { id: 'Gaming', name: 'Gaming', icon: 'game-controller' },
    { id: 'Coding', name: 'Coding', icon: 'code-slash' },
    { id: 'Art', name: 'Art', icon: 'color-palette' },
    { id: 'Fashion', name: 'Fashion', icon: 'shirt' },
    { id: 'Food', name: 'Food', icon: 'restaurant' },
  ];

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinue = () => {
    navigation.navigate('Preferences');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Your Interests</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={[styles.progressBar, styles.activeProgress]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are you passionate about?</Text>
        <Text style={styles.subtitle}>This helps us personalize your learning journey.</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.slate500} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or add your own"
            placeholderTextColor={colors.slate500}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.interestsGrid}>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestCard,
                selectedInterests.includes(interest.id) && styles.selectedInterest
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <Ionicons
                name={interest.icon}
                size={32}
                color={selectedInterests.includes(interest.id) ? colors.userBubble : colors.slate500}
              />
              <Text style={[
                styles.interestName,
                selectedInterests.includes(interest.id) && styles.selectedInterestName
              ]}>
                {interest.name}
              </Text>
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
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.aiBubble + '30',
    borderRadius: 3,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate700,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 100,
  },
  interestCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate600,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  selectedInterest: {
    borderColor: colors.userBubble,
    backgroundColor: colors.userBubble + '20',
    borderWidth: 2,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  selectedInterestName: {
    color: colors.userBubble,
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
    height: 48,
    backgroundColor: colors.aiBubble,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default InterestsScreen;
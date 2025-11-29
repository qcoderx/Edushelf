import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

const InterestsScreen = ({ navigation }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [customInterests, setCustomInterests] = useState([]);

  const predefinedInterests = [
    { id: 'Football', name: 'Football', icon: 'football' },
    { id: 'Music', name: 'Music', icon: 'musical-notes' },
    { id: 'Movies', name: 'Movies', icon: 'film' },
    { id: 'Gaming', name: 'Gaming', icon: 'game-controller' },
    { id: 'Coding', name: 'Coding', icon: 'code-slash' },
    { id: 'Art', name: 'Art', icon: 'color-palette' },
    { id: 'Fashion', name: 'Fashion', icon: 'shirt' },
    { id: 'Food', name: 'Food', icon: 'restaurant' },
    { id: 'Reading', name: 'Reading', icon: 'book' },
    { id: 'Travel', name: 'Travel', icon: 'airplane' },
    { id: 'Photography', name: 'Photography', icon: 'camera' },
    { id: 'Dancing', name: 'Dancing', icon: 'musical-note' },
    { id: 'Fitness', name: 'Fitness', icon: 'fitness' },
    { id: 'Technology', name: 'Technology', icon: 'phone-portrait' },
    { id: 'Science', name: 'Science', icon: 'flask' },
    { id: 'Business', name: 'Business', icon: 'briefcase' },
  ];

  const allInterests = [...predefinedInterests, ...customInterests];

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const addCustomInterest = () => {
    if (searchText.trim() && !allInterests.find(i => i.name.toLowerCase() === searchText.toLowerCase())) {
      const newInterest = {
        id: searchText.trim(),
        name: searchText.trim(),
        icon: 'heart',
        isCustom: true
      };
      setCustomInterests(prev => [...prev, newInterest]);
      setSelectedInterests(prev => [...prev, newInterest.id]);
      setSearchText('');
    }
  };

  const filteredInterests = allInterests.filter(interest => 
    interest.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const showAddButton = searchText.trim() && !allInterests.find(i => 
    i.name.toLowerCase() === searchText.toLowerCase()
  );

  const handleContinue = async () => {
    // Save selected interests
    await AsyncStorage.setItem('selectedInterests', JSON.stringify(selectedInterests));
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
            placeholder="Search or add your own interest"
            placeholderTextColor={colors.slate500}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={addCustomInterest}
          />
          {showAddButton && (
            <TouchableOpacity style={styles.addButton} onPress={addCustomInterest}>
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {showAddButton && (
          <TouchableOpacity style={styles.addInterestCard} onPress={addCustomInterest}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.addInterestText}>Add "{searchText}"</Text>
          </TouchableOpacity>
        )}

        <View style={styles.interestsGrid}>
          {filteredInterests.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestCard,
                selectedInterests.includes(interest.id) && styles.selectedInterest,
                interest.isCustom && styles.customInterestCard
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <View style={styles.interestIconContainer}>
                <Ionicons
                  name={interest.icon}
                  size={28}
                  color={selectedInterests.includes(interest.id) ? colors.primary : colors.slate400}
                />
                {interest.isCustom && (
                  <View style={styles.customBadge}>
                    <Text style={styles.customBadgeText}>+</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.interestName,
                selectedInterests.includes(interest.id) && styles.selectedInterestName
              ]}>
                {interest.name}
              </Text>
              {selectedInterests.includes(interest.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, selectedInterests.length === 0 && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={selectedInterests.length === 0}
        >
          <Text style={[styles.continueButtonText, selectedInterests.length === 0 && styles.disabledButtonText]}>
            Continue {selectedInterests.length > 0 && `(${selectedInterests.length})`}
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
    paddingVertical: 8,
    height: 44,
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
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 52,
    borderWidth: 1,
    borderColor: colors.slate600,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  addInterestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addInterestText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  interestCard: {
    width: '47%',
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate600,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 100,
    position: 'relative',
  },
  selectedInterest: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
  },
  customInterestCard: {
    borderStyle: 'dashed',
  },
  interestIconContainer: {
    position: 'relative',
  },
  customBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  interestName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  selectedInterestName: {
    color: colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCount: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedCountText: {
    fontSize: 14,
    color: colors.slate400,
    fontWeight: '500',
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
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.slate600,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  disabledButtonText: {
    color: colors.slate400,
  },
});

export default InterestsScreen;
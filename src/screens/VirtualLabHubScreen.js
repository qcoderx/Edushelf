import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { experiments, getExperimentsBySubject, getWAECRecommended, searchExperiments } from '../data/experiments';

const VirtualLabHubScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Chemistry', 'Physics', 'Biology', 'Mathematics'];

  const getFilteredExperiments = () => {
    if (searchQuery) {
      return searchExperiments(searchQuery);
    }
    if (selectedFilter === 'All') {
      return experiments;
    }
    return getExperimentsBySubject(selectedFilter);
  };

  const waecRecommended = getWAECRecommended();
  const chemistryExperiments = getExperimentsBySubject('Chemistry');
  const physicsExperiments = getExperimentsBySubject('Physics');

  const ExperimentCard = ({ experiment, size = 'normal' }) => (
    <TouchableOpacity 
      style={[styles.experimentCard, size === 'large' && styles.largeCard]}
      onPress={() => navigation.navigate('ActiveExperiment', { experiment })}
    >
      <Image source={{ uri: experiment.thumbnail }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <View style={styles.cardHeader}>
          <View style={[styles.difficultyBadge, 
            experiment.difficulty === 'beginner' && styles.beginnerBadge,
            experiment.difficulty === 'intermediate' && styles.intermediateBadge,
            experiment.difficulty === 'advanced' && styles.advancedBadge
          ]}>
            <Text style={styles.difficultyText}>{experiment.difficulty.toUpperCase()}</Text>
          </View>
          {experiment.waecRelevant && (
            <View style={styles.waecBadge}>
              <Text style={styles.waecText}>WAEC</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{experiment.title}</Text>
          <Text style={styles.cardSubject}>{experiment.subject} • {experiment.topic}</Text>
          <Text style={styles.cardDuration}>{experiment.duration}</Text>
        </View>
        <TouchableOpacity 
          style={styles.runButton}
          onPress={() => navigation.navigate('ActiveExperiment', { experiment })}
        >
          <Ionicons name="play-circle" size={24} color={colors.primary} />
          <Text style={styles.runButtonText}>Run Experiment</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, subtitle }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Laboratory</Text>
        <TouchableOpacity>
          <Ionicons name="flask" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.slate500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search experiments..."
            placeholderTextColor={colors.slate500}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.slate500} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selectedFilter === filter && styles.activeFilterChip]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!searchQuery && (
          <>
            {/* Hero Section - Featured Experiment */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Featured Lab</Text>
              <ExperimentCard experiment={waecRecommended[0]} size="large" />
            </View>

            {/* WAEC Recommended */}
            <SectionHeader 
              title="Recommended for WAEC 2024" 
              subtitle="Essential practicals for your exams"
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={waecRecommended.slice(1, 6)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ExperimentCard experiment={item} />}
              contentContainerStyle={styles.horizontalList}
            />

            {/* Chemistry Practicals */}
            <SectionHeader 
              title="Chemistry Practicals" 
              subtitle="Master titrations, reactions & analysis"
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={chemistryExperiments.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ExperimentCard experiment={item} />}
              contentContainerStyle={styles.horizontalList}
            />

            {/* Physics Simulations */}
            <SectionHeader 
              title="Physics Simulations" 
              subtitle="Explore electricity, mechanics & waves"
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={physicsExperiments.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ExperimentCard experiment={item} />}
              contentContainerStyle={styles.horizontalList}
            />
          </>
        )}

        {/* Search Results or Filtered Results */}
        {(searchQuery || selectedFilter !== 'All') && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : `${selectedFilter} Experiments`}
            </Text>
            <View style={styles.resultsGrid}>
              {getFilteredExperiments().map((experiment) => (
                <View key={experiment.id} style={styles.gridItem}>
                  <ExperimentCard experiment={experiment} />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.slate700,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  activeFilterText: {
    color: colors.black,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.slate400,
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  experimentCard: {
    width: 280,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cardDark,
  },
  largeCard: {
    width: '100%',
    height: 240,
    marginRight: 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.slate700,
  },
  beginnerBadge: {
    backgroundColor: '#22c55e',
  },
  intermediateBadge: {
    backgroundColor: '#f59e0b',
  },
  advancedBadge: {
    backgroundColor: '#ef4444',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  waecBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  waecText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.black,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  cardSubject: {
    fontSize: 14,
    color: colors.slate300,
    marginBottom: 2,
  },
  cardDuration: {
    fontSize: 12,
    color: colors.slate400,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 227, 230, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  runButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  resultsSection: {
    paddingHorizontal: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  bottomPadding: {
    height: 100,
  },
});

export default VirtualLabHubScreen;
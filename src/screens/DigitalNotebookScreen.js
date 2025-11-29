import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const DigitalNotebookScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      // Notes endpoint not available in current API
      // Using default data for now
      setNotes([]);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultNoteSections = {
    Today: [
      {
        id: 1,
        title: 'Summary of Photosynthesis',
        type: 'Lesson Summary',
        subject: 'Biology',
        time: '10:45 AM',
        icon: 'book-outline'
      },
      {
        id: 2,
        title: 'Quiz: Algebraic Expressions',
        type: 'Quiz Result • 8/10',
        subject: 'Mathematics',
        time: '09:30 AM',
        icon: 'checkmark-circle-outline'
      },
      {
        id: 3,
        title: 'Mnemonic for the first 20 elements',
        type: 'User Note',
        subject: 'Chemistry',
        time: '08:15 AM',
        icon: 'create-outline'
      }
    ],
    Yesterday: [
      {
        id: 4,
        title: 'Key Concepts in Thermodynamics',
        type: 'Generated Summary',
        subject: 'Physics',
        time: '3:12 PM',
        icon: 'book-outline'
      },
      {
        id: 5,
        title: 'Literary Devices in Poetry',
        type: 'Quiz Result • 10/10',
        subject: 'English',
        time: '11:05 AM',
        icon: 'checkmark-circle-outline'
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Digital Notebook</Text>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="search" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, selectedCategory === category && styles.activeCategoryChip]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === category && styles.activeCategoryChipText]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : notes.length > 0 ? (
          notes.map((note, index) => (
            <TouchableOpacity key={note.id || index} style={styles.noteItem}>
              <View style={styles.noteIcon}>
                <Ionicons name="book-outline" size={24} color={colors.aiBubble} />
              </View>
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteSubtitle}>{note.subject}</Text>
              </View>
              <Text style={styles.noteTime}>{new Date(note.created_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))
        ) : (
          Object.entries(defaultNoteSections).map(([sectionTitle, sectionNotes]) => (
            <View key={sectionTitle}>
              <Text style={styles.sectionTitle}>{sectionTitle}</Text>
              {sectionNotes.map((note) => (
                <TouchableOpacity key={note.id} style={styles.noteItem}>
                  <View style={styles.noteIcon}>
                    <Ionicons name={note.icon} size={24} color={colors.aiBubble} />
                  </View>
                  <View style={styles.noteContent}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Text style={styles.noteSubtitle}>{note.type} • {note.subject}</Text>
                  </View>
                  <Text style={styles.noteTime}>{note.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color={colors.black} />
      </TouchableOpacity>
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
    paddingVertical: 16,
    backgroundColor: colors.backgroundDark + 'CC',
    borderBottomWidth: 1,
    borderBottomColor: colors.white + '10',
  },
  headerLeft: {
    width: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 48,
    alignItems: 'flex-end',
  },
  categoryScroll: {
    backgroundColor: colors.backgroundDark + 'CC',
    paddingVertical: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.slate800,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  activeCategoryChipText: {
    color: colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 24,
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.aiBubble + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  noteSubtitle: {
    fontSize: 14,
    color: colors.slate500,
  },
  noteTime: {
    fontSize: 14,
    color: colors.slate500,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

export default DigitalNotebookScreen;
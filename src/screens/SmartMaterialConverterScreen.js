import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const SmartMaterialConverterScreen = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [interests, setInterests] = useState('');
  const [learningStyle, setLearningStyle] = useState('Visual');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [converting, setConverting] = useState(false);
  const [conversions, setConversions] = useState([]);

  const learningStyles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'];
  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadUserPreferences();
    loadConversionHistory();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setInterests(user.interests || 'technology, sports, music');
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadConversionHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        ApiService.setToken(token);
        const history = await ApiService.getMaterialHistory();
        setConversions(history.conversions || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const pickDocument = async () => {
    try {
      // Simulate file picker with sample files
      const sampleFiles = [
        { name: 'Advanced_Calculus_Lecture.pdf', size: 2048, type: 'application/pdf' },
        { name: 'Quantum_Physics_Notes.docx', size: 1536, type: 'application/docx' },
        { name: 'Organic_Chemistry_Slides.pptx', size: 3072, type: 'application/pptx' },
        { name: 'Machine_Learning_Theory.txt', size: 1024, type: 'text/plain' }
      ];
      
      const randomFile = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
      setSelectedFile({
        ...randomFile,
        uri: `mock://file/${randomFile.name}`,
        mimeType: randomFile.type
      });
      
      Alert.alert('File Selected', `Selected: ${randomFile.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const convertMaterial = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!interests.trim()) {
      Alert.alert('Error', 'Please enter your interests');
      return;
    }

    setConverting(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        ApiService.setToken(token);
      }

      const result = await ApiService.convertMaterial({
        file: selectedFile,
        interests: interests.trim(),
        learningStyle,
        difficulty
      });

      Alert.alert('Success!', 'Material converted successfully! 🎉');
      
      navigation.navigate('ConvertedMaterial', {
        conversion: result.conversion,
        content: result.personalizedContent
      });

      setSelectedFile(null);
      loadConversionHistory();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to convert material');
    } finally {
      setConverting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Material Converter</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="school" size={48} color={colors.primary} />
          <Text style={styles.heroTitle}>Transform Confusing Materials</Text>
          <Text style={styles.heroText}>
            Upload complex slides, PDFs, or documents from your lecturers and get personalized, easy-to-understand versions tailored to your interests and learning style using AI.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Upload Your Material</Text>
          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            {selectedFile ? (
              <View style={styles.fileSelected}>
                <Ionicons name="document" size={40} color={colors.primary} />
                <Text style={styles.fileName}>{selectedFile.name}</Text>
                <Text style={styles.fileSize}>{(selectedFile.size / 1024).toFixed(1)} KB</Text>
                <TouchableOpacity 
                  style={styles.removeFile}
                  onPress={() => setSelectedFile(null)}
                >
                  <Ionicons name="close-circle" size={20} color={colors.slate500} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPrompt}>
                <Ionicons name="cloud-upload" size={64} color={colors.primary} />
                <Text style={styles.uploadText}>Tap to Select Document</Text>
                <Text style={styles.uploadSubtext}>PDF, DOC, PPT, TXT • Max 10MB</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Your Interests</Text>
          <Text style={styles.inputLabel}>What topics do you enjoy? This helps create relatable examples.</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., sports, music, technology, gaming, cooking..."
            placeholderTextColor={colors.slate500}
            value={interests}
            onChangeText={setInterests}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Learning Style</Text>
          <View style={styles.optionGrid}>
            {learningStyles.map((style) => (
              <TouchableOpacity
                key={style}
                style={[styles.optionButton, learningStyle === style && styles.selectedOption]}
                onPress={() => setLearningStyle(style)}
              >
                <Text style={[styles.optionText, learningStyle === style && styles.selectedOptionText]}>
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Difficulty Level</Text>
          <View style={styles.optionGrid}>
            {difficultyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.optionButton, difficulty === level && styles.selectedOption]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[styles.optionText, difficulty === level && styles.selectedOptionText]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.convertButton, (!selectedFile || converting) && styles.convertButtonDisabled]}
          onPress={convertMaterial}
          disabled={!selectedFile || converting}
        >
          {converting ? (
            <ActivityIndicator size="small" color={colors.black} />
          ) : (
            <Ionicons name="sparkles" size={20} color={colors.black} />
          )}
          <Text style={styles.convertButtonText}>
            {converting ? 'Converting with AI...' : '✨ Convert Material'}
          </Text>
        </TouchableOpacity>

        {conversions.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>📚 Recent Conversions</Text>
            {conversions.slice(0, 3).map((conversion) => (
              <TouchableOpacity 
                key={conversion.id} 
                style={styles.historyItem}
                onPress={() => navigation.navigate('ConvertedMaterial', { conversionId: conversion.id })}
              >
                <View style={styles.historyIcon}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{conversion.original_filename}</Text>
                  <Text style={styles.historySubtitle}>
                    {conversion.learning_style} • {conversion.difficulty}
                  </Text>
                </View>
                <Text style={styles.historyDate}>
                  {new Date(conversion.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 16,
    marginBottom: 12,
  },
  heroText: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.primary + '50',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.cardDark,
  },
  uploadPrompt: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: colors.slate500,
  },
  fileSelected: {
    alignItems: 'center',
    position: 'relative',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginTop: 12,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 4,
  },
  removeFile: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.slate500,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.slate600,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.slate600,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.white,
  },
  selectedOptionText: {
    color: colors.black,
    fontWeight: '600',
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    marginBottom: 32,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  convertButtonDisabled: {
    opacity: 0.6,
  },
  convertButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  historySection: {
    marginBottom: 32,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 12,
    color: colors.slate500,
  },
  historyDate: {
    fontSize: 12,
    color: colors.slate500,
  },
});

export default SmartMaterialConverterScreen;
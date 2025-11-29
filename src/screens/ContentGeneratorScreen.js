import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const ContentGeneratorScreen = ({ navigation }) => {
  const [contentType, setContentType] = useState('Lesson');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState(45);
  const [learningStyle, setLearningStyle] = useState('Default (Adaptive)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const contentTypes = ['Lesson', 'Summary', 'Practice Questions'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics', 'Government'];
  const learningStyles = ['Default (Adaptive)', 'Visual', 'Auditory', 'Kinesthetic'];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('https://edushelf-re0u.onrender.com/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic: topic.trim(),
          difficulty: getDifficultyLabel().toLowerCase(),
          contentType: contentType.toLowerCase(),
          learningStyle: learningStyle === 'Default (Adaptive)' ? userProfile?.learningStyle?.[0] || 'visual' : learningStyle.toLowerCase(),
          userProfile: {
            interests: userProfile?.interests || [],
            name: userProfile?.name || 'Student'
          }
        })
      });
      
      const data = await response.json();
      
      if (data.content) {
        navigation.navigate('LessonView', {
          topic,
          subject,
          contentType,
          difficulty: getDifficultyLabel(),
          content: data.content
        });
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyLabel = () => {
    if (difficulty < 33) return 'Easy';
    if (difficulty < 66) return 'Medium';
    return 'Hard';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Generator</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>What do you need?</Text>
        
        <View style={styles.toggleContainer}>
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.toggleButton,
                contentType === type && styles.activeToggle
              ]}
              onPress={() => setContentType(type)}
            >
              <Text style={[
                styles.toggleText,
                contentType === type && styles.activeToggleText
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>{subject}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.slate500} />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Enter a topic</Text>
          <TextInput
            style={styles.input}
            placeholder={`e.g., ${subject === 'Physics' ? "Newton's Laws of Motion" : subject === 'Chemistry' ? 'Organic Compounds' : 'Quadratic Equations'}`}
            placeholderTextColor={colors.slate500}
            value={topic}
            onChangeText={setTopic}
          />
          {userProfile?.interests?.length > 0 && (
            <Text style={styles.hintText}>
              💡 Content will be personalized using your interests: {userProfile.interests.slice(0, 2).join(', ')}
            </Text>
          )}
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>Difficulty Level</Text>
            <Text style={styles.difficultyLabel}>{getDifficultyLabel()}</Text>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${difficulty}%` }]} />
              <View style={[styles.sliderThumb, { left: `${difficulty - 2}%` }]}>
                <View style={styles.sliderThumbInner} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Learning Style</Text>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>{learningStyle}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.slate500} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.generateButton, (!topic || isGenerating) && styles.disabledButton]} 
          onPress={handleGenerate}
          disabled={!topic || isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Content'}
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
  backButton: {
    padding: 8,
    marginLeft: -8,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
    marginTop: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.slate700,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: colors.aiBubble,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate500,
  },
  activeToggleText: {
    color: colors.white,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: colors.slate700,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.slate600,
  },
  sliderSection: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyLabel: {
    fontSize: 14,
    color: colors.slate500,
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.slate700,
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.aiBubble,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.backgroundDark,
    borderWidth: 2,
    borderColor: colors.aiBubble,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.aiBubble,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: colors.slate700,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.slate600,
  },
  selectText: {
    fontSize: 16,
    color: colors.white,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  generateButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.slate600,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  hintText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ContentGeneratorScreen;
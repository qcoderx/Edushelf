import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const LessonViewScreen = ({ navigation, route }) => {
  const { 
    topic = 'Sample Topic', 
    contentType = 'Lesson', 
    content = '',
    subject = 'General',
    difficulty = 'Medium',
    personalizedFor = null
  } = route?.params || {};

  // Use AI-generated content if available, otherwise show default
  const lessonContent = content || `# ${topic}\n\nContent is being generated...`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contentType}</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.lessonHeader}>
          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.title}>{topic}</Text>
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.metadataText}>AI Generated</Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="trending-up" size={16} color={colors.slate500} />
              <Text style={styles.metadataText}>{difficulty}</Text>
            </View>
            {personalizedFor && (
              <View style={styles.metadataItem}>
                <Ionicons name="heart" size={16} color={colors.primary} />
                <Text style={styles.metadataText}>Personalized</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentText}>{lessonContent}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Take Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Practice Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.completeButtonText}>Mark as Complete</Text>
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
  },
  content: {
    flex: 1,
  },
  lessonHeader: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  subject: {
    fontSize: 14,
    color: colors.aiBubble,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
    lineHeight: 34,
  },
  metadata: {
    flexDirection: 'row',
    gap: 24,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    color: colors.slate500,
  },
  contentCard: {
    backgroundColor: colors.cardDark,
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 100,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.backgroundDark,
  },
  completeButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default LessonViewScreen;
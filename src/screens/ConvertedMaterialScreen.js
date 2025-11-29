import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import ApiService from '../services/api';

const ConvertedMaterialScreen = ({ navigation, route }) => {
  const { conversion, content, conversionId } = route.params || {};
  const [materialContent, setMaterialContent] = useState(content || '');
  const [materialInfo, setMaterialInfo] = useState(conversion || null);
  const [loading, setLoading] = useState(!content);

  useEffect(() => {
    if (conversionId && !content) {
      loadConversion();
    }
  }, [conversionId]);

  const loadConversion = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        ApiService.setToken(token);
        const result = await ApiService.getMaterialConversion(conversionId);
        setMaterialInfo(result.conversion);
        setMaterialContent(result.conversion.personalized_content);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load conversion');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const downloadMaterial = async () => {
    try {
      Alert.alert(
        'Download Ready! 📥',
        'Your personalized material is ready to download. In the full app, this would save to your device.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: () => Alert.alert('Success!', 'Material downloaded successfully! 🎉') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download material');
    }
  };

  const shareMaterial = async () => {
    try {
      await Share.share({
        message: `Check out my personalized study material:\n\n${materialContent.substring(0, 200)}...`,
        title: `Personalized: ${materialInfo?.original_filename || 'Study Material'}`
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="sparkles" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Loading your personalized material...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personalized Material</Text>
        <TouchableOpacity onPress={shareMaterial}>
          <Ionicons name="share" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {materialInfo && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.originalTitle}>{materialInfo.original_filename}</Text>
                <Text style={styles.conversionDate}>
                  Converted on {new Date(materialInfo.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <Ionicons name="eye" size={12} color={colors.primary} />
                <Text style={styles.tagText}>{materialInfo.learning_style}</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons name="trending-up" size={12} color={colors.primary} />
                <Text style={styles.tagText}>{materialInfo.difficulty}</Text>
              </View>
              {materialInfo.interests && (
                <View style={styles.tag}>
                  <Ionicons name="heart" size={12} color={colors.primary} />
                  <Text style={styles.tagText}>Personalized</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <View style={styles.contentTitleContainer}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <Text style={styles.contentTitle}>AI-Personalized Content</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={downloadMaterial}>
              <Ionicons name="download" size={16} color={colors.black} />
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentBody}>
            <Text style={styles.materialText}>{materialContent}</Text>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>🚀 What's Next?</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('SmartMaterialConverter')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionButtonText}>Convert Another Material</Text>
              <Text style={styles.actionSubtext}>Upload more confusing content</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.slate500} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AITutorChat', { 
              initialMessage: `I just converted this material: ${materialInfo?.original_filename}. Can you help me understand it better?` 
            })}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="chatbubbles" size={20} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionButtonText}>Discuss with AI Tutor</Text>
              <Text style={styles.actionSubtext}>Get deeper explanations</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.slate500} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ContentGenerator')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="create" size={20} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionButtonText}>Generate Practice Questions</Text>
              <Text style={styles.actionSubtext}>Test your understanding</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.slate500} />
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.slate500,
  },
  infoCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  successBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoDetails: {
    flex: 1,
  },
  originalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  conversionDate: {
    fontSize: 12,
    color: colors.slate500,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  contentCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate700,
  },
  contentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  contentBody: {
    padding: 20,
  },
  materialText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
  },
  actionsCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 12,
    color: colors.slate500,
  },
});

export default ConvertedMaterialScreen;
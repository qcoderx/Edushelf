import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Animated, Dimensions, StatusBar, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const ActiveExperimentScreen = ({ navigation, route }) => {
  const { experiment } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notes, setNotes] = useState('');

  
  const notebookAnimation = useRef(new Animated.Value(0)).current;
  const timerInterval = useRef(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    // Start timer
    timerInterval.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleNotebook = () => {
    const toValue = isNotebookOpen ? 0 : 1;
    setIsNotebookOpen(!isNotebookOpen);
    
    Animated.spring(notebookAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };





  const notebookHeight = notebookAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.4],
  });

  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <Animated.View style={[styles.loadingIcon, {
          transform: [{
            rotate: notebookAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            })
          }]
        }]}>
          <Ionicons name="flask" size={48} color={colors.primary} />
        </Animated.View>
        <Text style={styles.loadingText}>Preparing Lab Equipment...</Text>
        <Text style={styles.loadingSubtext}>Setting up {experiment.title}</Text>
        <View style={styles.loadingBar}>
          <Animated.View 
            style={[
              styles.loadingProgress,
              {
                width: notebookAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Top HUD */}
      <View style={styles.topHUD}>
        <TouchableOpacity 
          style={styles.hudButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.hudCenter}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Experiment in Progress</Text>
          </View>
          <Text style={styles.experimentTitle}>{experiment.title}</Text>
        </View>
        
        <View style={styles.hudRight}>
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={16} color={colors.primary} />
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.safetyButton}
            onPress={() => Alert.alert('Safety Check', 'All safety protocols are active. Lab environment is secure.')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Experiment Container */}
      <View style={styles.experimentContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={experiment.url}
            style={{
              flex: 1,
              width: '100%',
              border: 'none',
              backgroundColor: colors.backgroundDark
            }}
            title={experiment.title}
          />
        ) : (
          <View style={styles.experimentPreview}>
            <Ionicons name="flask" size={64} color={colors.primary} />
            <Text style={styles.experimentName}>{experiment.title}</Text>
            <Text style={styles.experimentDescription}>{experiment.description}</Text>
            <TouchableOpacity 
              style={styles.launchButton}
              onPress={() => {
                Alert.alert(
                  'Open Experiment',
                  `This will open ${experiment.title} in your browser.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Open', 
                      onPress: () => Linking.openURL(experiment.url)
                    }
                  ]
                );
              }}
            >
              <Ionicons name="open" size={20} color={colors.black} />
              <Text style={styles.launchButtonText}>Open Experiment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom HUD */}
      <View style={styles.bottomHUD}>
        <TouchableOpacity 
          style={[styles.notebookToggle, isNotebookOpen && styles.notebookToggleActive]}
          onPress={toggleNotebook}
        >
          <Ionicons 
            name={isNotebookOpen ? "book" : "book-outline"} 
            size={20} 
            color={isNotebookOpen ? colors.black : colors.white} 
          />
          <Text style={[styles.notebookToggleText, isNotebookOpen && styles.notebookToggleTextActive]}>
            Lab Notebook
          </Text>
        </TouchableOpacity>
        
        <View style={styles.hudActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Screenshot', 'Screenshot feature coming soon!')}
          >
            <Ionicons name="camera" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Refresh', 'Experiment refreshed!')}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Help', 'Need help? Contact your teacher or check the experiment instructions.')}
          >
            <Ionicons name="help-circle" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lab Notebook Bottom Sheet */}
      <Animated.View style={[styles.notebook, { height: notebookHeight }]}>
        <View style={styles.notebookHeader}>
          <View style={styles.notebookHandle} />
          <Text style={styles.notebookTitle}>Lab Notebook</Text>
          <Text style={styles.notebookSubtitle}>Record your observations</Text>
        </View>
        
        <View style={styles.notebookContent}>
          <TextInput
            style={styles.notesInput}
            placeholder="Write your observations here..."
            placeholderTextColor={colors.slate500}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.notebookFooter}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {
              if (notes.trim()) {
                Alert.alert('Notes Saved', 'Your lab notes have been saved successfully!');
              } else {
                Alert.alert('No Notes', 'Please write some notes before saving.');
              }
            }}
          >
            <Ionicons name="save" size={16} color={colors.black} />
            <Text style={styles.saveButtonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  topHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 25, 34, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate800,
  },
  hudButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.slate800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  experimentTitle: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.slate800,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  safetyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slate800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  experimentContainer: {
    flex: 1,
    justifyContent: Platform.OS === 'web' ? 'stretch' : 'center',
    alignItems: Platform.OS === 'web' ? 'stretch' : 'center',
    padding: Platform.OS === 'web' ? 0 : 32,
  },
  experimentPreview: {
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    padding: 32,
    borderRadius: 16,
    maxWidth: 400,
  },
  experimentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  experimentDescription: {
    fontSize: 16,
    color: colors.slate400,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  launchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 32,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.slate400,
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: colors.slate700,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  bottomHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 25, 34, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.slate800,
  },
  notebookToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.slate800,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  notebookToggleActive: {
    backgroundColor: colors.primary,
  },
  notebookToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  notebookToggleTextActive: {
    color: colors.black,
  },
  hudActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.slate800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notebook: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: colors.slate700,
  },
  notebookHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate700,
  },
  notebookHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.slate600,
    borderRadius: 2,
    marginBottom: 12,
  },
  notebookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  notebookSubtitle: {
    fontSize: 12,
    color: colors.slate400,
  },
  notebookContent: {
    flex: 1,
    padding: 16,
  },
  notesInput: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
    textAlignVertical: 'top',
  },
  notebookFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.slate700,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default ActiveExperimentScreen;
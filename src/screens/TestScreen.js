import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { testAllEndpoints, getTestSummary } from '../utils/apiTest';

const TestScreen = ({ navigation }) => {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    try {
      const results = await testAllEndpoints();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const renderTestResult = (category, tests) => (
    <View key={category} style={styles.categoryCard}>
      <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
      {Object.entries(tests).map(([test, passed]) => (
        <View key={test} style={styles.testRow}>
          <Text style={styles.testName}>{test}</Text>
          <Ionicons 
            name={passed ? 'checkmark-circle' : 'close-circle'} 
            size={20} 
            color={passed ? '#0bda5b' : '#ff4444'} 
          />
        </View>
      ))}
    </View>
  );

  const summary = testResults ? getTestSummary(testResults) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Integration Test</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Backend Integration Status</Text>
          {summary ? (
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{summary.passed}/{summary.total}</Text>
                <Text style={styles.statLabel}>Tests Passed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{summary.percentage}%</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noTestsText}>No tests run yet</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.testButton, testing && styles.testButtonDisabled]} 
          onPress={runTests}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>
            {testing ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        {testResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            {Object.entries(testResults).map(([category, tests]) => 
              renderTestResult(category, tests)
            )}
          </View>
        )}

        <View style={styles.endpointsCard}>
          <Text style={styles.endpointsTitle}>Available Endpoints</Text>
          <Text style={styles.endpointItem}>✓ POST /api/auth/register</Text>
          <Text style={styles.endpointItem}>✓ POST /api/auth/login</Text>
          <Text style={styles.endpointItem}>✓ GET /api/users/profile</Text>
          <Text style={styles.endpointItem}>✓ POST /api/content/generate</Text>
          <Text style={styles.endpointItem}>✓ GET /api/progress</Text>
          <Text style={styles.endpointItem}>✓ POST /api/progress</Text>
          <Text style={styles.endpointItem}>✓ GET /api/leaderboard</Text>
          <Text style={styles.endpointItem}>✓ GET /api/notebook/notes</Text>
          <Text style={styles.endpointItem}>✓ POST /api/notebook/notes</Text>
          <Text style={styles.endpointItem}>✓ GET /api/schedule</Text>
          <Text style={styles.endpointItem}>✓ POST /api/schedule</Text>
          <Text style={styles.endpointItem}>✓ POST /api/ai/chat</Text>
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
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.slate500,
  },
  noTestsText: {
    fontSize: 16,
    color: colors.slate500,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  testRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  testName: {
    fontSize: 14,
    color: colors.white,
  },
  endpointsCard: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  endpointsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  endpointItem: {
    fontSize: 14,
    color: colors.slate500,
    marginBottom: 8,
  },
});

export default TestScreen;
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

export const testAllEndpoints = async () => {
  const results = {
    auth: { register: false, login: false },
    user: { profile: false },
    content: { generate: false },
    progress: { get: false, update: false },
    leaderboard: { get: false },
    ai: { chat: false }
  };

  try {
    // Test Registration
    try {
      await ApiService.register({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      });
      results.auth.register = true;
    } catch (error) {
      console.log('Register test failed:', error.message);
    }

    // Test Login
    try {
      const loginResponse = await ApiService.login({
        email: 'test@example.com',
        password: 'password123'
      });
      if (loginResponse.token) {
        await AsyncStorage.setItem('userToken', loginResponse.token);
        ApiService.setToken(loginResponse.token);
        results.auth.login = true;
      }
    } catch (error) {
      console.log('Login test failed:', error.message);
    }

    // Test User Profile
    try {
      await ApiService.getUserProfile();
      results.user.profile = true;
    } catch (error) {
      console.log('Profile test failed:', error.message);
    }

    // Test Content Generation
    try {
      await ApiService.generateContent({
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'intermediate'
      });
      results.content.generate = true;
    } catch (error) {
      console.log('Content generation test failed:', error.message);
    }

    // Test Progress Get
    try {
      await ApiService.getProgress();
      results.progress.get = true;
    } catch (error) {
      console.log('Progress get test failed:', error.message);
    }

    // Test Progress Update
    try {
      await ApiService.updateProgress({
        subject: 'Mathematics',
        topic: 'Test Topic',
        progress_percentage: 50,
        time_spent: 30
      });
      results.progress.update = true;
    } catch (error) {
      console.log('Progress update test failed:', error.message);
    }

    // Test Leaderboard
    try {
      await ApiService.getLeaderboard();
      results.leaderboard.get = true;
    } catch (error) {
      console.log('Leaderboard test failed:', error.message);
    }



    // Test AI Chat
    try {
      await ApiService.chatWithAI({
        message: 'Hello, can you help me with math?',
        subject: 'Mathematics'
      });
      results.ai.chat = true;
    } catch (error) {
      console.log('AI chat test failed:', error.message);
    }

  } catch (error) {
    console.error('API test suite failed:', error);
  }

  return results;
};

export const getTestSummary = (results) => {
  const totalTests = Object.values(results).reduce((acc, category) => 
    acc + Object.keys(category).length, 0
  );
  
  const passedTests = Object.values(results).reduce((acc, category) => 
    acc + Object.values(category).filter(Boolean).length, 0
  );

  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    percentage: Math.round((passedTests / totalTests) * 100)
  };
};
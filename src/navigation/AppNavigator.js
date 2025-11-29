import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Screens
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingWizardScreen from '../screens/OnboardingWizardScreen';
import LearningStyleScreen from '../screens/LearningStyleScreen';
import InterestsScreen from '../screens/InterestsScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AITutorChatScreen from '../screens/AITutorChatScreen';
import ContentGeneratorScreen from '../screens/ContentGeneratorScreen';
import ExerciseInterfaceScreen from '../screens/ExerciseInterfaceScreen';
import PracticeTestSetupScreen from '../screens/PracticeTestSetupScreen';
import LessonViewScreen from '../screens/LessonViewScreen';
import ExerciseResultsScreen from '../screens/ExerciseResultsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SmartScheduleScreen from '../screens/SmartScheduleScreen';
import ProgressAnalyticsScreen from '../screens/ProgressAnalyticsScreen';
import DigitalNotebookScreen from '../screens/DigitalNotebookScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import VirtualLabHubScreen from '../screens/VirtualLabHubScreen';
import ActiveExperimentScreen from '../screens/ActiveExperimentScreen';
import TestScreen from '../screens/TestScreen';
import SmartMaterialConverterScreen from '../screens/SmartMaterialConverterScreen';
import ConvertedMaterialScreen from '../screens/ConvertedMaterialScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OnboardingWizard" component={OnboardingWizardScreen} />
    <Stack.Screen name="SubjectSelection" component={require('../screens/SubjectSelectionScreen').default} />
    <Stack.Screen name="LearningStyle" component={LearningStyleScreen} />
    <Stack.Screen name="LearningChallenges" component={require('../screens/LearningChallengesScreen').default} />
    <Stack.Screen name="MotivationFactors" component={require('../screens/MotivationFactorsScreen').default} />
    <Stack.Screen name="Interests" component={InterestsScreen} />
    <Stack.Screen name="Preferences" component={PreferencesScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = 'grid';
            break;
          case 'Practice':
            iconName = 'fitness';
            break;
          case 'Subjects':
            iconName = 'book';
            break;
          case 'Profile':
            iconName = 'person';
            break;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.aiBubble,
      tabBarInactiveTintColor: colors.slate500,
      tabBarStyle: {
        backgroundColor: colors.backgroundDark,
        borderTopColor: colors.slate700,
        height: 80,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Practice" component={ExerciseInterfaceScreen} />
    <Tab.Screen name="Subjects" component={DashboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AITutorChat" component={AITutorChatScreen} />
      <Stack.Screen name="ContentGenerator" component={ContentGeneratorScreen} />
      <Stack.Screen name="PracticeTestSetup" component={PracticeTestSetupScreen} />
      <Stack.Screen name="ExerciseInterface" component={ExerciseInterfaceScreen} />
      <Stack.Screen name="LessonView" component={LessonViewScreen} />
      <Stack.Screen name="ExerciseResults" component={ExerciseResultsScreen} />
      <Stack.Screen name="SmartSchedule" component={SmartScheduleScreen} />
      <Stack.Screen name="ProgressAnalytics" component={ProgressAnalyticsScreen} />
      <Stack.Screen name="DigitalNotebook" component={DigitalNotebookScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="VirtualLabHub" component={VirtualLabHubScreen} />
      <Stack.Screen name="ActiveExperiment" component={ActiveExperimentScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="SmartMaterialConverter" component={SmartMaterialConverterScreen} />
      <Stack.Screen name="ConvertedMaterial" component={ConvertedMaterialScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
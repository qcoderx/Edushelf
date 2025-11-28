# Lumina - AI-Powered Adaptive Learning Platform

Lumina is an advanced, AI-powered adaptive learning platform designed to revolutionize educational preparation, specifically targeting exams like WAEC and JAMB.

## Features

### 🎯 Personalized Onboarding
- Comprehensive user profiling during onboarding
- Exam focus selection (WAEC, JAMB, Post-UTME, A-Levels)
- Learning style identification (Visual, Auditory, Kinesthetic, Reading/Writing)
- Personal interests integration for relatable analogies
- Study preferences and environment setup

### 🤖 AI-Powered Tutors
- Context-aware chatbots for WAEC & JAMB
- Intelligent query parsing for natural language questions
- Live database integration for past questions
- Personalized explanations using student interests
- Rich formatting with Markdown and LaTeX support

### 📚 Adaptive Content Generator
- Custom lesson generation based on learning style
- Interactive exercises with immediate feedback
- Difficulty level adaptation
- Multiple content types (Lessons, Summaries, Practice Questions)

### 📊 Smart Analytics & Progress Tracking
- Adaptive learning path creation
- Gamification with streaks, points, and leaderboards
- Visual progress analytics
- Weekly performance charts
- Skill level radar visualization

### 🗓️ Smart Scheduling
- Personalized study schedule generation
- Session length optimization
- Study time preferences
- Progress-based adjustments

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **Icons**: Expo Vector Icons
- **Styling**: StyleSheet with custom color system
- **State Management**: React Hooks

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app on your phone)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lumina
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## App Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatBubble.js   # Chat message component
│   └── QuestionCard.js # Question display component
├── constants/          # App constants
│   └── colors.js       # Color palette
├── navigation/         # Navigation configuration
│   └── AppNavigator.js # Main navigation setup
└── screens/           # App screens
    ├── SplashScreen.js
    ├── AuthScreen.js
    ├── OnboardingWizardScreen.js
    ├── LearningStyleScreen.js
    ├── InterestsScreen.js
    ├── PreferencesScreen.js
    ├── DashboardScreen.js
    ├── AITutorChatScreen.js
    ├── ContentGeneratorScreen.js
    ├── ExerciseInterfaceScreen.js
    ├── LessonViewScreen.js
    └── ExerciseResultsScreen.js
```

## Key Screens

1. **Splash Screen** - App introduction with animated logo
2. **Authentication** - Login/Register with social auth options
3. **Onboarding Flow** - 4-step personalization process
4. **Dashboard** - Main hub with progress tracking and quick access
5. **AI Tutor Chat** - Interactive chat with subject-specific AI tutors
6. **Content Generator** - Custom learning content creation
7. **Exercise Interface** - Practice questions with real-time feedback
8. **Lesson View** - Rich content display with note-taking
9. **Exercise Results** - Detailed feedback and explanations

## Color Scheme

- **Primary**: `#2DE2E6` (Cyan)
- **AI Bubble**: `#7F2AF0` (Purple)
- **User Bubble**: `#2DE2E6` (Cyan)
- **Background Dark**: `#101922` (Dark Blue)
- **Card Dark**: `#1c2127` (Dark Gray)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Expo team for the excellent development platform
- React Navigation for seamless navigation
- All contributors and testers
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import ChatBubble from '../components/ChatBubble';
import QuestionCard from '../components/QuestionCard';
import ApiService from '../services/api';

const AITutorChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Physics tutor. Ask me about Newton's laws or request a past WAEC question.",
      isAI: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAjf5KJkiExSf2lm96HlRnJh-mNkH1BVQsHgapZMQqkHA8GLdLd-BzfQYOYd3xD57QOg5fwY3euT9hjof9Qtz3MnyW4Quxc0tJH4RxzGnGKN4EPjtAOKFGaHmjzJUZH_4kVWsLnL_PGzvWaWKkrO7oVw2HQFiF1S-8HZa7Z4Hjn6tmP4ciC5Cwsu7M4iHQ0ApWmc7i2d7Qgw2tyxQAHEtLhmmtAvfJRpvpZGiHLfg1Aq_WEd20tSPCkgsS_seEqj_oewQ18Mfrsjo'
    },
    {
      id: 2,
      text: "Can you give me a JAMB question on electricity?",
      isAI: false,
    },
    {
      id: 3,
      text: "",
      isAI: true,
      isTyping: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwLlrUyq-erQ6Z9NllcEZBG_PHZiYkZcVMPBFO-gBNkQ4LodY3mB89Qz5JzRav1yKgPdzv9Oc4vu0wT_0F1rhDlvvw9iqXI1SGFRljp6XeaFEZxpBm-k818wJUkU0BeD6DjfXXZ9darV1_l_2jodhNq5SgmfPeLT1BNxlp5nnvofNssgcVuVaMezLU-YMGCJDLeuR3F9KWCo4x7yIdWkVLUKb7ciHxpXTmpOeFAPyR2b_FseA0Kqbch0bXCM-rZlaU7I710dYr6EA'
    },
    {
      id: 4,
      text: "Of course! Here is a past question on electricity:",
      isAI: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASbml5f-ywMy-G6PJz8J0PI9fPwiV53LjKoqg9Win20cbHby7OM_-T800Wh07OoW6O2S8qAA8AgOItgQimEHbMvtnRuSpNKW8tjEci6a4zUtAiXqi5o0YND6x55xIB9DHCfKQgWRNAvZ4snFHulbqFqy0Cfq-Pf7VhlhPk4ka13J6zb9wNhlK6X7lK-GhHwcvlrTn156iyoLIQVDztfMiGXr4LFErLoNigczYU3wTwnUmv1o8Hl_w9mNH3lMW3-zyRyO0e6IQN7mg',
      hasQuestion: true,
      question: {
        text: "Which of the following is a fundamental unit of electricity?",
        options: "A) Volt\nB) Ampere\nC) Ohm\nD) Watt"
      }
    },
    {
      id: 5,
      text: "Explain Newton's second law with a car analogy.",
      isAI: false,
    },
    {
      id: 6,
      text: "Great question! Imagine you're pushing a car. Pushing a small car (less mass) is easier to get moving (accelerate) than a big truck (more mass). That's Newton's second law in action. The force you apply is related to the car's mass and its acceleration. The formula is:\n\nF = ma",
      isAI: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC30Ca4AbEFi0MJh7FJNM1EBDxHzmfhwL-8dpMI4m29nwTkH0zVFpWxpsaszT2kiHVFaRBwgXgNAMQxaDMtw_Yuk1uVgAxcRFyx5LpVBLlvJZseHPw6HHAPZyWLKjBN0m5_CwoiNp1nfcTSohH-qBKww5tC9f6xlXDM8szLT1qQeGIpdSoK27VJDe6yk0bBimgWb1BW4vMnIz5bSYwxM6QJIXqF_uTUW1tOC3-2e9xK7lA8ZYVldEbIMWQVRK-0hatZmeh8xTdAbqg'
    }
  ]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isAI: false,
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    
    // Add typing indicator
    const typingMessage = {
      id: messages.length + 2,
      text: '',
      isAI: true,
      isTyping: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwLlrUyq-erQ6Z9NllcEZBG_PHZiYkZcVMPBFO-gBNkQ4LodY3mB89Qz5JzRav1yKgPdzv9Oc4vu0wT_0F1rhDlvvw9iqXI1SGFRljp6XeaFEZxpBm-k818wJUkU0BeD6DjfXXZ9darV1_l_2jodhNq5SgmfPeLT1BNxlp5nnvofNssgcVuVaMezLU-YMGCJDLeuR3F9KWCo4x7yIdWkVLUKb7ciHxpXTmpOeFAPyR2b_FseA0Kqbch0bXCM-rZlaU7I710dYr6EA'
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    try {
      const response = await ApiService.chatWithAI({
        message: messageText,
        subject: 'Physics',
        context: 'WAEC preparation'
      });
      
      // Remove typing indicator and add AI response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, {
          id: Date.now(),
          text: response.response || 'I apologize, but I encountered an issue. Please try again.',
          isAI: true,
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC30Ca4AbEFi0MJh7FJNM1EBDxHzmfhwL-8dpMI4m29nwTkH0zVFpWxpsaszT2kiHVFaRBwgXgNAMQxaDMtw_Yuk1uVgAxcRFyx5LpVBLlvJZseHPw6HHAPZyWLKjBN0m5_CwoiNp1nfcTSohH-qBKww5tC9f6xlXDM8szLT1qQeGIpdSoK27VJDe6yk0bBimgWb1BW4vMnIz5bSYwxM6QJIXqF_uTUW1tOC3-2e9xK7lA8ZYVldEbIMWQVRK-0hatZmeh8xTdAbqg'
        }];
      });
    } catch (error) {
      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, {
          id: Date.now(),
          text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
          isAI: true,
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC30Ca4AbEFi0MJh7FJNM1EBDxHzmfhwL-8dpMI4m29nwTkH0zVFpWxpsaszT2kiHVFaRBwgXgNAMQxaDMtw_Yuk1uVgAxcRFyx5LpVBLlvJZseHPw6HHAPZyWLKjBN0m5_CwoiNp1nfcTSohH-qBKww5tC9f6xlXDM8szLT1qQeGIpdSoK27VJDe6yk0bBimgWb1BW4vMnIz5bSYwxM6QJIXqF_uTUW1tOC3-2e9xK7lA8ZYVldEbIMWQVRK-0hatZmeh8xTdAbqg'
        }];
      });
    }
  };

  const handleShowExplanation = () => {
    console.log('Show explanation pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Physics Tutor</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View key={message.id}>
              <ChatBubble
                message={message.text}
                isAI={message.isAI}
                isTyping={message.isTyping}
                avatar={message.avatar}
              />
              {message.hasQuestion && (
                <View style={styles.questionContainer}>
                  <QuestionCard
                    question={message.question.text}
                    options={message.question.options}
                    onShowExplanation={handleShowExplanation}
                  />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask me anything about Physics..."
              placeholderTextColor={colors.slate500}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  questionContainer: {
    paddingHorizontal: 68,
    marginTop: -8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.inputDark,
    borderRadius: 24,
    paddingLeft: 20,
    paddingRight: 4,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.userBubble,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
});

export default AITutorChatScreen;
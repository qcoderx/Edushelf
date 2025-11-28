import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../constants/colors';

const ChatBubble = ({ message, isAI, isTyping = false, avatar }) => {
  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={[styles.dot, styles.dot1]} />
      <View style={[styles.dot, styles.dot2]} />
      <View style={[styles.dot, styles.dot3]} />
    </View>
  );

  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {isAI && (
        <Image 
          source={{ uri: avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAjf5KJkiExSf2lm96HlRnJh-mNkH1BVQsHgapZMQqkHA8GLdLd-BzfQYOYd3xD57QOg5fwY3euT9hjof9Qtz3MnyW4Quxc0tJH4RxzGnGKN4EPjtAOKFGaHmjzJUZH_4kVWsLnL_PGzvWaWKkrO7oVw2HQFiF1S-8HZa7Z4Hjn6tmP4ciC5Cwsu7M4iHQ0ApWmc7i2d7Qgw2tyxQAHEtLhmmtAvfJRpvpZGiHLfg1Aq_WEd20tSPCkgsS_seEqj_oewQ18Mfrsjo' }}
          style={styles.avatar}
        />
      )}
      
      <View style={styles.messageContainer}>
        {isAI && (
          <Text style={styles.senderLabel}>Physics Tutor</Text>
        )}
        {!isAI && (
          <Text style={styles.userLabel}>You</Text>
        )}
        
        <View style={[
          styles.bubble,
          isAI ? styles.aiBubble : styles.userBubble,
          isAI ? styles.aiBubbleRadius : styles.userBubbleRadius
        ]}>
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <Text style={[styles.messageText, isAI ? styles.aiText : styles.userText]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  aiContainer: {
    alignItems: 'flex-end',
  },
  userContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
    maxWidth: '80%',
  },
  senderLabel: {
    fontSize: 13,
    color: colors.slate500,
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 13,
    color: colors.slate500,
    marginBottom: 4,
    textAlign: 'right',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  aiBubble: {
    backgroundColor: colors.aiBubble,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: colors.white,
  },
  userText: {
    color: colors.black,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default ChatBubble;
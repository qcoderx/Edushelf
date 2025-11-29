const fetch = require('node-fetch');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2NDM2ODA1OCwiZXhwIjoxNzY0OTcyODU4fQ.gbWKAJtGULb8luZ5RIwIp0MzpinDO5Wj-eqyd2y1rUk';

async function testAIChat() {
  console.log('Testing AI Chat...');
  try {
    const response = await fetch('http://localhost:3000/api/ai/tutor/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: 'Explain photosynthesis',
        subject: 'Biology'
      })
    });

    const data = await response.json();
    console.log('AI Chat Response:', data);
  } catch (error) {
    console.error('AI Chat Error:', error);
  }
}

async function testQuizGeneration() {
  console.log('\nTesting Quiz Generation...');
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'Mathematics',
        topic: 'Algebra',
        questionCount: 3,
        difficulty: 2
      })
    });

    const data = await response.json();
    console.log('Quiz Generation Response:', data);
  } catch (error) {
    console.error('Quiz Generation Error:', error);
  }
}

async function testContentGeneration() {
  console.log('\nTesting Content Generation...');
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'lesson',
        subject: 'Physics',
        topic: 'Newton\'s Laws',
        difficulty: 3,
        learningStyle: 'Visual'
      })
    });

    const data = await response.json();
    console.log('Content Generation Response:', data);
  } catch (error) {
    console.error('Content Generation Error:', error);
  }
}

async function runTests() {
  await testAIChat();
  await testQuizGeneration();
  await testContentGeneration();
}

runTests();
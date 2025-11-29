CREATE TABLE IF NOT EXISTS material_conversions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  personalized_content TEXT NOT NULL,
  interests TEXT,
  learning_style VARCHAR(50),
  difficulty VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
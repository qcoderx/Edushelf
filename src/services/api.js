class ApiService {
  constructor() {
    // Use production server from swagger.json
    this.baseURL = 'https://edushelf-re0u.onrender.com/api';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints - matching swagger.json paths
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints - matching swagger.json paths
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Content generation endpoints - matching swagger documentation
  async generateContent(data) {
    return this.request('/content/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Progress endpoints - matching swagger documentation
  async getProgress() {
    return this.request('/progress');
  }

  async updateProgress(data) {
    return this.request('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Leaderboard endpoints - matching swagger documentation
  async getLeaderboard() {
    return this.request('/leaderboard');
  }

  // AI Chat endpoints - matching swagger documentation
  async chatWithAI(data) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();
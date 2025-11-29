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

  // JAMB Tutor endpoint
  async chatWithJAMBTutor(data) {
    return this.request('/ai/jamb-tutor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // WAEC Tutor endpoint
  async chatWithWAECTutor(data) {
    return this.request('/ai/waec-tutor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Materials endpoints
  async convertMaterial(materialData) {
    const formData = new FormData();
    
    // Create a mock file for demo
    const blob = new Blob([`Mock content for ${materialData.file.name}`], { type: 'text/plain' });
    formData.append('material', blob, materialData.file.name);
    formData.append('interests', materialData.interests);
    formData.append('learningStyle', materialData.learningStyle);
    formData.append('difficulty', materialData.difficulty);

    const config = {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    };

    // Remove Content-Type to let browser set it with boundary for FormData
    const url = `${this.baseURL}/materials/convert`;
    
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Material conversion failed:', error);
      throw error;
    }
  }

  async getMaterialHistory() {
    return this.request('/materials/history');
  }

  async getMaterialConversion(conversionId) {
    return this.request(`/materials/conversion/${conversionId}`);
  }

  // Materials endpoints
  async convertMaterial(materialData) {
    const formData = new FormData();
    formData.append('material', {
      uri: materialData.file.uri,
      type: materialData.file.mimeType || 'application/octet-stream',
      name: materialData.file.name
    });
    formData.append('interests', materialData.interests);
    formData.append('learningStyle', materialData.learningStyle);
    formData.append('difficulty', materialData.difficulty);

    return this.request('/materials/convert', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    });
  }

  async getMaterialHistory() {
    return this.request('/materials/history');
  }

  async getMaterialConversion(conversionId) {
    return this.request(`/materials/conversion/${conversionId}`);
  }
}

export default new ApiService();
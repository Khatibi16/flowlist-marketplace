import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (email, password, role, name) => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        role, 
        name 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const chatService = {
  getChatSessions: async (userId) => {
    try {
      const response = await api.get(`/chat/sessions/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMessages: async (sessionId) => {
    try {
      const response = await api.get(`/chat/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (sessionId, sender, message) => {
    try {
      const response = await api.post(`/chat/${sessionId}/messages`, {
        sender,
        message
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createChatSession: async (buyerId, sellerId, productId) => {
    try {
      const response = await api.post('/chat/sessions', {
        buyerId,
        sellerId,
        productId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAIRecommendations: async (message, productId) => {
    try {
      const response = await api.post('/chat/ai/recommendations', {
        message,
        productId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const uploadService = {
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadMultipleImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  analyzeImage: async (imagePath) => {
    try {
      const response = await api.post('/upload/analyze', { imagePath });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// auth.js - Comprehensive authentication handling for client-side

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'sharvariWardrobeAuth';

// Authentication state manager
class AuthManager {
  constructor() {
    this.init();
    this.bindEvents();
  }

  // Initialize auth state
  init() {
    this.state = {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      wishlist: JSON.parse(localStorage.getItem('wishlist') || [])
    };
  }

  // Bind event listeners
  bindEvents() {
    document.addEventListener('DOMContentLoaded', () => this.updateUI());
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  // Check authentication status
  isAuthenticated() {
    return !!this.state.token && !!this.state.user;
  }

  // Get current user
  getCurrentUser() {
    return this.state.user;
  }

  // Get auth token
  getToken() {
    return this.state.token;
  }

  // Handle storage changes (cross-tab sync)
  handleStorageChange(e) {
    if (e.key === 'token' || e.key === 'user' || e.key === 'wishlist') {
      this.init();
      this.updateUI();
    }
  }

  // Update UI based on auth state
  updateUI() {
    const guestButtons = document.getElementById('guestButtons');
    const userAccount = document.getElementById('userAccount');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const wishlistCount = document.getElementById('wishlistCount');

    if (this.isAuthenticated()) {
      // User is logged in
      if (guestButtons) guestButtons.classList.add('d-none');
      if (userAccount) {
        userAccount.classList.remove('d-none');
        if (usernameDisplay) {
          usernameDisplay.textContent = this.state.user.firstName || 'My Account';
        }
      }
      
      // Update wishlist count
      if (wishlistCount) {
        wishlistCount.textContent = this.state.wishlist.length;
        wishlistCount.style.display = this.state.wishlist.length ? 'block' : 'none';
      }
    } else {
      // User is logged out
      if (guestButtons) guestButtons.classList.remove('d-none');
      if (userAccount) userAccount.classList.add('d-none');
      if (wishlistCount) wishlistCount.style.display = 'none';
    }
  }

  // Login function
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Update state
      this.state.token = data.token;
      this.state.user = data.user;
      
      // Persist to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Fetch wishlist
      await this.fetchWishlist();
      
      this.updateUI();
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Fetch user's wishlist
  async fetchWishlist() {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${this.state.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch wishlist');

      const wishlist = await response.json();
      this.state.wishlist = wishlist;
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      this.updateUI();
      return wishlist;
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      return [];
    }
  }

  // Logout function
  logout() {
    // Clear state
    this.state = {
      token: null,
      user: null,
      wishlist: []
    };
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('wishlist');
    
    this.updateUI();
    
    // Redirect to home page if not already there
    if (!window.location.pathname.endsWith('Bootstrap.html')) {
      window.location.href = 'Bootstrap.html';
    }
  }

  // Check if user is authenticated (for protected routes)
  async verifyAuth() {
    if (!this.isAuthenticated()) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.state.token}`
        }
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth verification error:', error);
      this.logout();
      return false;
    }
  }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export functions for use in other modules
export const checkAuth = () => authManager.isAuthenticated();
export const getCurrentUser = () => authManager.getCurrentUser();
export const login = (email, password) => authManager.login(email, password);
export const logout = () => authManager.logout();
export const verifyAuth = () => authManager.verifyAuth();
export const updateAuthUI = () => authManager.updateUI();
export const fetchWishlist = () => authManager.fetchWishlist();

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
  authManager.updateUI();
  
  // Bind logout button if exists
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authManager.logout();
    });
  }
});


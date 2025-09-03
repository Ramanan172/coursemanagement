import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
    case 'REGISTER_FAIL':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial render if token exists
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      // If no token, set loading to false after a short delay
      setTimeout(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 1000);
    }
  }, [state.token]);

  // Helper function to make API requests with proper token handling
  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Always add token if it exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // If unauthorized, clear token
        if (response.status === 401) {
          dispatch({ type: 'AUTH_ERROR' });
        }
        throw new Error(data.error || data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Load user
  const loadUser = async () => {
    try {
      const data = await apiRequest('http://localhost:5000/api/auth/me');
      dispatch({
        type: 'USER_LOADED',
        payload: data
      });
      return data;
    } catch (error) {
      console.error('Error loading user:', error);
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      // First register the user
      const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await registerResponse.json();
      
      if (!registerResponse.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }
      
      // Dispatch success to store the token
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: error.message
      });
      throw error;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      // First login to get token
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await loginResponse.json();
      
      if (!loginResponse.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }
      
      // Dispatch success to store the token
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: error.message
      });
      throw error;
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Course API methods
  const courseAPI = {
    // Get all courses
    getCourses: () => apiRequest('http://localhost:5000/api/courses'),
    
    // Get single course
    getCourse: (id) => apiRequest(`http://localhost:5000/api/courses/${id}`),
    
    // Create course (admin only)
    createCourse: (courseData) => 
      apiRequest('http://localhost:5000/api/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      }),
    
    // Update course (admin only)
    updateCourse: (id, courseData) => 
      apiRequest(`http://localhost:5000/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
      }),
    
    // Delete course (admin only)
    deleteCourse: (id) => 
      apiRequest(`http://localhost:5000/api/courses/${id}`, {
        method: 'DELETE'
      })
  };

  // Enrollment API methods
  const enrollmentAPI = {
    // Enroll in course
    enroll: (courseId) => 
      apiRequest(`http://localhost:5000/api/enroll/${courseId}`, {
        method: 'POST'
      }),
    
    // Unenroll from course
    unenroll: (courseId) => 
      apiRequest(`http://localhost:5000/api/enroll/${courseId}`, {
        method: 'DELETE'
      }),
    
    // Get my enrolled courses
    getMyCourses: () => 
      apiRequest('http://localhost:5000/api/enroll/my-courses')
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      dispatch,
      register,
      login,
      logout,
      loadUser,
      courseAPI,
      enrollmentAPI,
      apiRequest // Expose apiRequest for direct use if needed
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
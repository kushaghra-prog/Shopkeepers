import { createContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

const initialState = { user: null, token: localStorage.getItem('token'), loading: true, isAuthenticated: false };

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS': return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'AUTH_FAIL': return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'LOGOUT': return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'UPDATE_USER': return { ...state, user: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { dispatch({ type: 'AUTH_FAIL' }); return; }
      try {
        const { data } = await api.get('/auth/profile');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: data, token } });
      } catch { dispatch({ type: 'AUTH_FAIL' }); localStorage.removeItem('token'); }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
    return data;
  };

  const signup = async (formData) => {
    const { data } = await api.post('/auth/signup', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (formData) => {
    const { data } = await api.put('/auth/profile', formData);
    dispatch({ type: 'UPDATE_USER', payload: data });
    return data;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

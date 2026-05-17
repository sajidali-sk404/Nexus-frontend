import { Entrepreneur, Investor } from '../types';

export const entrepreneurs: Entrepreneur[] = [
  
];

export const investors: Investor[] = [
  
];

// Combined user data for lookup
export const users = [...entrepreneurs, ...investors];

// Helper function to find a user by ID
export const findUserById = (id: string) => {
  return users.find(user => user._id === id) || null;
};

// Helper function to get a user by role
export const getUsersByRole = (role: 'entrepreneur' | 'investor') => {
  return users.filter(user => user.role === role);
};
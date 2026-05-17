import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Cookies from 'js-cookie';


// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on initial load
useEffect(() => {
  api.get("/auth/me")
    .then((response) => {
      setUser(response.data.user);
    })
    .catch((error) => {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch user data:", error);
      }

      setUser(null);
    })
    .finally(() => {
      setIsLoading(false);
    });
}, []);

  // M login function - in a real app, this would make an API call
const login = async (
  email: string,
  password: string,
): Promise<void> => {
  setIsLoading(true);

  try {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );

    const { user } = response.data;

    // save logged-in user
    setUser(user);

    toast.success("Login successful");

  } catch (error: any) {
    console.log(
      "Login error:",
      error.response?.data
    );

    throw new Error(
      error.response?.data?.message ||
        "Invalid email or password"
    );
  } finally {
    setIsLoading(false);
  }
};

  //register function - in a real app, this would make an API call
  const register = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<void> => {
  setIsLoading(true);

  try {
    const response = await api.post(
      "/auth/register",
      { name, email, password, role },
      { withCredentials: true }
    );

    const newUser: User = response.data.user;

    setUser(newUser);

    toast.success("Account created successfully!");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Registration failed"
    );
  } finally {
    setIsLoading(false);
  }
};

  // Mock forgot password function
 const forgotPassword = async (
  email: string
): Promise<void> => {
  try {
    const response = await api.post(
      "/auth/forgot-password",
      { email },
      {
        withCredentials: true,
      }
    );

    toast.success(
      response.data.message ||
      "Password reset instructions sent to your email"
    );
  } catch (error: any) {
    console.log(
      "Forgot password error:",
      error.response?.data
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to send password reset instructions"
    );
  } finally {
    setIsLoading(false);
  }
};
  // Mock reset password function
const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const response = await api.put(
      "/auth/change-password",
      {
        currentPassword,
        newPassword,
      },
      {
        withCredentials: true,
      }
    );

    toast.success(
      response.data.message ||
      "Password changed successfully"
    );
  } catch (error: any) {
    console.log(
      "Change password error:",
      error.response?.data
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to change password"
    );
  } finally {
    setIsLoading(false);
  }
};

  // Logout function
  const logout = (): void => {
    try {
      api.post("/auth/logout") 
    }catch {}
    Cookies.remove("token");
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update user profile
const updateProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  try {
    const response = await api.put(
      `/users/${userId}`,
      updates,
      {
        withCredentials: true,
      }
    );

    const { user } = response.data;

    // update local auth state
    setUser(user);

    toast.success("Profile updated successfully");
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      "Failed to update profile";

    toast.error(errorMessage);
    throw error;
  }
};

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    changePassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
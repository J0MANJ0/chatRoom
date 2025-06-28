import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { toast as toaster } from 'react-toastify';
import { io } from 'socket.io-client';

const BASE_URL =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_BACKEND_URL
    : '/';

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const { data } = await axiosInstance.get('/auth/check');

      if (data.success) {
        set({ authUser: data.user });
        get().connectSocket();
      } else {
        set({ authUser: null });
        toaster.error(data.message);
      }
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (userData) => {
    set({ isSigningUp: true });
    try {
      const { data } = await axiosInstance.post('/auth/signup', userData);

      if (data.success) {
        set({ authUser: data });
        toaster.success(data.message);
        toast.success(`Welcome ${data.user.fullName}`, {
          duration: 5000,
        });
        get().connectSocket();
      } else {
        set({ authUser: null });
        toaster.error(data.message);
      }
    } catch (error) {
      toaster.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (userData) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', userData);

      if (data.success) {
        set({ authUser: data });
        toaster.success(data.message);
        toast.success(`Welcome back ${data.fullName}`, {
          duration: 5000,
        });
        get().connectSocket();
      } else {
        set({ authUser: null });
        toaster.error(data.message);
      }
    } catch (error) {
      toaster.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const { data } = await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success(data.message);
      get().disconnectSocket();
    } catch (error) {
      toaster.error(error.response.data.message);
    }
  },
  updateProfile: async (userData) => {
    set({ isUpdatingProfile: true });
    try {
      const { data } = await axiosInstance.put(
        '/auth/update-profile',
        userData
      );

      set({ authUser: data });
      toaster.success(data.message);
    } catch (error) {
      toaster.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.on('onlineUsers', (userIds) => {
      console.log('Online users', userIds);
      set({ onlineUsers: userIds });
    });

    socket.connect();

    set({ socket });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));

import { create } from 'zustand';
import axios from '../api/axios';

export const useProfileStore = create((set, get) => ({
    profile: null,
    loading: false,
    error: null,

    fetchProfile: async (token) => {
        set({ loading: true });
        try {
            const res = await axios.get('/user/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ profile: res.data, loading: false });
        } catch (err) {
            console.error("Profile Fetch Error", err);
            set({ error: err, loading: false });
        }
    },

    updateProfile: async (token, updates) => {
        try {
            const res = await axios.patch('/user/me', updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ profile: res.data });
            return true;
        } catch (err) {
            console.error("Profile Update Error", err);
            return false;
        }
    }
}));

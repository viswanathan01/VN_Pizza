import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchPacks = createAsyncThunk('menu/fetchPacks', async () => {
    const res = await api.get('/inventory/packs');
    return res.data;
});

const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        packs: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPacks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPacks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.packs = action.payload;
            })
            .addCase(fetchPacks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default menuSlice.reducer;

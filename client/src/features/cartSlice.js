import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// --- ASYNC THUNKS ---

export const fetchCart = createAsyncThunk('cart/fetch', async (token) => {
    const res = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
});

export const addItemAsync = createAsyncThunk('cart/add', async ({ item, token }) => {
    const res = await api.post('/cart/add', { item }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
});

export const updateQuantityAsync = createAsyncThunk('cart/updateQty', async ({ itemId, quantity, token }) => {
    const res = await api.patch(`/cart/update`, { itemId, quantity }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
});

export const removeItemAsync = createAsyncThunk('cart/remove', async ({ itemId, token }) => {
    const res = await api.delete('/cart/remove', {
        headers: { Authorization: `Bearer ${token}` },
        data: { itemId }
    });
    return res.data;
});

export const clearCartAsync = createAsyncThunk('cart/clear', async (token) => {
    await api.delete('/cart', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return { items: [], totalAmount: 0 };
});

const initialState = {
  items: [],
  totalPrice: 0,
  status: 'idle',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
        state.items = [];
        state.totalPrice = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
          state.items = action.payload.items;
          state.totalPrice = action.payload.totalAmount;
          state.status = 'succeeded';
      })
      .addCase(addItemAsync.fulfilled, (state, action) => {
          state.items = action.payload.items;
          state.totalPrice = action.payload.totalAmount;
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
          state.items = action.payload.items;
          state.totalPrice = action.payload.totalAmount;
      })
      .addCase(removeItemAsync.fulfilled, (state, action) => {
          state.items = action.payload.items;
          state.totalPrice = action.payload.totalAmount;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
          state.items = [];
          state.totalPrice = 0;
      });
  }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

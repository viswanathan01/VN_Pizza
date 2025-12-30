import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, addItemAsync, updateQuantityAsync, removeItemAsync, clearCartAsync } from '../features/cartSlice';
import { useAuthStore } from './useAuthStore';

export const useCartStore = () => {
    const dispatch = useDispatch();
    const { items, totalPrice, status } = useSelector(state => state.cart);
    const { getToken, isSignedIn, isLoaded } = useAuthStore();

    const loadCart = async () => {
        if (!isLoaded || !isSignedIn) return;
        const token = await getToken();
        if (token) dispatch(fetchCart(token));
    };

    const addToCart = async (item) => {
        const token = await getToken();
        if (token) dispatch(addItemAsync({ item, token }));
    };

    const updateQuantity = async (itemId, quantity) => {
        const token = await getToken();
        if (token) dispatch(updateQuantityAsync({ itemId, quantity, token }));
    };

    const removeItem = async (itemId) => {
        const token = await getToken();
        if (token) dispatch(removeItemAsync({ itemId, token }));
    };

    const clearCart = async () => {
        const token = await getToken();
        if (token) dispatch(clearCartAsync(token));
    };

    return {
        items,
        totalPrice,
        status,
        loadCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart
    };
};

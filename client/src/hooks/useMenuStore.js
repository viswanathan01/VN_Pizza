import { useSelector, useDispatch } from 'react-redux';
import { fetchPacks } from '../features/menuSlice';
import { useEffect } from 'react';

export const useMenuStore = () => {
    const dispatch = useDispatch();
    const { packs, status, error } = useSelector(state => state.menu);

    const loadPacks = () => {
        if (status === 'idle') {
            dispatch(fetchPacks());
        }
    };

    return {
        packs,
        status,
        error,
        loadPacks
    };
};

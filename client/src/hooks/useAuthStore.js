import { useAuth, useUser } from '@clerk/clerk-react';

export const useAuthStore = () => {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();

    return {
        isLoaded,
        isSignedIn,
        getToken,
        user,
        role: (user?.publicMetadata?.role?.toUpperCase() === 'ADMIN' || user?.username === 'viswanathan') ? 'ADMIN' : 'USER'
    };
};

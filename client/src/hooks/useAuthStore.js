import { useAuth, useUser } from '@clerk/clerk-react';

export const useAuthStore = () => {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();

    let role = 'USER';
    if (user?.publicMetadata?.role) {
        role = user.publicMetadata.role.toUpperCase(); // Ensure uppercase for string comparisons
    }

    // Hardcoded super-admin fallback
    if (user?.username === 'viswanathan') {
        role = 'ADMIN';
    }

    return {
        isLoaded,
        isSignedIn,
        getToken,
        user,
        role
    };
};

import { useAuth, useUser } from '@clerk/clerk-react';

export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  imageUrl?: string;
}

// Custom hook to manage auth state with Clerk
export const useAuthService = () => {
  const { isLoaded, isSignedIn, signOut, getToken, userId } = useAuth();
  const { user } = useUser();

  const getCurrentUser = (): AuthUser | null => {
    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailAddress: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
    };
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return {
    isLoaded,
    isAuthenticated: isSignedIn,
    user: getCurrentUser(),
    userId,
    signOut: handleSignOut,
    getToken,
  };
};

export default useAuthService; 
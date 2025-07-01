import SidebarLayout from '@/layouts/sidebar-layout';
import HomePage from '@/pages/home';
import { 
  ClerkProvider, 
  useUser,
  SignIn,
  SignUp
} from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Loading from '@/components/ui/loading';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useUser();
  
  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return <Loading className="h-screen" size={32} />;
  }
  
  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // Render protected content if authenticated
  return <>{children}</>;
};

// Auth Route Component - handles both signed in and signed out states
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useUser();
  
  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return <Loading className="h-screen" size={32} />;
  }
  
  // Redirect to home if already authenticated
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  // Show auth form if not authenticated
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/sign-in">
        <Routes>
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <HomePage />
                </SidebarLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Auth Routes */}
          <Route 
            path="/sign-in" 
            element={
              <AuthRoute>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                  <SignIn />
                </div>
              </AuthRoute>
            } 
          />
          <Route 
            path="/sign-up" 
            element={
              <AuthRoute>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                  <SignUp />
                </div>
              </AuthRoute>
            } 
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  );
};

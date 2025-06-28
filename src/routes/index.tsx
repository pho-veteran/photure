import SidebarLayout from '@/layouts/sidebar-layout';
import HomePage from '@/pages/home';
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  RedirectToSignIn,
  SignIn,
  SignUp
} from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route } from 'react-router';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  );
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
              <SignedOut>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                  <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
                </div>
              </SignedOut>
            } 
          />
          <Route 
            path="/sign-up" 
            element={
              <SignedOut>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                  <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
                </div>
              </SignedOut>
            } 
          />
        </Routes>
        
        {/* Global redirect for unauthenticated users */}
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </ClerkProvider>
    </BrowserRouter>
  );
};

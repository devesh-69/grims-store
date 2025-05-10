import * as React from 'react';
import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, UserRole } from '@/types/auth';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  checkUserRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// List of admin emails - in a real-world scenario, this would be stored in and checked against the database
const ADMIN_EMAILS = ['admin@example.com', 'tatkaredevesh69@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Track if we've shown the sign in toast already
  const initialSignInComplete = useRef(false);
  // Track first mount of component
  const isInitialMount = useRef(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      return data?.map(r => r.role) || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  const setupUser = async (currentSession: Session | null) => {
    if (currentSession?.user) {
      // Check if the user is an admin based on their email
      const isAdmin = ADMIN_EMAILS.includes(currentSession.user.email || '');
      
      // Fetch user roles from database
      const roles = await fetchUserRoles(currentSession.user.id);
      
      const userWithRole: User = {
        ...currentSession.user,
        isAdmin,
        roles,
        user_metadata: currentSession.user.user_metadata,
        avatar_url: currentSession.user.user_metadata?.avatar_url as string,
      };
      
      setUser(userWithRole);
      return userWithRole;
    } else {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        // We use setTimeout to avoid a recursive loop with Supabase auth
        if (currentSession?.user) {
          setTimeout(async () => {
            await setupUser(currentSession);
          }, 0);
        } else {
          setUser(null);
        }
        
        // Only show toasts for actual sign in/out events, not just session checks
        if (event === 'SIGNED_IN' && !initialSignInComplete.current) {
          // Only show the toast the first time
          initialSignInComplete.current = true;
          toast.success('Signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          // Always show sign out toast
          toast.info('Signed out successfully');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      await setupUser(currentSession);
      setLoading(false);
      
      // Initial sign in is complete if we have a session on first load
      if (currentSession?.user) {
        initialSignInComplete.current = true;
      }
    });

    // After first mount, set initialMount to false
    isInitialMount.current = false;

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = (role: string): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true; // Admins have all roles
    return user.roles?.includes(role as UserRole) || false;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signUp, 
      signOut, 
      loading, 
      checkUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

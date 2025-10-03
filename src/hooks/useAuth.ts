import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  preferred_locale: 'nl' | 'en' | 'tr';
  ui_theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  created_at: string;
  updated_at: string;
  // Note: role is now stored in user_roles table, not here
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'ADMIN' | 'CONTRACTOR';
  created_at: string;
}

export interface ContractorProfile {
  id: string;
  user_id: string;
  company_name: string;
  kvk?: string;
  vat_number?: string;
  iban?: string;
  address_json?: any;
  default_hourly_rate: number;
  invoice_prefix?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  contractorProfile: ContractorProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [contractorProfile, setContractorProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setContractorProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      } else {
        setUserRole(roleData);

        // If user is a contractor, fetch contractor profile
        if (roleData?.role === 'CONTRACTOR') {
          const { data: contractorData, error: contractorError } = await supabase
            .from('contractor_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (contractorError) {
            console.error('Error fetching contractor profile:', contractorError);
          } else {
            setContractorProfile(contractorData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });

    if (!error) {
      toast({
        title: "Registratie succesvol",
        description: "Check je e-mail voor de verificatielink.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      toast({
        title: "Welkom terug!",
        description: "Je bent succesvol ingelogd.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      setContractorProfile(null);
      toast({
        title: "Tot ziens!",
        description: "Je bent uitgelogd.",
      });
    }

    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchUserProfile(user.id);
      
      toast({
        title: "Profiel bijgewerkt",
        description: "Je instellingen zijn opgeslagen.",
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    user,
    session,
    profile,
    userRole,
    contractorProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}
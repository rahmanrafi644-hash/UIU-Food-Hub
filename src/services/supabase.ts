/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const metaEnv = (import.meta as any).env || {};
const supabaseUrl: string = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string =
  metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Fallback dummy client if credentials are not yet configured in .env.local
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

// Initialize real Supabase client or a placeholder that does not throw on import
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key-00000000000000000000',
      { auth: { persistSession: false } }
    );

// ====================================================================
// AUTHENTICATION HELPERS
// ====================================================================

export interface SignUpStudentParams {
  fullName: string;
  email: string;
  phone: string;
  studentId?: string;
  password: string;
}

export interface SignUpVendorParams {
  vendorName: string;
  outletId: string;
  outletName: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Validates whether an email ends with @uiu.ac.bd
 */
export const isUiuEmail = (email: string): boolean => {
  return email.trim().toLowerCase().endsWith('@uiu.ac.bd');
};

/**
 * Student Registration: Enforces @uiu.ac.bd email restriction
 */
export const registerStudentWithSupabase = async (params: SignUpStudentParams) => {
  const cleanEmail = params.email.trim().toLowerCase();

  // Strict check: must end with @uiu.ac.bd
  if (!isUiuEmail(cleanEmail)) {
    return {
      success: false,
      error: 'Students must register using a valid UIU email address ending with @uiu.ac.bd.',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase credentials are not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          role: 'student',
          full_name: params.fullName.trim(),
          phone: params.phone.trim(),
          student_id: params.studentId?.trim() || cleanEmail.split('@')[0],
        },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      needsVerification: !data.session, // True if Supabase requires email verification
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during student registration.' };
  }
};

/**
 * Vendor Registration: General email allowed, attached to specific outlet
 */
export const registerVendorWithSupabase = async (params: SignUpVendorParams) => {
  const cleanEmail = params.email.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase credentials are not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.password,
      options: {
        data: {
          role: 'vendor',
          full_name: params.vendorName.trim(),
          phone: params.phone.trim(),
          vendor_outlet_id: params.outletId,
          vendor_outlet_name: params.outletName,
        },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      needsVerification: !data.session,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during vendor registration.' };
  }
};

/**
 * Sign in user with email & password
 */
export const loginWithSupabase = async (email: string, pass: string) => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase credentials are not configured in .env.local.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass,
    });

    if (error) {
      // Check for unverified email error
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          isUnconfirmed: true,
          error: 'Please verify your email address to activate your account.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed.' };
  }
};

/**
 * Resend verification email
 */
export const resendSupabaseVerification = async (email: string) => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured.' };
  }

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Could not resend email.' };
  }
};

/**
 * Request Password Reset
 */
export const requestPasswordReset = async (email: string) => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured.' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Could not send reset link.' };
  }
};

/**
 * Sign Out
 */
export const signOutSupabase = async () => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error signing out:', err);
  }
};

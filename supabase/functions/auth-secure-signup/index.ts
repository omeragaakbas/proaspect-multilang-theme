import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  userData: z.record(z.any()).optional(),
});

async function checkPasswordStrength(password: string): Promise<{ valid: boolean; message?: string }> {
  // Basic strength checks
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

async function checkHIBP(password: string): Promise<boolean> {
  try {
    // Hash password with SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Use k-anonymity: only send first 5 chars of hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      console.error('HIBP API error:', response.status);
      return false; // Don't block signup if HIBP is down
    }
    
    const text = await response.text();
    const hashes = text.split('\n');
    
    for (const line of hashes) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix === suffix) {
        return true; // Password found in breach database
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking HIBP:', error);
    return false; // Don't block signup if check fails
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const validated = SignupSchema.parse(body);

    // Check password strength
    const strengthCheck = await checkPasswordStrength(validated.password);
    if (!strengthCheck.valid) {
      return new Response(
        JSON.stringify({ error: strengthCheck.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if password has been leaked (HIBP)
    const isLeaked = await checkHIBP(validated.password);
    if (isLeaked) {
      return new Response(
        JSON.stringify({ error: 'This password has been found in a data breach. Please choose a different password.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user with service role (bypasses email confirmation if needed)
    const { data, error } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: false, // Auto-confirm for better UX, or set to true to require confirmation
      user_metadata: validated.userData || {},
    });

    if (error) {
      console.error('Error creating user:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create account. Email may already be in use.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ user: data.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auth-secure-signup function:', error);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

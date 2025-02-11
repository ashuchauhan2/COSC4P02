import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, code, password } = await req.json();

    // Check verification code
    const { data: codes, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (fetchError) throw fetchError;
    if (!codes) throw new Error('Invalid or expired code');

    // Verify the password matches
    const isValidPassword = await bcrypt.compare(password, codes.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Create the user in auth.users with the original password
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      password: password, // Use the original password for auth.users
      email_confirm: true
    });

    if (signUpError) throw signUpError;

    // Create verification record
    const { error: verificationError } = await supabase
      .from('user_verification')
      .insert([
        {
          user_id: authData.user.id,
          email: email,
          is_verified: true,
          verified_at: new Date().toISOString()
        }
      ]);

    if (verificationError) throw verificationError;

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', codes.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 
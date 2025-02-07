import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, code } = await req.json();

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

    // Create the user in auth.users
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      password: codes.password,
      email_confirm: true // Mark as email confirmed
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
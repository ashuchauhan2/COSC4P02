import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, code, password } = await req.json();

    // Check if user already exists in auth.users
    const { data: existingUsers, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const userExists = existingUsers.users.some(user => user.email === email);
    if (userExists) {
      throw new Error('An account with this email already exists');
    }

    // Store the verification code and password temporarily
    const { error: storeError } = await supabase
      .from('verification_codes')
      .insert([
        {
          email,
          code,
          password, // Store password temporarily
          expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          used: false
        }
      ]);

    if (storeError) throw storeError;

    // Send verification email
    const data = await resend.emails.send({
      from: 'Course Mix <noreply@coursemix.ca>',
      to: [email],
      subject: 'Verify Your Email - Course Mix',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">Welcome to Course Mix!</h2>
          <p>Thank you for registering. To verify your email address, please enter this code:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</span>
          </div>
          <p>This code will expire in 1 hour. If you don't verify your email within this time, you'll need to register again.</p>
          <p>Best regards,<br>The Course Mix Team</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Verification code error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 
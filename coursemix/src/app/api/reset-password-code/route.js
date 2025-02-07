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
    const body = await req.json();
    const { email, code, password } = body;

    // If code is provided, we're sending the verification email
    if (code) {
      const data = await resend.emails.send({
        from: 'Course Mix <noreply@coursemix.ca>',
        to: [email],
        subject: 'Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">Reset Your Password</h2>
            <p>You requested to reset your password. Here's your verification code:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</span>
            </div>
            <p>This code will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br>The Course Mix Team</p>
          </div>
        `
      });

      return NextResponse.json({ success: true, data });
    }

    // If password is provided, we're updating the password
    if (password) {
      console.log('Finding user with email:', email);

      // First, get the user's UUID
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Error fetching users:', userError);
        throw userError;
      }

      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('User not found');
      }

      console.log('Updating password for user ID:', user.id);
      
      // Now update the password with the user's UUID
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password }
      );

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      return NextResponse.json({ success: true, data });
    }

    throw new Error('Invalid request');
  } catch (error) {
    console.error('Reset code/password error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
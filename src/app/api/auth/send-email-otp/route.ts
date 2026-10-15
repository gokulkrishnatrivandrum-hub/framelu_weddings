import { NextResponse } from 'next/server';
import { generateOtpToken, sendOtpEmail } from '@/lib/emailOtp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create 10-minute signed token
    const token = generateOtpToken(email, otp, 10);

    // Send the email
    const emailResult = await sendOtpEmail({
      to: email,
      name: name || 'Customer',
      otp,
    });

    return NextResponse.json({
      success: true,
      message: emailResult.sent
        ? 'OTP code sent successfully to your email.'
        : 'OTP generated. Check console or use dev OTP code.',
      token,
      provider: emailResult.provider,
      devOtp: emailResult.devOtp,
    });
  } catch (error: any) {
    console.error('Error in send-email-otp route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while sending OTP.' },
      { status: 500 }
    );
  }
}

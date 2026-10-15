import { NextResponse } from 'next/server';
import { verifyOtpToken } from '@/lib/emailOtp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, token } = body;

    if (!email || !otp || !token) {
      return NextResponse.json(
        { success: false, error: 'Email, OTP, and token are required.' },
        { status: 400 }
      );
    }

    const verification = verifyOtpToken(email, otp, token);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.reason || 'Invalid OTP code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email OTP verified successfully.',
    });
  } catch (error: any) {
    console.error('Error in verify-email-otp route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while verifying OTP.' },
      { status: 500 }
    );
  }
}

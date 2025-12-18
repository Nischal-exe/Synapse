import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_otp_email(email: str, otp: str):
    html = f"""
    <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6D28D9; text-align: center;">Synapse Verification</h2>
        <p>Hello,</p>
        <p>Your verification code for Synapse is:</p>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">{otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; font-size: 12px; color: #9ca3af;">&copy; 2025 Synapse Collaborative Learning</p>
    </div>
    """
    
    if not resend.api_key:
        print(f"CRITICAL: RESEND_API_KEY not found. Logging OTP instead.")
        _log_otp_fallback(email, otp)
        return

    try:
        resend.Emails.send({
            "from": "Synapse <onboarding@resend.dev>",
            "to": [email],
            "subject": f"{otp} is your Synapse verification code",
            "html": html
        })
        print(f"Email sent successfully to {email}")
    except Exception as e:
        print(f"Resend API Error: {e}")
        _log_otp_fallback(email, otp)

def _log_otp_fallback(email: str, otp: str):
    print(f"\n==========================================")
    print(f"VERIFICATION CODE FOR: {email}")
    print(f"CODE: {otp}")
    print(f"==========================================\n")

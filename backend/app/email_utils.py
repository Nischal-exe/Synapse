import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

# Gmail SMTP Configuration
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_FROM", os.getenv("MAIL_USERNAME")),
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_otp_email(email: EmailStr, otp: str):
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
    
    if not os.getenv("MAIL_PASSWORD"):
        print("CRITICAL: MAIL_PASSWORD not set. Logging OTP instead.")
        _log_otp_fallback(email, otp)
        return

    message = MessageSchema(
        subject="Your Synapse Verification Code",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f"GMAIL SENDER: Email sent successfully to {email}")
    except Exception as e:
        print(f"GMAIL SMTP Error: {e}")
        _log_otp_fallback(email, otp)

def _log_otp_fallback(email: str, otp: str):
    print(f"\n******************************************")
    print(f"  OTP FOR {email}: {otp}")
    print(f"******************************************\n")

import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "user@example.com"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "password"),
    MAIL_FROM = os.getenv("MAIL_FROM", "user@example.com"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_otp_email(email: EmailStr, otp: str):
    html = f"""
    <html>
        <body>
            <h1>Synapse Verification</h1>
            <p>Your OTP code is: <strong>{otp}</strong></p>
            <p>This code expires in 5 minutes.</p>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject="Your Synapse Verification Code",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        print(f"Failed to send email: {e}")
        print(f"==========================================")
        print(f"OTP for {email}: {otp}")
        print(f"==========================================")

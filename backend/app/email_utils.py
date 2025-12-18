import os
import resend
import asyncio
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("RESEND_FROM", "onboarding@resend.dev")

async def send_otp_email(email: str, otp: str):
    html_content = f"""
    <html>
        <body>
            <h1>Synapse Verification</h1>
            <p>Your OTP code is: <strong>{otp}</strong></p>
            <p>This code expires in 5 minutes.</p>
        </body>
    </html>
    """

    params = {
        "from": FROM_EMAIL,
        "to": [email],
        "subject": "Your Synapse Verification Code",
        "html": html_content,
    }

    loop = asyncio.get_event_loop()
    try:
        # resend.Emails.send is synchronous, so we run it in a separate thread
        # to avoid blocking the FastAPI event loop.
        await loop.run_in_executor(None, lambda: resend.Emails.send(params))
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")
        # Fallback: Print OTP to console for dev convenience
        print(f"==========================================")
        print(f"OTP for {email}: {otp}")
        print(f"==========================================")

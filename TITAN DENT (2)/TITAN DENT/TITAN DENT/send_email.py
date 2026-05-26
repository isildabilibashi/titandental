from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from pathlib import Path
import smtplib

message = MIMEMultipart()
message["from"] = "Mosh Hamedani"
message["to"] = "clinictitandental@gmail.com"
message["subject"] = "This is a test"
message.attach(MIMEText("Body"))

image_path = Path("mosh.png")
if image_path.exists():
    message.attach(MIMEImage(image_path.read_bytes()))
else:
    print(f"Warning: {image_path} not found, sending without image")

try:
    with smtplib.SMTP(host="smtp.gmail.com", port=587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login("testuser@codewithmosh.com", "todayskyisblue123")
        smtp.send_message(message)
        print("Sent...")
except smtplib.SMTPAuthenticationError:
    print("Authentication failed. Gmail requires an App Password — generate one at https://myaccount.google.com/apppasswords")
except Exception as e:
    print(f"Failed to send email: {e}")

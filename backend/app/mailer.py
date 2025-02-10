# app/mailer.py

import smtplib
from email.mime.text import MIMEText

# Настройки для Outlook
SMTP_SERVER = "smtp.office365.com"
SMTP_PORT = 587
SMTP_USERNAME = "242975@astanait.edu.kz"  # ваш Outlook email
SMTP_PASSWORD = "00723Ivy"  # ваш пароль или специальный пароль приложения, если требуется

def send_verification_email(to_email: str, code: str):
    subject = "Ваш код для верификации"
    body = f"Здравствуйте,\n\nВаш код для верификации: {code}\n\nСпасибо!"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USERNAME
    msg["To"] = to_email

    try:
        # Устанавливаем соединение и активируем STARTTLS
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # переключаемся на защищенное соединение
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, [to_email], msg.as_string())
        server.quit()
        print("Письмо отправлено успешно!")
    except Exception as e:
        print(f"Ошибка при отправке email: {e}")

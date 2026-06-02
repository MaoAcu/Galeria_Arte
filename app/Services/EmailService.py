import smtplib
import os
import threading
import logging
import queue
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from email.utils import formataddr

logger = logging.getLogger(__name__)

class EmailQueue:
    _instance = None
    _lock = threading.Lock()
    _queue = queue.Queue()
    _worker_thread = None
    _running = False
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def start(self):
         
        if self._worker_thread is None or not self._worker_thread.is_alive():
            self._running = True
            self._worker_thread = threading.Thread(target=self._process_queue, daemon=True)
            self._worker_thread.start()
            logger.info("Cola de correos iniciada")
    
    def stop(self):
        """Detiene el worker"""
        self._running = False
        if self._worker_thread:
            self._worker_thread.join(timeout=5)
    
    def add(self, email_service, to_email, subject, html_content, text_content=None):
        
        self._queue.put({
            'email_service': email_service,
            'to_email': to_email,
            'subject': subject,
            'html_content': html_content,
            'text_content': text_content,
            'created_at': datetime.now()
        })
        logger.info(f"Correo encolado para {to_email} - Tamano cola: {self._queue.qsize()}")
    
    def _process_queue(self):
     
        while self._running:
            try:
                task = self._queue.get(timeout=5)
                
                email_service = task['email_service']
                success = email_service._send_smtp(
                    task['to_email'],
                    task['subject'],
                    task['html_content'],
                    task['text_content']
                )
                
                if success:
                    logger.info(f"Correo enviado a {task['to_email']}")
                else:
                    logger.error(f"Fallo envio a {task['to_email']}")
                
                self._queue.task_done()
                time.sleep(0.5)
                
            except queue.Empty:
                time.sleep(0.1)
                continue
            except Exception as e:
                logger.error(f"Error procesando cola: {e}")
    
    def get_queue_size(self):
        return self._queue.qsize()


class EmailService:
    def __init__(self):
        self.smtp_server = None
        self.smtp_port = None
        self.sender_email = None 
        self.password = None
        self.sender_name = None
        self.email_queue = EmailQueue()
        self._initialized = False

    def init_app(self, app=None):
         
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp-relay.brevo.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587)) 
        self.sender_email = os.getenv("SMTP_USER")
        self.password = os.getenv("SMTP_PASSWORD")
        self.sender_name = os.getenv("SMTP_NAME", "EscultorDaniel")
        self.from_email = os.getenv("SMTP_FROM", "no-replay@logiclookcr.com")
        if not all([self.smtp_server, self.sender_email, self.password]):
            logger.error(f"Error con las variables de entorno")
            return False
        
     
        self.email_queue.start()
        self._initialized = True
        return True

    def _send_smtp(self, to_email, subject, html_content, text_content=None):
    
        try:
            msg = MIMEMultipart('alternative')
            msg["From"] = formataddr(("Daniel Guido", self.from_email))
            msg["To"] = to_email
            msg["Subject"] = subject
            msg["Reply-To"] = self.sender_email
            msg["X-Mailer"] = "Escultor Daniel"

            if text_content:
                msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))

            # Log de conexion
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=30)
            
            
            server.starttls()
            
            
            server.login(self.sender_email, self.password)
            
            
            server.sendmail(self.sender_email, to_email, msg.as_string())
            server.quit()

            logger.info(f"Correo enviado exitosamente a {to_email}")
            return True

        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"Error de autenticacion SMTP: {e}")
            return False
        except smtplib.SMTPConnectError as e:
            logger.error(f"Error de conexion SMTP: {e}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"Error SMTP general: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado enviando correo: {type(e).__name__}: {e}")
            return False
        
    def send_email(self, to_email, subject, html_content, text_content=None):
       
        if not self._initialized:
           
            return False
        
        self.email_queue.add(self, to_email, subject, html_content, text_content)
        return True
    
    def SendVerificationCode(self, email, code, username=None):
    
            try:
                if not username:
                    username = email.split('@')[0]
            
                subject = f"Codigo de Seguridad - {self.sender_name}"
            
                html = f"""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
                </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #fdfcfb; color: #333333;">
                <table role="presentation" style="width: 100%; background-color: #fdfcfb; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-top: 6px solid #a67c52;">
                                
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 45px 30px; text-align: center; background: linear-gradient(135deg, #fdfcfb 0%, #f0f0f0 100%);">
                                        <div style="font-family: 'Playfair Display', serif; font-size: 34px; color: #a67c52; letter-spacing: 4px; margin-bottom: 8px;">Daniel Guido</div>
                                        <div style="width: 60px; height: 2px; background-color: #d2691e; margin: 15px auto;"></div>
                                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #a67c52;">Escultor Costarricense</div>
                                    </td>
                                </tr>
                                
                                <!-- Contenido -->
                                <tr>
                                    <td style="padding: 0 50px 40px;">
                                        <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #a67c52; text-align: center; margin-bottom: 25px; letter-spacing: 2px;">Verificacion de Acceso</h2>
                                        
                                        <p style="font-size: 16px; color: #555; line-height: 1.6;">Estimado/a <strong style="color: #a67c52;">{username}</strong>,</p>
                                        
                                        <p style="font-size: 15px; line-height: 1.8; color: #666;">
                                            Has solicitado un codigo de verificacion para acceder a tu cuenta en el portal de <strong style="color: #a67c52;">Daniel Guido</strong>. Por motivos de seguridad, utiliza la siguiente clave unica de acceso:
                                        </p>
                                        
                                        <!-- Codigo -->
                                        <div style="margin: 40px 0; text-align: center; padding: 35px; background-color: #fdfcfb; border: 2px solid #f0f0f0; border-radius: 15px;">
                                            <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #d2691e; margin-bottom: 15px; font-weight: 600;">Tu clave de seguridad</span>
                                            <div style="font-family: 'Courier New', monospace; font-size: 48px; font-weight: bold; color: #a67c52; letter-spacing: 12px; border: 2px dashed #d2691e; display: inline-block; padding: 15px 35px; border-radius: 8px; background-color: #ffffff;">
                                                {code}
                                            </div>
                                            <p style="font-size: 12px; color: #999; margin-top: 25px; font-style: italic;">Valido unicamente por los proximos 10 minutos.</p>
                                        </div>

                                        <!-- Nota de seguridad -->
                                        <div style="background-color: #fdfcfb; border-left: 4px solid #d2691e; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
                                            <p style="font-size: 13px; color: #777; margin: 0; line-height: 1.6;">
                                                Si no has iniciado este proceso, te recomendamos ignorar este mensaje. La seguridad de tu cuenta es nuestra prioridad.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 35px; background-color: #f0f0f0; text-align: center; border-top: 2px solid #a67c52;">
                                        <p style="margin: 0; color: #a67c52; font-family: 'Playfair Display', serif; font-size: 16px; letter-spacing: 2px;">Daniel Guido</p>
                                        <div style="width: 40px; height: 1px; background-color: #d2691e; margin: 10px auto;"></div>
                                        <p style="margin: 12px 0 0; color: #888; font-size: 10px; line-height: 1.8; text-transform: uppercase; letter-spacing: 1px;">
                                            Escultura  Costarricense<br>
                                            Puntarenas, Costa Rica<br><br>
                                            &copy; 2026 Daniel Guido. Todos los derechos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            
                text = f"""
            Daniel Guido - Escultor Costarricense
            
            Hola {username},
            
            Tu codigo de seguridad es: {code}
            
            Este codigo es valido por 10 minutos.
            
            Si no solicitaste este codigo, por favor ignora este correo.
            
            ---
            Daniel Guido
            Escultura Costarricense
            Puntarenas, Costa Rica
            """
            
    
                return self.send_email(email, subject, html, text)
            
            except Exception as e:
                logger.error(f"Error preparando envio para {email}: {e}")
                return False
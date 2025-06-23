
from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
import os
import random
import string
import json
from datetime import datetime

app = Flask(__name__)

# Email Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('EMAIL_USERNAME')

mail = Mail(app)

# Configuration
UPLOAD_FOLDER = 'static/images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def generate_game_id():
    chars = string.ascii_uppercase + string.digits
    chars = chars.translate(str.maketrans('', '', 'IO10'))
    return ''.join(random.choice(chars) for _ in range(8))

def save_to_json(data):
    try:
        with open('ids_database.json', 'r') as f:
            existing_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        existing_data = []
    
    existing_data.append(data)
    
    with open('ids_database.json', 'w') as f:
        json.dump(existing_data, f, indent=2)

def send_email_with_id(email, new_id, name, game_id):
    try:
        msg = Message(
            subject='Your Elite ID Card is Ready!',
            recipients=[email],
            html=f'''
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px;">
                <div style="background-color: #1a0000; border: 2px solid #ff0000; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #ff0000; text-align: center; font-family: 'Courier New', monospace;">ELITE ID GENERATED</h1>
                    
                    <p>Greetings Agent <strong>{name}</strong>,</p>
                    
                    <p>Your Elite Identification Card has been successfully generated and is ready for deployment.</p>
                    
                    <div style="background-color: #000; border: 2px solid #ff0000; padding: 20px; margin: 20px 0; text-align: center;">
                        <h2 style="color: #ff0000; font-family: 'Courier New', monospace; font-size: 32px; letter-spacing: 3px; margin: 0;">
                            {new_id}
                        </h2>
                    </div>
                    
                    <p><strong>Agent Details:</strong></p>
                    <ul style="list-style-type: none; padding-left: 0;">
                        <li><strong>Agent Name:</strong> {name}</li>
                        <li><strong>Callsign:</strong> {game_id}</li>
                        <li><strong>Elite ID:</strong> {new_id}</li>
                    </ul>
                    
                    <p>Please keep this ID secure and present it when required during elite operations.</p>
                    
                    <p style="color: #ff0000; font-style: italic;">Welcome to the Elite.</p>
                    
                    <hr style="border: 1px solid #ff0000; margin: 30px 0;">
                    <p style="font-size: 12px; color: #888;">This is an automated message from the Elite ID Generator System.</p>
                </div>
            </body>
            </html>
            '''
        )
        mail.send(msg)
        print(f"Email successfully sent to {email}: Your Elite ID is {new_id}")
        return True
    except Exception as e:
        print(f"Failed to send email to {email}: {str(e)}")
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_id', methods=['POST'])
def generate_id():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        game_id = data.get('gameId', '').strip()
        email = data.get('email', '').strip()
        bg_type = data.get('bgType', 'default')
        
        if not name or not game_id:
            return jsonify({'error': 'Name and game ID are required'}), 400

        # Generate new ID
        new_id = generate_game_id()
        
        # Save to JSON database
        id_data = {
            'id': new_id,
            'name': name,
            'game_id': game_id,
            'email': email,
            'bg_type': bg_type,
            'created_at': datetime.now().isoformat()
        }
        save_to_json(id_data)
        
        # Send email if email is provided
        if email:
            email_sent = send_email_with_id(email, new_id, name, game_id)
            if not email_sent:
                print(f"Warning: Failed to send email to {email}")
        
        return jsonify({
            'id': new_id,
            'name': name,
            'gameId': game_id,
            'emailSent': bool(email and email_sent) if email else False
        })
    
    except Exception as e:
        print(f"Error in generate_id: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

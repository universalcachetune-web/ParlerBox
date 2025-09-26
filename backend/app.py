from flask import Flask, send_from_directory, jsonify, request
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

app = Flask(__name__, static_folder='./static', static_url_path='')

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/features')
def get_features():
    features = [
        {
            'icon': 'fa-shield-alt',
            'title': 'Operates Within Your Firewall',
            'description': "ParlerBox is engineered to run entirely within your network boundaries, ensuring full data sovereignty—even in air-gapped environments with no internet connectivity."
        },
        {
            'icon': 'fa-plug',
            'title': 'Integrates With Internal Systems',
            'description': "Connects directly to your enterprise's files, emails, and databases to deliver insights rooted in your private, proprietary data ecosystem."
        },
        {
            'icon': 'fa-comments',
            'title': 'Natural Language Query Interface',
            'description': "Enables users to pose complex questions using plain language and receive rapid, context-rich answers powered by domain-specific models."
        },
        {
            'icon': 'fa-microchip',
            'title': 'Delivered on High-Performance Hardware',
            'description': "Runs on dedicated inference-optimized servers preconfigured for low-latency, high-throughput execution at scale."
        },
        {
            'icon': 'fa-puzzle-piece',
            'title': 'Plug and Play Architecture',
            'description': "Simple deployment process with easy connection to existing systems, requiring minimal configuration and setup time."
        },
        {
            'icon': 'fa-database',
            'title': 'Consumes Any Data in Your System',
            'description': "Automated ingestion and indexing of diverse data sources including files, emails, databases, and documents for comprehensive search capabilities."
        }
    ]
    return jsonify(features)

@app.route('/api/images')
def get_images():
    images = [
        '20250926_2116_Efficient Query Response_simple_compose_01k63q7q61f109pk7qdte4mh47.png',
        '20250926_2116_Efficient Query Response_simple_compose_01k63q7q62e3wacxg996m9cpjy.png'
    ]
    return jsonify(images)

def send_newsletter_email(email):
    """Send newsletter subscription email"""
    # Email configuration
    sender_email = "universalcachetune@gmail.com"
    sender_password = os.environ.get('senderPassword')  # Get from environment variable
    receiver_email = "universalcachetune@gmail.com"

    # Create message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = f"New Newsletter Subscription - ParlerBox"

    # Email body
    body = f"""
    New newsletter subscription for Parlerbox:

    Email: {email}

    ---
    This email was sent from the newsletter subscription form on the Parlerbox website.
    """

    msg.attach(MIMEText(body, 'plain'))

    try:
        # Create secure connection with server and send email
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

        return True, "Email sent successfully!"
    except Exception as e:
        print(f"Newsletter email sending failed: {str(e)}")
        return False, f"Failed to send email: {str(e)}"

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    success, message = send_newsletter_email(email)
    return jsonify({'success': success, 'message': message})

@app.route('/subscribe')
def subscribe_page():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(debug=False, port=5000)

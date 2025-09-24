import os
# Configure TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF logging except errors
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN optimizations

from app import create_app
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = create_app()

if __name__ == "__main__":
    # Ensure the models directory exists
    os.makedirs(app.config['MODEL_PATH'], exist_ok=True)
    app.run(debug=True)

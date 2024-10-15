from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)

CORS(app, resources={r"/predict": {"origins": "*"}}, supports_credentials=True)

# Load the trained model and vectorizer
model = joblib.load('ticket_classifier_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        headers = response.headers

        # Allow all domains to access this route
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        headers['Access-Control-Allow-Headers'] = 'Content-Type'

        return response

    try:
        data = request.get_json(force=True)
        text = data['text']

        text_tfidf = vectorizer.transform([text])

        predicted_category = model.predict(text_tfidf)[0]

        response = jsonify({'category': predicted_category})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    except Exception as e:
        print('Error in prediction endpoint:', e)
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)

#!/usr/bin/env python3
# Shadow Terminal — Flask Server
# Deploy ready: Railway / Render / Cloud Run

import os
import json
from flask import Flask, send_from_directory, jsonify, request

app = Flask(__name__, static_folder='.')

CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'config.json')

def load_config():
    # Prioritas: environment variable Railway → config.json → kosong
    env_key      = os.environ.get('API_KEY', '')
    env_provider = os.environ.get('API_PROVIDER', '')
    env_model    = os.environ.get('API_MODEL', '')

    if env_key:
        return {
            'key':      env_key,
            'provider': env_provider or 'openrouter',
            'model':    env_model or 'openrouter/auto'
        }

    # Fallback ke config.json (lokal)
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)

    return {}

def save_config(data):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(load_config())

@app.route('/api/config', methods=['POST'])
def set_config():
    data = request.get_json()
    save_config(data)
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"\n  Shadow Terminal running on port {port}\n")
    app.run(host='0.0.0.0', port=port)

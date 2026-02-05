import os
import librosa
import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

# SETTINGS
DATA_PATH = "./dataset"  # Folders: dataset/human/ and dataset/ai/
MFCC_COUNT = 13

def extract_features(file_path):
    try:
        audio, sr = librosa.load(file_path, sr=16000)
        # Extract MFCCs
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=MFCC_COUNT)
        return np.mean(mfccs.T, axis=0)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def train():
    features = []
    labels = []

    # Load Human Samples (Label: 0)
    human_dir = os.path.join(DATA_PATH, 'human')
    for file in os.listdir(human_dir):
        if file.endswith('.wav'):
            feat = extract_features(os.path.join(human_dir, file))
            if feat is not None:
                features.append(feat)
                labels.append(0)

    # Load AI Samples (Label: 1)
    ai_dir = os.path.join(DATA_PATH, 'ai')
    for file in os.listdir(ai_dir):
        if file.endswith('.wav'):
            feat = extract_features(os.path.join(ai_dir, file))
            if feat is not None:
                features.append(feat)
                labels.append(1)

    X = np.array(features)
    y = np.array(labels)

    # Split and Scale
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train SVM with probability=True for the confidence score
    model = SVC(kernel='rbf', probability=True)
    model.fit(X_train_scaled, y_train)

    # Save both files to your ai_engine folder
    joblib.dump(model, 'svm_model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    print("Training Complete. Model and Scaler saved.")

if __name__ == "__main__":
    train()
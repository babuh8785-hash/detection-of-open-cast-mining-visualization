import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

def train_and_save_dummy_model(output_path):
    """Compiles and fits a small CNN model, saving it as an H5 file.
    This creates a real Tensorflow model file containing structure and weights.
    """
    print(f"Initializing dummy TensorFlow model at {output_path}...")
    
    # 1. Define model architecture
    model = models.Sequential([
        layers.Input(shape=(224, 224, 3)),
        layers.Conv2D(8, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(16, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(16, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(1, activation='sigmoid')  # Binary output: 0 = Non Mining, 1 = Mining
    ])
    
    # 2. Compile model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    # 3. Fit on random noise to initialize weights & compile structures
    x_dummy = np.random.rand(10, 224, 224, 3).astype(np.float32)
    y_dummy = np.array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]).reshape(-1, 1).astype(np.float32)
    
    model.fit(x_dummy, y_dummy, epochs=1, verbose=0)
    
    # 4. Save model representation
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model.save(output_path)
    print(f"CNN Model successfully serialized and stored at: {output_path}")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_file_path = os.path.join(script_dir, 'model.h5')
    train_and_save_dummy_model(model_file_path)

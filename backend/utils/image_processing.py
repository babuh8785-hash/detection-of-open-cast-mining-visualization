import cv2
import numpy as np
import os
from PIL import Image as PILImage

def validate_image(file_path):
    """Validates if file is a readable image using Pillow to prevent security vulnerabilities or corrupt files."""
    try:
        with PILImage.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False

def preprocess_image(input_path, output_path, resize=True, normalize=True, noise_removal=True, enhancement=True):
    """Applies pipeline preprocessing steps on the image.
    - resize: resizes to (224, 224) standard CNN dimensions.
    - normalize: divides pixel values by 255.0.
    - noise_removal: applies Gaussian Blur (5x5 kernel).
    - enhancement: applies CLAHE (Contrast Limited Adaptive Histogram Equalization) in the L*a*b* space.
    Saves the output image to `output_path` and returns a NumPy float32 array.
    """
    # Load image using OpenCV
    img = cv2.imread(input_path)
    if img is None:
        raise ValueError("Unable to read image. The file may be corrupt or of an unsupported format.")

    # Convert from BGR (OpenCV default) to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    processed = img_rgb.copy()

    # 1. Noise Removal (Gaussian Blur)
    if noise_removal:
        processed = cv2.GaussianBlur(processed, (5, 5), 0)

    # 2. Image Contrast Enhancement
    if enhancement:
        # Convert RGB to LAB space to equalize brightness/lightness channel without distorting colors
        lab = cv2.cvtColor(processed, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        processed = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)

    # 3. Resize to 224x224 (typical for ResNet/VGG/custom CNN models)
    if resize:
        processed = cv2.resize(processed, (224, 224), interpolation=cv2.INTER_AREA)

    # Save the processed image back to disk as BGR for visual interface feedback
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    bgr_out = cv2.cvtColor(processed, cv2.COLOR_RGB2BGR)
    cv2.imwrite(output_path, bgr_out)

    # 4. Normalize pixel scale to [0, 1] for model input
    if normalize:
        normalized_img = processed.astype(np.float32) / 255.0
        return normalized_img
    
    return processed.astype(np.float32)

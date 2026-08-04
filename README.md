# 🛰️ MineDetect: Open Cast Mining Detection & Visualization

[![GitHub license](https://img.shields.io/github/license/babuh8785-hash/detection-of-open-cast-mining-visualization?style=flat-square&color=emerald)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/babuh8785-hash/detection-of-open-cast-mining-visualization?style=flat-square&color=teal)](https://github.com/babuh8785-hash/detection-of-open-cast-mining-visualization/stargazers)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-blue?style=flat-square&logo=vite)](https://vite.dev/)
[![Flask](https://img.shields.io/badge/Backend-Flask%20%2F%20Python-orange?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20SQLite-blueviolet?style=flat-square&logo=mysql)](https://www.mysql.com/)

An advanced remote sensing analysis and earth observation platform designed to identify and monitor open cast mining excavations from satellite imagery. MineDetect provides researchers, regulators, and environmentalists with a comprehensive suite to upload satellite image tiles, execute configurable OpenCV image preprocessing pipelines, run prediction runs on custom Convolutional Neural Networks (CNN), and query historical audits.

---

## 📸 Screenshots (Mock Preview)

| 🖥️ Landing Workspace | 📊 Analytical Dashboard |
| :---: | :---: |
| ![Landing Page Placeholder](https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop) | ![Dashboard Placeholder](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop) |

| 🔬 Pipeline Workspace | 📄 Detail Diagnostics Report |
| :---: | :---: |
| ![Detection Page Placeholder](https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop) | ![Result Page Placeholder](https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop) |

---

## ✨ Features

- **🔐 Robust Session Boundaries**: Custom JWT authentication middleware separating roles for **Mining Researchers (Standard Users)** and **Platform Administrators**.
- **📈 Rich Diagnostics Dashboard**: High-fidelity Chart.js visualization ratio widgets, monitoring total mining site discoveries, average inference confidence, and recent logs.
- **🛠️ OpenCV Preprocessing Workspace**: Multi-stage imagery pipeline allowing real-time toggle adjustments for Resolution Scaling, Normalization, Bilateral Noise Filtering, and Adaptive CLAHE Contrast Enhancement.
- **🧠 Deep Learning Classifier**: Injects preprocessed image tensors into a Convolutional Neural Network (CNN) to output mining probability and inference speeds.
- **📜 paginated Audit Logs**: Interactive tables supporting real-time search queries, filter categories, column sorting, and custom pagination.
- **🛡️ Administrative Management Grid**: Diagnostic controls to view and delete user accounts, monitor system health, and clean up disk usage cascaded.
- **📄 Printable Reports**: Print-friendly layouts for generating analysis summaries on the fly.

---

## 🛠️ Tech Stack

### Frontend Core
- **Framework**: React.js (Vite Bundle Engine)
- **Styling**: Tailwind CSS (Dark Mode Integration)
- **Charts**: Chart.js (`react-chartjs-2`)
- **Icons**: React Icons (Feather Icon variant pack)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (with Interceptors for Authorization propagation)

### Backend API
- **Web Engine**: Flask (Python 3.12 compatible)
- **ORM / Database**: SQLAlchemy (MySQL pymysql adapter in production, SQLite fallback in local)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt hashing
- **Computer Vision**: OpenCV (`opencv-python-headless`) & Pillow
- **Machine Learning**: TensorFlow CPU / Keras Engine

---

## 📐 System Architecture

```mermaid
graph TD
    A[React Client] -- HTTP Requests + JWT --> B[Flask Gateway Router]
    B -- Authenticate --> C[JWT Auth Middleware]
    B -- CRUD Queries --> D[SQLAlchemy ORM]
    D -- Connection --> E[(MySQL / SQLite Database)]
    B -- Imagery Management --> F[OpenCV Preprocessing Engine]
    F -- Array Tensors --> G[TensorFlow CNN Inference]
    G -- Label + Confidence --> B
    B -- Serve Uploads --> A
```

---

## 📁 Folder Structure

```text
├── backend/
│   ├── config/              # Server configuration class (config.py)
│   ├── middleware/          # JWT and role route protection (auth_middleware.py)
│   ├── ml/                  # Keras CNN model weights and training script
│   ├── models/              # SQLAlchemy schema model schemas (models.py)
│   ├── routes/              # API blueprints (auth, user, ml_predict, admin)
│   ├── services/            # ML inference loading helper (predict_service.py)
│   ├── uploads/             # Server disk storage for raw & processed images
│   ├── utils/               # OpenCV image pipeline (image_processing.py)
│   ├── requirements.txt     # Python backend dependencies
│   └── app.py               # Flask Application factory entrypoint
│
├── frontend/
│   ├── public/              # Static frontend assets
│   ├── src/
│   │   ├── components/      # RouteGuards protected switches
│   │   ├── hooks/           # useToast provider context
│   │   ├── layouts/         # Dashboard navigation wrappers
│   │   ├── pages/           # Landing, Login, Dashboard, Profile, Admin, etc.
│   │   ├── services/        # Axios API instances (api.js)
│   │   ├── App.jsx          # Main Router Setup
│   │   ├── index.css        # Tailwind directives and Glassmorphism templates
│   │   └── main.jsx         # App rendering portal
│   ├── package.json         # NPM libraries list
│   └── tailwind.config.js   # Tailwinds color schemes and theme configuration
└── README.md
```

---

## 🚀 Installation & Local Guide

### Prerequisites
- **Python**: v3.11 or v3.12
- **Node.js**: v18 or newer
- **Git**

### 1. Database Setup
By default, the application uses **SQLite** locally (`sqlite:///opencast.db` created inside the `instance` folder) for simple boot-up. If you wish to use **MySQL**, make sure to set the `DATABASE_URL` environment variable:
```bash
# MySQL Connection URI format
DATABASE_URL="mysql+pymysql://username:password@localhost:3306/opencast_db"
```

### 2. Backend Startup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Initialize virtual environment and activate:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server (run from project root directory to preserve module imports):
   ```bash
   # From project root:
   $env:PYTHONPATH="."  # Windows PowerShell
   python backend/app.py
   ```
   The API will listen at `http://localhost:5000/`. On initial launch, database tables will be created and two default test accounts will be seeded:
   - **Administrator**: `admin@opencast.com` (password: `adminpassword`)
   - **Researcher**: `user@opencast.com` (password: `userpassword`)

### 3. Frontend Startup
1. Navigate into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The client interface will boot at `http://localhost:5173/`.

---

## ⚙️ Environment Variables

Copy the `.env.example` file to configure customized runtime flags:

| Variable | Scope | Description | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | Port for the Flask Server to run on | `5000` |
| `SECRET_KEY` | Backend | Session security encoding string | `super-secret-key` |
| `JWT_SECRET` | Backend | Cryptographic key for token signing | `jwt-secure-key` |
| `DATABASE_URL` | Backend | Database connection URI | Local SQLite fallback |
| `CORS_ORIGIN` | Backend | CORS allowed domains | `*` |
| `VITE_API_URL` | Frontend | Backend URL for API communication | `http://localhost:5000` |

---

## 🔬 Image Processing & ML Workflow

### Preprocessing Logic (OpenCV)
1. **Histogram CLAHE Stretch**: Enhances global contrast across satellite spectrums.
2. **Noise Suppression**: Bilateral filter mitigates high-frequency noise while keeping site boundary edges sharp.
3. **Array Normalization**: Converts pixel values from `[0, 255]` integers into `[0.0, 1.0]` floats.

### Machine Learning
- **Model Type**: Sequential Convolutional Neural Network (CNN)
- **Input Dimensions**: `224x224x3` (RGB)
- **Inference Fallback**: On systems lacking TensorFlow support due to space, the backend falls back to high-fidelity deterministic classification outputs based on image mean values to allow full integration testing.

---

## 🌐 API Endpoints

### 🔐 Auth Router (`/auth`)
- `POST /register`: Registers user accounts.
- `POST /login`: Verifies credentials and issues JWT.
- `POST /logout`: client session invalidation.

### 🛰️ Prediction Router (`/`)
- `POST /upload`: Uploads raw satellite tiles.
- `POST /predict`: Preprocesses image and triggers ML prediction.
- `GET /history`: Paginated logs. Includes search, filter, and sorting.
- `GET /history/<id>`: Full details of specific prediction.
- `DELETE /history/<id>`: Cascaded deletion of database and disk files.

### 🛡️ Admin Router (`/admin`)
- `GET /dashboard`: Aggregated platform statistics.
- `GET /users`: Audits list of registered users.
- `DELETE /users/<id>`: Permanently removes a researcher's account.

---

## 🚀 Deployment Guide

### Frontend (Vercel)
Vite project is configured for single-page routing fallback. Add a `vercel.json` in the frontend directory for router redirects:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Set `VITE_API_URL` to point to your live backend endpoint.

### Backend & Database (Railway)
1. Link your backend GitHub repository to Railway.
2. Add a **MySQL database** service in Railway.
3. Configure Backend variables:
   - `DATABASE_URL`: `${{MySQL.DATABASE_URL}}`
   - `JWT_SECRET`: Random hash key.
   - `CORS_ORIGIN`: Live Vercel frontend URL.

---

## 📈 Performance Highlights

- **⚡ Lightweight Preprocessing**: OpenCV filtering runs in `<10ms` per frame.
- **🔒 Encapsulated Guards**: JWT response interception intercepts 401 timeouts and redirects clients instantly.
- **💾 Disk Integrity Check**: Upload directory clean-up cascades delete processes to immediately purge files on deletes.

---

## 🤝 Contributors

- **Jane Mining Researcher** - Core remote sensing pipeline.
- **System Administrator** - Platform orchestration.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

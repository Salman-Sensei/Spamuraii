# 🥷 Spamurai ( AI Powered Spam & Phishing Detector )

*Detect spam and phishing like a ninja!*

**Spamurai** is a full-stack machine learning app that classifies emails as **Spam**, **Ham**, or **Phishing**.  
Built with **Scikit-learn**, **React**, and **Flask**, it can run **offline** or connect securely to your Gmail inbox.

---

## 🚀 Key Features

### 🔐 Gmail Integration
- Secure **Google OAuth 2.0 login**
- Fetch Gmail emails with configurable limits
- Automatic **spam prediction** with probability scores

### 🤖 AI-Powered Classification
- **Scikit-learn ML Pipeline:** `TfidfVectorizer → LogisticRegression`
- **URL Guard Model:** Separate ML model for URL risk analysis
- **Outputs:**
  - Spam & Ham probability
  - Phishing indicators
  - URL risk analysis (Low/Medium/High)
  - Highlighted suspicious URLs

### 🧪 Offline Mode
- Paste any email or text to get:
  - Spam & Ham scores
  - URL risk analysis
  - Keyword risk detection
- Analyze individual URLs for malicious content

### 📦 PDF Report Export
- Generates a professional PDF with:
  - Classification results
  - Risk analysis
  - Keyword summary
  - Suspicious URLs
  - Email statistics

### 🧰 Full-Stack Power
- **React frontend** with modern UI
- **Flask backend** with RESTful API
- Centralized ML models: `spam_model.joblib` and `url_guard_pipeline.joblib`
- Clean, well-documented **API endpoints**

---

## 🧩 System Requirements

### Backend
- **Python 3.9+** (3.9.6 or higher recommended)
- **pip** (Python package manager)
- **Virtual environment** (venv) - will be created automatically

### Frontend
- **Node.js 14+** (v24.11.1 recommended)
- **npm** (Node package manager)

### Required Files
- `backend/models/spam_model.joblib` - Email classification model
- `backend/models/url_guard_pipeline.joblib` - URL risk analysis model
- `backend/client_secret.json` - Google OAuth credentials (for Gmail integration)

---

## 🔧 Setup & Installation

### Quick Start (Recommended)

The easiest way to get started:

1. **Backend Setup** (Auto-installs requirements)
   ```bash
   cd backend
   python app.py
   ```
   The script will automatically:
   - Create a virtual environment if it doesn't exist
   - Install all required Python packages from `requirements.txt`
   - Start the Flask server on port 5001

2. **Frontend Setup** (Auto-installs dependencies)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   `npm install` will automatically install all dependencies from `package.json`
   The frontend will start on http://localhost:3000

**That's it!** The application will be running and ready to use.

### Alternative: Using Setup Scripts

#### Backend Setup Script (macOS/Linux)
```bash
cd backend
chmod +x setup.sh
./setup.sh
python app.py
```

#### Backend Setup Script (Windows)
```bash
cd backend
setup.bat
python app.py
```

### Manual Setup (If Needed)

#### Backend Manual Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

The backend will run on **http://localhost:5001**

#### Frontend Manual Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on **http://localhost:3000**

---

## 🔑 Google OAuth Setup (For Gmail Integration)

To enable Gmail integration, you need to set up Google OAuth credentials:

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Gmail API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:5001/oauth2callback`
   - Download the credentials JSON file

4. **Place Credentials**
   - Rename the downloaded file to `client_secret.json`
   - Place it in the `/backend` directory

**Note:** Gmail integration is optional. You can still use the app in offline mode to analyze emails and URLs without Gmail access.

---

## 🎯 ML Model Details

- **Email Classification Model:** `spam_model.joblib`
  - Trained with Scikit-learn 1.6.1
  - Uses TF-IDF vectorization and Logistic Regression
  - Predicts Spam probability, Ham probability, and Phishing indicators

- **URL Risk Analysis Model:** `url_guard_pipeline.joblib`
  - Analyzes URLs for malicious content
  - Classifies URLs as benign, suspicious, or malicious
  - Provides risk levels: Low, Medium, High

Both models are loaded automatically when the server starts.

---

## 📡 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth login
- `GET /oauth2callback` - OAuth callback handler
- `GET /api/auth/status` - Check authentication status
- `GET /api/user` - Get authenticated user information
- `POST /api/logout` - Logout user

### Email Analysis
- `GET /api/emails?limit=N` - Fetch Gmail emails (requires authentication)
- `POST /predict` - Analyze email text (offline mode)
  ```json
  {
    "message": "Email content here..."
  }
  ```

### URL Analysis
- `POST /api/url_offline` - Analyze URL for risks
  ```json
  {
    "url": "https://example.com"
  }
  ```

### Reports
- `POST /api/report` - Generate analysis report
- `POST /api/export_pdf` - Export report as PDF

---

## 🚀 Running the Project

### Start Backend
```bash
cd backend
python app.py
```

**Backend URL:** http://localhost:5001

### Start Frontend
```bash
cd frontend
npm start
```

**Frontend URL:** http://localhost:3000

### Using the Application

1. **Open your browser** and navigate to http://localhost:3000
2. **For Gmail Integration:**
   - Click "Get Started" or "Login with Google"
   - Authorize the application
   - Fetch and analyze your Gmail emails
3. **For Offline Analysis:**
   - Use the "Email Analysis" tab to paste email content
   - Use the "URL Analysis" tab to analyze individual URLs
   - Get instant spam and phishing risk assessments

---

## 📦 Project Structure

```
Spamuraii-main 2/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # ML model files
│   │   ├── spam_model.joblib
│   │   └── url_guard_pipeline.joblib
│   ├── utils/                 # Utility modules
│   │   ├── preprocess.py
│   │   ├── phishing.py
│   │   ├── url_guard.py
│   │   └── url_features.py
│   ├── offline_mode.py        # Offline email analysis
│   ├── report_utils.py        # Report generation
│   ├── pdf_export.py          # PDF export functionality
│   └── client_secret.json     # Google OAuth credentials (not in repo)
│
└── frontend/
    ├── package.json           # Node.js dependencies
    ├── src/
    │   ├── App.js             # Main React component
    │   ├── api.js             # API client
    │   └── components/        # React components
    └── public/                 # Static files
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'flask'`
- **Solution:** The app will auto-install requirements. If it fails, run manually:
  ```bash
  cd backend
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  ```

**Problem:** `WARNING: models/spam_model.joblib not found`
- **Solution:** Ensure model files are in `/backend/models/` directory

**Problem:** Port 5001 already in use
- **Solution:** Change the port in `app.py` (line with `app.run(port=5001)`)

### Frontend Issues

**Problem:** `npm install` fails
- **Solution:** 
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```

**Problem:** Frontend can't connect to backend
- **Solution:** Ensure backend is running on port 5001 and check `frontend/src/api.js` has correct `API_BASE` URL

### OAuth Issues

**Problem:** OAuth redirect fails
- **Solution:** Verify `client_secret.json` is in `/backend` and redirect URI matches Google Cloud Console settings

---

## 🌍 Deployment

### Backend Deployment
- **Render, Heroku, or Railway:** Deploy Flask app
- Update CORS origins in `app.py` to include production domain
- Set environment variables for production secrets

### Frontend Deployment
- **Vercel, Netlify, or GitHub Pages:** Deploy React app
- Update `API_BASE` in `frontend/src/api.js` to production backend URL
- Build command: `npm run build`

---

## 📄 License

MIT License. Free to use, modify, and distribute.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue on the repository or mail skbkhan31@gmail.com.

---

**Made with ❤️ for spam and phishing detection**

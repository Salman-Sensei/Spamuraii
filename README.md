# 🥷 Spamurai ( AI Powered Spam & Phishing Detector )

*Detect spam and phishing like a ninja!*

**Spamurai** is a full-stack machine learning app that classifies emails as **Spam**, **Ham**, or **Phishing**.  
Built with **Scikit-learn**, **React**, and **Flask**, it can run **offline** or connect securely to your Gmail inbox.

---

## 🚀 Key Features

### 🔐 Gmail Integration
- Secure **Google OAuth 2.0 login**
- Fetch the **last 10 Gmail emails**
- Automatic **spam prediction** with probability scores

### 🤖 AI-Powered Classification
- **Scikit-learn ML Pipeline:** `TfidfVectorizer → LogisticRegression`
- **Outputs:**
  - Spam & Ham probability
  - Phishing indicators
  - Highlighted suspicious URLs

### 🧪 Offline Mode
- Paste any email or text to get:
  - Spam & Ham scores
  - URL risk analysis
  - Keyword risk detection

### 📦 PDF Report Export
- Generates a professional PDF with:
  - Classification results
  - Risk analysis
  - Keyword summary
  - Suspicious URLs
  - Email statistics

### 🧰 Full-Stack Power
- **React frontend**
- **Flask backend**
- Centralized ML model: `spam_model.joblib`
- Clean, well-documented **API endpoints**

## 🧩 System Requirements (Verified)
### Backend
- Python 3.11.0
- pip 22.3
- scikit-learn 1.6.1
- Flask backend dependencies via: `pip install -r requirements.txt`
### Frontend
- Node v24.11.1
- npm 11.6.2
- React app dependencies via: `npm install`
### Tools
- Git 2.51.2.windows.1


    
## 🔧 Running the Project Locally


### 1️⃣ Backend Setup
Run the following commands in your terminal:

- cd backend
- python -m venv venv
- .\venv\Scripts\activate
- pip install -r requirements.txt
- python app.py


Backend URL: http://localhost:5000


## 🔑 Google OAuth Setup
Create credentials at: https://console.cloud.google.com/  
Authorized JavaScript Origins: http://localhost:3000  
Authorized Redirect URIs: http://localhost:5000/oauth2callback  
Place your client secrets JSON in `/backend`.

## 🎯 ML Model Details
Model trained with Scikit-learn 1.6.1, TF-IDF vectorization, Logistic Regression. Exported as `models/spam_model.joblib`. Predicts Spam probability, Ham probability, Phishing indicators (keywords + URLs).


## 📦 Export PDF
PDF contains prediction results, keyword analysis, suspicious links, spam insights, timestamp.

## 🌍 Deployment
Backend can run on  Render 
Frontend can run on Vercel, Netlify


## 📄 License
MIT License. Feel free to use, modify, and distribute.

# 🌐 MedVault – Patient-Centric Electronic Health Record (EHR) System

MedVault solves the problem of disorganized and inaccessible health records by empowering patients to centrally *manage*, *organize*, and *securely share* their medical data. The system includes an automated *prescription parser* that extracts and structures prescription details, provides *temporary access privileges* for healthcare providers, integrates *emergency response features*, offers *intelligent assistance*, and enables streamlined *QR/OTP-based sharing* for seamless and controlled access.


---

## 🚨 Problem Statement
Patients often visit multiple hospitals, causing medical records to become **scattered, lost, or duplicated**, leading to repeated tests and increased chances of misdiagnosis.

---

## ✅ Solution
A secure, portable, **patient-controlled EHR system** that:

- Centralizes all medical documents  
- Uploads & organizes reports  
- Reads prescriptions automatically using AI  
- Shares records with doctors using **QR/OTP temporary access**  
- Supports emergencies with a **location-based hospital finder**

---

## ⭐ Features

### 📄 1. Prescription Parser (AI/OCR)
- Supports multiple prescriptions  
- Extracts medicines, dosage, doctor name, and date  
- Automatically generates structured summaries

### 🚑 2. Emergency & Locator Mode
- One-tap emergency card  
- Finds nearby hospitals/doctors (Maps API)

### 🤖 3. Smart Health Chatbot
- Answers common health questions  
- Provides basic medical guidance

### 🗄 4. Patient-Owned Health Vault
Upload & organize:
- Reports  
- Prescriptions  
- Scans  
- Bills  

Your own **secure medical library**.

### ⚡ 5. Instant Sharing (QR/OTP)
- Generate time-limited QR codes  
- Doctor scans → gets temporary access  
- Access logs stored for transparency  

### 📊 6. Reports Dashboard
- View / Upload / Delete reports  
- Search & filter by category  
- PDF/Image preview modal

---

## 🛠 Tech Stack

### 🎨 Frontend
- HTML  
- CSS  
- JavaScript  

### 🧠 Backend
- Node.js  
- Express.js  
- EJS Template Engine  
- Passport.js  
- JWT Authentication  
- Flash.js  
- QR/OTP Module  

### 📦 File Processing
- multer.js (file upload)  
- sharp.js (image compression & optimization)

### 🧬 AI / OCR
- PDF Parser  
- OCR Model (prescription extraction)

### 🗄 Database
- MongoDB  
- MongoDB Atlas  
- Mongoose ORM  

### ☁️ Optional Storage
- Firebase Storage / AWS S3  

---

## 🚀 Server Setup

Follow these steps to run the backend server locally:

---

### 1️⃣ Clone the Repository

sh
git clone https://github.com/yourusername/AVISHKAAR.git
cd AVISHKAAR


### 2️⃣ Install All Dependencies
npm install

### 3️⃣ Create a .env File

Add the following to .env:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret


⚠️ Do NOT upload .env to GitHub.

### 4️⃣ Start the Server
node app.js


or (if using nodemon):

nodemon app.js

### 5️⃣ Open in Browser
http://localhost:3000


Your backend server will now be running successfully.

---

## 🧱 System Architecture (High Level)

**Workflow Summary**
1. Patient logs in (JWT Auth)  
2. Uploads report (PDF/Image)  
3. `multer` handles upload  
4. `sharp` compresses image  
5. AI/OCR extracts prescription text  
6. MongoDB Atlas stores data  
7. Patient organizes reports in vault  
8. Patient generates QR/OTP  
9. Doctor scans QR → temporary access  
10. Access logs maintained  



---
## 🧭 Future Enhancements

- **AI Symptom Checker** – Predicts possible health conditions based on symptoms.
- **Offline Emergency Card** – Accessible without internet for quick response.
- **Hospital–Patient Realtime Sync** – Live sync of reports & prescriptions.
- **Multi-language OCR** – Extracts text from prescriptions in multiple languages.
- **Health Insights Dashboard** – Analytics on past health history and trends.

---

## 📜 License

**MIT License** — free to use, modify, and distribute.

---

## 🤝 Contributors

**Team Avishkaar – Hackathon Project**

- Abhirup Nandi  
- Sonam Das  
- Aryan Roy  
- Ankur Pal

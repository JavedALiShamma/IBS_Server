# 📍 Geo-Fencing Attendance Application

A mobile-based attendance management system designed for organizations and government field staff, enabling location-restricted attendance with live photo verification. The application ensures accountability, authenticity, and real-time monitoring of attendance records.

---

## 🚀 Key Features

- 📌 Geo-Fencing Attendance  
  Attendance allowed only within predefined geographic boundaries to prevent fake or remote check-ins.

- 📸 Live Photo Capture  
  Mandatory real-time photo capture during attendance to avoid proxy marking.

- 📍 GPS Location Tracking  
  Captures latitude, longitude, and timestamp during attendance.

- 🔐 Secure Authentication  
  User authentication with backend APIs and role-based access.

- 📊 Admin Monitoring  
  Attendance records viewable with photo, location, and date filters.

- 🗂 Centralized Data Storage  
  Secure and scalable database design for long-term usage.

---

## 🏗 Tech Stack

Mobile Application  
- React Native (Expo)  
- JavaScript (ES6+)  
- Expo Camera  
- Expo Location  

Backend  
- Node.js  
- Express.js  
- REST APIs  
- JWT Authentication  

Database  
- MongoDB  
- Mongoose  

Tools & Deployment  
- Expo CLI  
- Git & GitHub  
- Environment Variables (.env)  

---

## 🧠 System Workflow

1. User logs into the mobile application  
2. Application checks GPS location against predefined geo-fence  
3. If location is valid:  
   - Live photo is captured  
   - Attendance is marked with user ID, timestamp, GPS coordinates, and image  
4. Backend validates and stores attendance data  
5. Admin can view attendance records and reports  

---

## 📁 Project Structure

attendance-app/
├── mobile-app/
│   ├── components/
│   ├── screens/
│   ├── services/
│   └── App.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
└── README.md

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- Expo CLI
- MongoDB (local or cloud)
- Android device or emulator

### 1. Clone Repository

git clone https://github.com/JavedALiShamma/Attendance-App-GeoFencing.git  
cd Attendance-App-GeoFencing

### 2. Backend Setup

cd backend  
npm install  

Create `.env` file:

PORT=5000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  

Run backend:

npm start

### 3. Mobile App Setup

cd mobile-app  
npm install  
expo start  

Scan QR using Expo Go or run on emulator.

---

## 🔐 Security Considerations

- Attendance allowed only within geo-fenced locations  
- Live photo capture ensures identity verification  
- Secure APIs with authentication  
- Sensitive data handled using environment variables  

---

## 🏛 Use Cases

- Government field staff attendance  
- Municipal & civic body employees  
- Construction site workforce tracking  
- Location-based staff monitoring  

---

## 👨‍💻 My Role

- Designed complete system architecture  
- Developed mobile app using React Native (Expo)  
- Implemented geo-fencing and live photo capture  
- Built backend APIs and database schema  
- Integrated authentication and attendance validation logic  

---

## 📌 Future Enhancements

- Offline attendance with sync  
- Face recognition integration  
- Attendance analytics dashboard  
- PDF / Excel report export  
- Multi-location geo-fencing  

---

## 📄 License

This project is intended for demonstration and professional portfolio use.  
Commercial or government deployment may require customization and compliance.

---

## 📬 Contact

Javed Ali Shamma  
Email: javedshamma@gmail.com  
GitHub: https://github.com/JavedALiShamma

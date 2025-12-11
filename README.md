# Job Searcher (JobBoard)

An advanced full-stack job search and recruitment platform designed to connect employers with job seekers. This project features a modern React frontend, a robust Node.js backend with web scraping capabilities, and an integrated Python-based resume parser.

## 🚀 Key Features

### 🌟 Core Functionality
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for **Admins**, **Employers**, and **Employees** (Job Seekers).
- **Authentication**: Secure JWT-based authentication with cookie support.

### 🔍 Job Aggregation
- **Intelligent Scraping**: Automated scrapers for **LinkedIn** and **Naukri.com** to aggregate job listings directly into the platform.
- **Advanced Search**: Filter and search jobs by various criteria.

### 📄 Resume Parsing
- **Python Integration**: Specialized Python script (`resume.py`) to parse resumes and extract skills against a comprehensive skill database (`skill_db_relax_20.json`).

### ⚡ Performance & Security
- **Queue Management**: Uses **Bull** and **Redis** for handling background tasks and job queues.
- **Rate Limiting**: Protects APIs using `express-rate-limit` backed by Redis.
- **Security**: Implements `helmet` for header security and `bcrypt` for password hashing.
- **Validation**: Strict data validation using **Zod**.

---

## 🛠️ Technology Stack

### **Frontend (Client)**
- **Framework**: React (Vite)
- **Styling**: TailwindCSS
- **State Management**: Recoil, Recoil-persist
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios

### **Backend (Server)**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma (PostgreSQL recommended)
- **Caching & Queues**: Redis, Bull
- **Web Scraping**: Puppeteer (with Stealth plugin & Adblocker)
- **Validation**: Zod
- **Security**: Helmet, BCrypt, JWT

### **Resume Parser**
- **Language**: Python
- **Data**: JSON-based skill database

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- Redis Server (Running)
- PostgreSQL Database

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Job_searcher
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

**Environment Variables**:
Create a `.env` file in the `server` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/jobsearcher"
JWT_SECRET="your_jwt_secret"
REDIS_URL="redis://localhost:6379"
PORT=3000
```

**Database Migration**:
```bash
npx prisma generate
npx prisma db push
```

**Start Server**:
```bash
npm start
```

### 3. Frontend Setup
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

**Start Client**:
```bash
npm run dev
```

### 4. Resume Parser Setup
Ensure you have Python installed. Install any required libraries (if applicable, e.g., `json`, `sys`).
The parser is located in the `resume-parser` directory and is typically invoked by the backend.

---

## 🏃‍♂️ Running Scrapers
The server includes scripts to scrape job boards manually if needed:

- **LinkedIn**: `npm run scrapeLinkedin`
- **Naukri**: `npm run scrapeNaukri`

---

## 📂 Project Structure

```
Job_searcher/
├── client/          # Vite + React Frontend
│   ├── src/
│   │   ├── Pages/       # Application Routes/Pages
│   │   ├── Components/  # Reusable UI Components
│   │   └── ...
├── server/          # Node.js + Express Backend
│   ├── src/
│   │   ├── scrapers/    # Puppeteer Scrapers
│   │   ├── services/    # Business Logic
│   │   └── ...
│   └── prisma/      # Database Schema
├── resume-parser/   # Python Resume Parsing Logic
└── README.md        # Project Documentation
```

## 📜 License
This project is licensed under the ISC License.

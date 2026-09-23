# Secure Note-Taking Platform - Backend REST API

A production-grade, secure RESTful API built with **Node.js, Express, TypeScript, and MongoDB (via Mongoose)**, engineered to demonstrate clean architectural principles (**SOLID** and **DRY**), Role-Based Access Control (**RBAC**), and high-performance **MongoDB database indexing and aggregation pipelines**.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+ / v20+) | Asynchronous JavaScript runtime |
| **Language** | TypeScript | Strict compile-time typing and data contracts |
| **Framework** | Express.js | Minimalist, unopinionated REST API framework |
| **Database & ODM** | MongoDB + Mongoose | Document database with explicit `schema.index()` optimization |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | Stateless Bearer token authentication |
| **Password Hashing** | `bcryptjs` | Salted one-way hashing for secure password storage |
| **Architecture** | SOLID Service-Controller Pattern | Separation of concerns, testability, and maintainability |

---

## 💻 Step-by-Step Instructions: Clone to Local Run

Follow these steps to clone the repository and run the backend server on your local computer.

### Prerequisites
Ensure you have installed on your computer:
1. **Node.js** (v18.x or v20.x or higher) — [Download Node.js](https://nodejs.org/)
2. **Git** — [Download Git](https://git-scm.com/)

---

### Step 1: Clone the GitHub Repository
Open your terminal (PowerShell, Command Prompt, or Terminal) and run:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd care_guide
```
*(Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your actual repository URL)*

---

### Step 2: Navigate to the Backend Directory
```bash
cd backend
```

---

### Step 3: Install Dependencies
```bash
npm install
```

---

### Step 4: Configure Environment Variables
A `.env` file is already included. If you need to verify or recreate it, create a file named `.env` inside the `backend/` directory with the following content:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xstnmhg.mongodb.net/notes?retryWrites=true&w=majority
JWT_SECRET=<jwt_secret>
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
---

### Step 5: Start the Backend Server

```bash
# Start in development mode with hot-reloading:
npm run dev

# Or build TypeScript and start production server:
npm run build
npm start
```

---

### Step 6: Verify Backend is Running

The API is now running live at: **`http://localhost:5000`**

---

## 🔑 Demo Seed Accounts

The database automatically seeds on first launch:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@mail.com` | `password` | Manage users, view all notes across all users, test aggregations |
| **Standard User** | `user@mail.com` | `password` | Manage personal notes only (RBAC restricted) |
| **User 2** | `avilash@mail.com` | `password` | Additional user profile with unique interests |

---

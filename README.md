# 🏋️ FitTrack – Full Stack Fitness & Workout Tracker

A modern, responsive, full-stack fitness and workout tracking web application built with **HTML5, CSS3, JavaScript, Node.js, Express.js, and MongoDB with Mongoose**.

FitTrack enables users to log their workouts, monitor daily and weekly exercise duration, track calories burned, set weekly workout targets, and visualize fitness trends through dynamic **Chart.js** charts.

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Authorization
- Secure user registration and login.
- Password hashing with **bcryptjs** (salt rounds: 10).
- Session security using **JSON Web Tokens (JWT)** and HTTP-Only cookies.
- Protected REST API endpoints ensuring users access **only their own** workouts and statistics.

### 2. 📊 Dynamic Dashboard & Real-Time Analytics
- Welcome greeting with user's name.
- Real-time statistics calculated directly from the MongoDB database:
  - **Total Workouts** completed.
  - **Total Duration** (in minutes and hours).
  - **Total Calories Burned** (kcal).
  - **Workouts Logged This Week**.
- **Weekly Workout Progress Chart** powered by Chart.js (daily duration bars + calories line graph).
- **Recent Workouts Section** displaying latest 5 logged sessions with quick details.
- **Weekly Goal Tracker** with an interactive visual progress bar and custom goal adjustment.

### 3. ➕ Add Workout
- Intuitive form to log workouts:
  - Workout Name (e.g. *Morning 5km Run*, *Leg Day Hypertrophy*, *Vinyasa Yoga*)
  - Workout Type: **Cardio, Strength, Running, Cycling, Yoga, Other**
  - Duration (in minutes)
  - Calories Burned (kcal)
  - Date (defaults to today)
  - Optional Notes / Reflections
- Full client-side and server-side data validation.
- Instant dashboard and history synchronization upon submission.

### 4. 📋 Workout History & Filtering
- Responsive table with custom badges and icons for each workout category.
- **Type Filter**: Filter instantly by Cardio, Strength, Running, Cycling, Yoga, or Other.
- **Date Range Filter**: Filter workouts by start and end dates.
- **Keyword Search**: Real-time debounce search through workout titles and notes.
- **Edit Workout**: Interactive modal to update any field of an existing workout.
- **Delete Workout**: Safe deletion with confirmation modal.
- Clean empty-state display when no workouts match filter criteria.

### 5. 📈 Analytics & Consistency
- Workout distribution breakdown doughnut chart.
- Target guidance and consistency recommendations.
- Interactive weekly goal customization modal (1 to 21 workouts/week).

### 6. 🎨 Modern Fitness Design
- Dark navy/charcoal background (`#0B0F19`, `#111827`) with vibrant lime green (`#10B981`) and energetic orange (`#F97316`) accents.
- Responsive layout crafted with pure Vanilla CSS (desktop, tablet, and mobile navigation).
- Database status health indicator (🟢 Connected / 🔴 Disconnected).
- Toast notification alerts for user actions and feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js, FontAwesome 6, Google Fonts (Plus Jakarta Sans) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Security** | bcryptjs, jsonwebtoken (JWT), cookie-parser, cors, dotenv |

---

## 📂 Project Structure

```
FSD Project/
├── client/                     # Frontend static assets
│   ├── css/
│   │   └── styles.css          # Design system & responsive layout styles
│   ├── js/
│   │   ├── api.js              # Centralized fetch wrapper & JWT management
│   │   ├── auth.js             # Sign in, registration, session management
│   │   ├── dashboard.js        # Analytics calculation, Chart.js graphs, goals
│   │   ├── workouts.js         # CRUD operations, modals, filtering & search
│   │   └── app.js              # App coordinator, routing, toast notifications
│   └── index.html              # Single Page Application HTML entry point
│
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── authController.js   # User registration, login, logout, profile & goal
│   │   ├── workoutController.js# Workout CRUD operations & query filtering
│   │   └── dashboardController.js # Database aggregations & chart data calculation
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification & request user attachment
│   │   ├── dbCheck.js          # Graceful MongoDB connection check
│   │   └── errorHandler.js     # Unified Mongoose & Express error responses
│   ├── models/
│   │   ├── User.js             # User Mongoose schema with bcrypt hashing
│   │   └── Workout.js          # Workout Mongoose schema with validation & indexes
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth & /api/users endpoints
│   │   ├── workoutRoutes.js    # /api/workouts endpoints
│   │   └── dashboardRoutes.js  # /api/dashboard endpoints
│   └── server.js               # Express application setup & static hosting
│
├── .env                        # Local environment variables (not in git)
├── .env.example                # Template for environment configuration
├── .gitignore                  # Git ignore rules for node_modules and .env
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Full documentation and setup guide
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher installed): [https://nodejs.org](https://nodejs.org)
- **MongoDB**: Either a local MongoDB Community Server installation or a free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

### Step 1: Clone or Navigate to the Project

```bash
cd "c:\Users\ACER\OneDrive\setu\FSD Project"
```

### Step 2: Install Dependencies

```bash
npm install
```

All required dependencies (`express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `nodemon`) will be installed automatically.

---

### Step 3: Configure Environment Variables

Create or review `.env` in the root folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fittrack
JWT_SECRET=fittrack_jwt_secret_key_change_in_production_12345
JWT_EXPIRE=7d
```

---

### Step 4: Configure MongoDB

FitTrack supports both **Local MongoDB** and **MongoDB Atlas (Cloud)**:

#### Option A: Local MongoDB (Community Server)
1. Download & install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service:
   - On Windows, open **Services** (`services.msc`) and start **MongoDB Server**.
   - Or run in terminal:
     ```bash
     net start MongoDB
     ```
3. Set your `.env`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/fittrack
   ```

#### Option B: MongoDB Atlas (Cloud Free Tier – Recommended for quick evaluation)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free M0 cluster.
2. Under **Database Access**, create a user with a password.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
4. Click **Connect** → **Drivers** → Copy your connection URI.
5. In `.env`, paste your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/fittrack?retryWrites=true&w=majority
   ```

---

### Step 5: Start the Application

To run with **automatic code reloading (Development mode)**:
```bash
npm run dev
```

To run in **standard Production mode**:
```bash
npm start
```

Once started, open your web browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 📡 REST API Reference

### Authentication Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Sign in (`email`, `password`) |
| `POST` | `/api/auth/logout` | Public | Log out and clear auth cookie |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/users/goal` | Private | Update user's weekly workout goal (`weeklyGoal`) |

### Workout Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/workouts` | Private | Create a new workout |
| `GET` | `/api/workouts` | Private | Get user workouts (filters: `type`, `startDate`, `endDate`, `search`) |
| `GET` | `/api/workouts/:id` | Private | Get single workout details |
| `PUT` | `/api/workouts/:id` | Private | Update an existing workout |
| `DELETE` | `/api/workouts/:id` | Private | Delete a workout |

### Dashboard & Analytics Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Private | Returns calculated totals, weekly duration/calories chart data, and recent logs |
| `GET` | `/api/health` | Public | Check server uptime and MongoDB connection state |

---

## 🧪 Sample API Payloads for Testing

### 1. Register User (`POST /api/auth/register`)
```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "password123"
}
```

### 2. Login User (`POST /api/auth/login`)
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```

### 3. Create Workout (`POST /api/workouts`)
*Header:* `Authorization: Bearer <your_jwt_token>`
```json
{
  "name": "Morning 5km Jog",
  "type": "Running",
  "duration": 35,
  "calories": 320,
  "date": "2026-10-25",
  "notes": "Paced at 6:40/km. Felt great!"
}
```

### 4. Update Workout (`PUT /api/workouts/:id`)
*Header:* `Authorization: Bearer <your_jwt_token>`
```json
{
  "name": "Morning 6km Jog (Extended)",
  "type": "Running",
  "duration": 42,
  "calories": 390,
  "date": "2026-10-25",
  "notes": "Pushed for an extra kilometer!"
}
```

### 5. Update Weekly Goal (`PUT /api/users/goal`)
*Header:* `Authorization: Bearer <your_jwt_token>`
```json
{
  "weeklyGoal": 6
}
```

---

## 💡 How to Test All Application Features

1. **Sign Up**:
   - Open `http://localhost:5000`.
   - Click the **Create Account** tab.
   - Enter your name, email, and password (at least 6 characters). Click **Create Free Account**.
2. **Dashboard Overview**:
   - Notice the personalized greeting displaying your name.
   - The stat cards display initial 0 counts computed dynamically from MongoDB.
   - Check the bottom sidebar status bar: it displays the database connection status.
3. **Log Workouts**:
   - Click **Add Workout** in the sidebar or header.
   - Enter a workout name (e.g. *Upper Body Strength*), select **Strength**, enter 45 minutes, 380 calories, pick a date, and click **Save Workout**.
   - Notice the green toast confirmation and instant redirect to the dashboard.
   - All stat cards and the **Weekly Workout Progress Chart** immediately reflect the new workout!
4. **Workout History & Filtering**:
   - Navigate to **Workout History**.
   - View your logged workout card/row with its category badge.
   - Try filtering by category (e.g. Strength vs Running) or typing a keyword into the search bar.
5. **Editing Workouts**:
   - Click the **Edit (pen)** icon next to any workout.
   - Change the duration or calories in the modal and click **Update Workout**.
   - The table and dashboard statistics immediately synchronize.
6. **Deleting Workouts**:
   - Click the **Delete (trash)** icon.
   - A confirmation dialog appears displaying the workout name. Click **Delete**.
   - The item is removed from the database and numbers update in real-time.
7. **Adjusting Weekly Goal**:
   - On the Dashboard, click **Change Goal** on the Weekly Goal banner.
   - Change the target number of workouts and save. The progress bar recalculates instantly.

---

## 👤 Author & GitHub

- **GitHub Profile:** [https://github.com/Roshini7788](https://github.com/Roshini7788)
- **Project:** FitTrack – Full Stack Fitness & Workout Tracker

# Envisense - IoT & AI Dashboard

This project is a real-time monitoring dashboard for the **Envisense** hardware node (ESP32). It visualizes environmental data, disaster predictions, and AI model outputs using a premium dark-mode UI.

## 🚀 Tech Stack
- **Frontend Framework:** React.js (via Vite)
- **Routing:** React Router v6
- **Styling:** `styled-components` for CSS-in-JS
- **Animations:** `framer-motion` for smooth, staggered card entrances and interactions
- **Backend/Database:** Firebase Realtime Database & Firebase Authentication
- **Icons:** `react-icons`

## 📂 Project Structure

```text
src/
├── components/          # Reusable UI elements
│   ├── Card.jsx         # Premium glassmorphism card with hover glow
│   ├── Grid.jsx         # Responsive grid layout wrapper
│   ├── Header.jsx       # Top navigation with live ESP32 status & logout
│   ├── Sidebar.jsx      # Left navigation menu (collapses on mobile)
│   ├── StatusBadge.jsx  # Glowing pill-shaped status indicator (SAFE, WARNING, DANGER)
│   └── ProtectedRoute.jsx # Auth guard for dashboard routes
│
├── context/
│   └── AuthContext.jsx  # Manages Firebase login state globally
│
├── hooks/
│   └── useFirebaseValue.js # Custom hook to fetch real-time data from Firebase nodes
│
├── pages/               # Main Application Views
│   ├── LoginPage.jsx             # Beautiful login screen with floating animations
│   ├── DashboardLayout.jsx       # Main shell (Header + Sidebar + Content area)
│   ├── DashboardHome.jsx         # Overview of system status and key sensor metrics
│   ├── DisasterMonitoring.jsx    # Flood, Fire, Heat, and Landslide data & AI predictions
│   ├── EnvironmentalMonitoring.jsx # Air & Water quality monitoring
│   ├── SensorData.jsx            # All raw live sensor values (MQ2, Accel, pH, etc.)
│   ├── AIMLMonitoring.jsx        # Dedicated view for all AI model predictions
│   ├── AlertSystem.jsx           # Unified view of all non-SAFE alerts
│   └── DeviceInfo.jsx            # ESP32 hardware status and uptime
│
├── theme/
│   ├── colors.js        # Centralized HSL color tokens (Teal/Navy dark theme)
│   ├── DesignTokens.js  # Spacing and typography variables
│   └── GlobalStyles.jsx # Global CSS resets, fonts, and custom scrollbars
│
├── firebase.js          # Firebase initialization & exports (db, auth)
├── App.jsx              # Main React Router setup
└── main.jsx             # React entry point
```

## ✨ Key Features & Data Flow

1. **Authentication:** 
   Users must log in via Firebase Auth. The `AuthContext` provides the session state, and `ProtectedRoute` ensures only logged-in users access `/dashboard`.

2. **Real-time Data Sync:**
   The `useFirebaseValue` hook connects to Firebase Realtime Database. As the ESP32 pushes new sensor readings or the AI backend pushes new predictions, the UI updates instantly without refreshing.

3. **Database Nodes Used:**
   - `/envisence/live/sensors`: Raw data (temperature, humidity, mq2, accel_x, etc.)
   - `/envisence/live/air_quality`: AI prediction & status for air
   - `/envisence/live/water_quality`: AI prediction & status for water
   - `/envisence/live/forest_fire`: AI prediction & status for fire
   - `/envisence/live/extreme_heat`: AI prediction & status for heat
   - `/envisence/live/flood`: Status for flooding
   - `/envisence/live/landslide`: Status for landslides
   - `/envisence/live/overall_status`: Global environment status (e.g., "WARNING")
   - `/envisence/live/device`: ESP32 `online` boolean and `last_update` timestamp

4. **Premium UI/UX:**
   - **Glassmorphism:** Cards have translucent backgrounds with backdrop-blur.
   - **Animations:** Pages use `framer-motion` to slide items in staggeringly.
   - **Responsive:** Sidebar moves to the bottom/top on mobile phones.
   - **Status Indicators:** Glowing dots and badges visually indicate danger levels instantly.

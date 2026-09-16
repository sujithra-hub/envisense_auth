# Envisense Detailed Features

The Envisense application is a dual-portal, real-time IoT monitoring system tailored for environmental safety and disaster prediction. Below is a detailed breakdown of the features available in the app, structured by its core modules.

## 1. Dual Portal System
The application serves two distinct user bases with tailored experiences:
- **Authority / Admin Dashboard:** Designed for system administrators and government officials. Provides raw technical data, node hardware management, incident resolution workflows, and detailed analytical reports.
- **Public Dashboard:** A consumer-facing interface focused on answering "Is my area safe?". It hides complex technical ESP32 data and instead shows easy-to-read safety statuses, nearby alerts, and simplified environmental data.

## 2. IoT Hardware & Node Management
- **ESP32 Firmware Integration:** Seamless real-time data streaming from physical ESP32 microcontrollers pushing data via Wi-Fi.
- **Live Hardware Telemetry:** Tracks exact device uptime, Wi-Fi RSSI, and instantly calculates exact "Last Updated" timestamps utilizing Firebase server time (preventing time-drift issues).
- **Auto Online/Offline Status:** Automatically detects when a sensor node drops offline and updates the UI gracefully (e.g. changing from "Just now" to "X minutes ago").
- **Node Configuration:** Admins can visually add, name, and geolocate new hardware nodes using an intuitive "Add Node" modal without touching code.

## 3. Real-Time AI & Disaster Monitoring
Driven by Edge AI and live sensor data, the platform monitors multiple risk vectors:
- **Forest Fire Prediction:** Uses temperature and MQ2 (Smoke/Gas) sensors to predict fire probability.
- **Flood Monitoring:** Analyzes ambient humidity and water level sensors.
- **Landslide Risk:** Combines soil moisture saturation and raw vibration/accelerometer data to predict ground stability.
- **Extreme Heat Warnings:** Continuously monitors temperature spikes against configurable thresholds.

## 4. Environmental & Quality Tracking
- **Air Quality (AQI):** Parses raw MQ2 gas readings into clear AQI safety levels (Safe, Warning, Critical).
- **Water Quality:** Uses pH and Turbidity sensors to determine water clarity and acidity.

## 5. Interactive Risk Maps
- **Real-Time Geolocation Plotting:** Sensor nodes are plotted onto an interactive map using their exact Latitude and Longitude.
- **Color-Coded Hazard Levels:** Map markers dynamically change color and pulse based on the real-time calculated risk level of that specific area.
- **Filtering:** Users can filter the map to only show specific hazards (e.g., only show "Fire Risks" or "Flood Risks").

## 6. Alert System & Incident Management
- **Unified Alerts Lifecycle:** Logs all non-SAFE alerts triggered by the AI engine. 
- **Incident Resolution:** Authorities can track the lifecycle of an alert (Active vs. Resolved) and manage emergency responses.
- **Public Safety Alerts:** Citizens get clear, human-readable emergency banners if an active alert is in their vicinity.

## 7. Premium UI / UX Architecture
- **Real-Time Sync:** Powered by Firebase Realtime Database. Any change in the physical world updates the screen instantly without needing a page refresh.
- **Glassmorphism & Dark Mode:** A sleek, modern, highly-polished aesthetic using semi-transparent cards and a deep teal/navy color palette.
- **Micro-Animations:** Fluid page transitions, staggered list entrances, and glowing status indicators powered by `framer-motion`.
- **Fully Responsive:** Adapts flawlessly from large desktop command centers to mobile phone screens.

## 8. Authentication & Security
- **Firebase Auth:** Secure login portal to protect the Authority Dashboard.
- **Protected Routes:** Unauthorized users are automatically redirected away from sensitive management pages.

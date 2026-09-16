#include <ArduinoJson.h>
#include <Firebase_ESP_Client.h>
#include <WiFi.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

/* 1. Define Wi-Fi credentials */
#define WIFI_SSID "TP-Link_4B80"

#define WIFI_PASSWORD "35740964"

/* 2. Define Firebase Data */
#define API_KEY "AIzaSyBeC0e4i47FW3_HWAnWPsQiIwKAkw2hW9c"
#define DATABASE_URL                                                           \
  "https://envisence-bda5d-default-rtdb.asia-southeast1.firebasedatabase.app"

/* 3. Define Device Info */
#define DEVICE_ID "ENVISENSE_001"
String deviceId = DEVICE_ID; // will be overridden by auto-detect
#define NODE_NAME "Forest Monitoring Node 1"
#define AREA_NAME "Forest Zone A"
#define LATITUDE 13.0827
#define LONGITUDE 80.2707
#define FIRMWARE_VERSION "1.0.0"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Timers
unsigned long sendDataPrevMillis = 0;
unsigned long historyPrevMillis = 0;
int count = 0;
bool signupOK = false;

// Simulated Sensor Data variables
float f_temp = 35.0, f_hum = 25.0;
int f_smoke = 100;
float eh_temp = 35.0, eh_hum = 25.0;
int ls_rain = 0, ls_soil = 30, ls_vib = 0;
int wq_ph = 7;

// Validation state
bool sensorsValid = true;
String sensorStatusTemp = "OK";
String sensorStatusHum = "OK";
String sensorStatusSmoke = "OK";
String sensorStatusSoil = "OK";

void setup() {
  Serial.begin(115200);

  // Connect to Wi‑Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi‑Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // Firebase configuration
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase sign up successful");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Initialize device info in the DB
  detectDeviceId();
  setupDeviceInfo();
}

void setupDeviceInfo() {
  if (Firebase.ready() && signupOK) {
    String basePath = String("/envisence/nodes/") + deviceId;
    FirebaseJson infoJson;
    infoJson.set("name", NODE_NAME);
    infoJson.set("area", AREA_NAME);
    infoJson.set("latitude", LATITUDE);
    infoJson.set("longitude", LONGITUDE);
    // Use push/update approach or just merge these fields. setJSON overwrites.
    // For setup, we can just update the top level keys.
    Firebase.RTDB.updateNode(&fbdo, basePath, &infoJson);
    Serial.println("Device info uploaded.");
  }

  // -------------------------------------------------
  // Auto‑detect first device ID under /envisence/nodes/
  // -------------------------------------------------
  void detectDeviceId() {
    if (Firebase.ready() && signupOK) {
      FirebaseJson json;
      if (Firebase.RTDB.getJSON(&fbdo, "/envisence/nodes", &json)) {
        FirebaseJsonData result;
        json.iteratorBegin();
        if (json.iteratorGetNext(result)) {
          deviceId = result.key.c_str();
          Serial.printf("[Auto‑detect] Using deviceId: %s\n", deviceId.c_str());
        }
        json.iteratorEnd();
      }
    }
  }
}

// Ensure Wi‑Fi stays connected
void maintainWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi‑Fi lost – reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("Reconnected!");
  }
}

// Basic sensor range validation
void validateSensors() {
  sensorsValid = true;
  sensorStatusTemp = "OK";
  sensorStatusHum = "OK";
  sensorStatusSmoke = "OK";
  sensorStatusSoil = "OK";

  if (f_temp < -50 || f_temp > 150) {
    sensorStatusTemp = "ERROR";
    sensorsValid = false;
    f_temp = 35.0;
  }
  if (f_hum < 0 || f_hum > 100) {
    sensorStatusHum = "ERROR";
    sensorsValid = false;
    f_hum = 25.0;
  }
  if (f_smoke < 0) {
    sensorStatusSmoke = "ERROR";
    sensorsValid = false;
    f_smoke = 0;
  }
  if (ls_soil < 0 || ls_soil > 100) {
    sensorStatusSoil = "ERROR";
    sensorsValid = false;
    ls_soil = 30;
  }
}

void loop() {
  maintainWiFi();
  unsigned long now = millis();

  // ---- Main telemetry (every 10 s) ----
  if (Firebase.ready() && signupOK &&
      (now - sendDataPrevMillis > 10000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = now;

    // ----- Mock scenario logic -----
    String f_pred = "safe", f_severity = "NORMAL";
    bool f_alert = false;
    int f_score = 15;
    float f_conf = 0.95;
    String eh_pred = "normal", eh_severity = "NORMAL";
    bool eh_alert = false;
    int eh_score = 10;
    float eh_conf = 0.90;
    String ls_pred = "stable", ls_severity = "NORMAL";
    bool ls_alert = false;
    int ls_score = 20;
    float ls_conf = 0.88;

    if (count % 4 == 1) {
      // Critical forest fire
      f_temp = 48.0;
      f_smoke = 4500;
      f_pred = "fire_imminent";
      f_severity = "CRITICAL";
      f_alert = true;
      f_score = 95;
      f_conf = 0.98;
      eh_temp = 38.0;
      eh_severity = "WATCH";
      eh_alert = true;
      eh_score = 55;
      eh_conf = 0.82;
    } else if (count % 4 == 2) {
      // Extreme heat warning
      f_temp = 38.0;
      f_smoke = 200;
      f_severity = "WATCH";
      f_alert = true;
      f_score = 45;
      f_conf = 0.85;
      eh_temp = 45.0;
      eh_hum = 15.0;
      eh_pred = "heat_wave";
      eh_severity = "WARNING";
      eh_alert = true;
      eh_score = 75;
      eh_conf = 0.92;
    } else if (count % 4 == 3) {
      // Landslide risk
      ls_rain = 80;
      ls_soil = 85;
      ls_vib = 40;
      ls_pred = "landslide_risk";
      ls_severity = "WARNING";
      ls_alert = true;
      ls_score = 70;
      ls_conf = 0.86;
    } else {
      // Normal safe condition
      f_temp = 32.0;
      f_smoke = 100;
      eh_temp = 32.0;
      eh_hum = 40.0;
      ls_rain = 0;
      ls_soil = 30;
      ls_vib = 0;
    }

    // Validate sensor readings before sending
    validateSensors();

    String timestamp =
        "TIMESTAMP_PLACEHOLDER"; // replace with NTP in production
    String basePath = String("/envisence/nodes/") + deviceId;

    // Update status and timestamp perfectly for the dashboard
    Firebase.RTDB.setBool(&fbdo, basePath + "/online", true);
    Firebase.RTDB.setTimestamp(&fbdo, basePath + "/last_update");

    // ----- Live data -----
    FirebaseJson liveJson;
    liveJson.set("temperature", f_temp);
    liveJson.set("humidity", f_hum);
    liveJson.set("mq2_raw", f_smoke);
    liveJson.set("soil_moisture_raw", ls_soil);
    liveJson.set("water_level", ls_rain);
    liveJson.set("vibration_raw", ls_vib);
    liveJson.set("ph_raw", wq_ph);
    Firebase.RTDB.setJSON(&fbdo, basePath + "/sensors", &liveJson);

    // ----- Module predictions -----
    FirebaseJson modulesJson;
    FirebaseJson ff;
    ff.set("prediction", f_pred);
    ff.set("severity", f_severity);
    ff.set("score", f_score);
    ff.set("confidence", f_conf);
    modulesJson.set("forest_fire", ff);

    FirebaseJson ehf;
    ehf.set("prediction", eh_pred);
    ehf.set("severity", eh_severity);
    ehf.set("score", eh_score);
    ehf.set("confidence", eh_conf);
    modulesJson.set("extreme_heat", ehf);

    FirebaseJson lsf;
    lsf.set("prediction", ls_pred);
    lsf.set("severity", ls_severity);
    lsf.set("score", ls_score);
    lsf.set("confidence", ls_conf);
    modulesJson.set("landslide", lsf);

    Firebase.RTDB.setJSON(&fbdo, basePath + "/predictions", &modulesJson);

    // ----- Device health -----
    FirebaseJson statusJson;
    statusJson.set("online", true);
    statusJson.set("uptime", (int)(now / 1000));
    statusJson.set("wifiRSSI", WiFi.RSSI());
    statusJson.set("firmwareVersion", FIRMWARE_VERSION);
    statusJson.set("lastSeen", timestamp);

    FirebaseJson sensorStat;
    sensorStat.set("temperature", sensorStatusTemp);
    sensorStat.set("humidity", sensorStatusHum);
    sensorStat.set("smoke", sensorStatusSmoke);
    sensorStat.set("soil", sensorStatusSoil);
    statusJson.set("sensorStatus", sensorStat);
    Firebase.RTDB.setJSON(&fbdo, basePath + "/deviceStatus", &statusJson);

    // ----- Alerts -----
    handleAlert("forest_fire", f_alert, f_pred, f_severity, timestamp);
    handleAlert("extreme_heat", eh_alert, eh_pred, eh_severity, timestamp);
    handleAlert("landslide", ls_alert, ls_pred, ls_severity, timestamp);

    count++;
  }

  // ---- History snapshots (every 60 s) ----
  if (Firebase.ready() && signupOK && (now - historyPrevMillis > 60000)) {
    historyPrevMillis = now;
    String histPath = String("/envisence/nodes/") + deviceId + "/history";
    FirebaseJson h;
    h.set("temperature", f_temp);
    h.set("humidity", f_hum);
    h.set("smoke", f_smoke);
    Firebase.RTDB.pushJSON(&fbdo, histPath.c_str(), &h);
    Serial.println("History snapshot recorded.");
  }
}

void handleAlert(String moduleName, bool isAlert, String prediction,
                 String severity, String timestamp) {
  String path =
      String("/envisence/nodes/") + deviceId + "/alerts/" + moduleName;
  if (isAlert) {
    FirebaseJson a;
    a.set("module", moduleName);
    a.set("prediction", prediction);
    a.set("severity", severity);
    a.set("timestamp", timestamp);
    a.set("status", "ACTIVE");
    Firebase.RTDB.setJSON(&fbdo, path.c_str(), &a);
  } else {
    Firebase.RTDB.setString(&fbdo, path + "/status", "RESOLVED");
  }
}

import machine
from machine import Pin
import time
import network
import urequests # Standard MicroPython library for HTTP requests

# -----------------------------
# CONFIG: Pins & Network
# -----------------------------
# Replace with your actual credentials
WIFI_SSID = "YOUR_SSID"
WIFI_PASSWORD = "YOUR_PASSWORD"
# Your backend endpoint that returns: {"type": "A+", "alert": "normal"}
API_URL = "https://your-backend-url.com/api/get-status" 

BLOOD_LEDS = {
    "A+": Pin(2, Pin.OUT),
    "A-": Pin(4, Pin.OUT),
    "B+": Pin(5, Pin.OUT),
    "B-": Pin(18, Pin.OUT),
    "AB+": Pin(19, Pin.OUT),
    "AB-": Pin(21, Pin.OUT),
    "O+": Pin(22, Pin.OUT),
    "O-": Pin(23, Pin.OUT),
}

# -----------------------------
# CORE FUNCTIONS
# -----------------------------
def reset_all():
    for led in BLOOD_LEDS.values():
        led.off()

def alert_blood(blood_type, duration=5):
    reset_all()
    if blood_type in BLOOD_LEDS:
        led = BLOOD_LEDS[blood_type]
        for _ in range(duration * 2):
            led.on()
            time.sleep(0.5)
            led.off()
            time.sleep(0.5)

def critical_alert(blood_type):
    reset_all()
    if blood_type in BLOOD_LEDS:
        led = BLOOD_LEDS[blood_type]
        for _ in range(20):
            led.on()
            time.sleep(0.1)
            led.off()
            time.sleep(0.1)

# -----------------------------
# IOT CONNECTION
# -----------------------------
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        while not wlan.isconnected():
            time.sleep(1)
    print("Connected to Wi-Fi")

def check_backend():
    try:
        response = urequests.get(API_URL)
        data = response.json()
        response.close()
        
        # Mapping response to alert logic
        # Example JSON: {"type": "A+", "alert": "critical"}
        b_type = data.get("type")
        mode = data.get("alert")
        
        if mode == "critical":
            critical_alert(b_type)
        elif mode == "normal":
            alert_blood(b_type)
        else:
            reset_all()
            
    except Exception as e:
        print("Backend unreachable:", e)
        reset_all()

# -----------------------------
# MAIN LOOP
# -----------------------------
connect_wifi()
while True:
    check_backend()
    time.sleep(2) # Polling interval
# will be added ESP32 and Alerts once we will have the Componentsfrom machine import Pin
import time

# -----------------------------
# CONFIG: Blood type → GPIO
# -----------------------------
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
    """Turn off all LEDs"""
    for led in BLOOD_LEDS.values():
        led.off()

def alert_blood(blood_type, duration=5):
    """
    Activate LED for a specific blood type
    """
    reset_all()
    
    if blood_type in BLOOD_LEDS:
        led = BLOOD_LEDS[blood_type]
        
        # Blink alert (attention mode)
        for _ in range(duration * 2):
            led.on()
            time.sleep(0.5)
            led.off()
            time.sleep(0.5)
    else:
        print("Invalid blood type")

def critical_alert(blood_type):
    """
    Critical shortage → fast blinking
    """
    reset_all()
    
    if blood_type in BLOOD_LEDS:
        led = BLOOD_LEDS[blood_type]
        
        for _ in range(20):
            led.on()
            time.sleep(0.1)
            led.off()
            time.sleep(0.1)

# -----------------------------
# DEMO LOOP
# -----------------------------
while True:
    # Example sequence
    alert_blood("A+")
    time.sleep(2)
    
    alert_blood("O-")
    time.sleep(2)
    
    critical_alert("AB-")
    time.sleep(3)

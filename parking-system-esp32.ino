// Parking system with 6 spots using ESP32
// Each spot has 1 IR sensor, 1 green LED, and 1 red LED

const int TOTAL_SPOTS = 6;

// IR sensor pins
const int sensorPins[TOTAL_SPOTS] = {
  13, 14, 27, 26, 25, 33
};

// Green LED pins - free spot
const int greenLedPins[TOTAL_SPOTS] = {
  4, 16, 17, 18, 19, 21
};

// Red LED pins - occupied spot
const int redLedPins[TOTAL_SPOTS] = {
  5, 22, 23, 32, 2, 15
};

// Most IR sensors return LOW when detecting an object
const bool SENSOR_ACTIVE_LOW = true;

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < TOTAL_SPOTS; i++) {
    pinMode(sensorPins[i], INPUT);
    pinMode(greenLedPins[i], OUTPUT);
    pinMode(redLedPins[i], OUTPUT);

    digitalWrite(greenLedPins[i], LOW);
    digitalWrite(redLedPins[i], LOW);
  }

  Serial.println("Sistema de estacionamento iniciado!");
}

void loop() {
  int freeSpots = 0;
  int occupiedSpots = 0;

  Serial.println("====== STATUS DAS VAGAS ======");

  for (int i = 0; i < TOTAL_SPOTS; i++) {
    int sensorValue = digitalRead(sensorPins[i]);

    bool isOccupied;

    if (SENSOR_ACTIVE_LOW) {
      isOccupied = sensorValue == LOW;
    } else {
      isOccupied = sensorValue == HIGH;
    }

    if (isOccupied) {
      occupiedSpots++;

      digitalWrite(greenLedPins[i], LOW);
      digitalWrite(redLedPins[i], HIGH);

      Serial.print("Vaga ");
      Serial.print(i + 1);
      Serial.println(": Ocupada");
    } else {
      freeSpots++;

      digitalWrite(greenLedPins[i], HIGH);
      digitalWrite(redLedPins[i], LOW);

      Serial.print("Vaga ");
      Serial.print(i + 1);
      Serial.println(": Livre");
    }
  }

  Serial.println("------------------------------");
  Serial.print("Vagas livres: ");
  Serial.println(freeSpots);

  Serial.print("Vagas ocupadas: ");
  Serial.println(occupiedSpots);

  Serial.println("==============================");
  Serial.println();

  delay(1000);
}
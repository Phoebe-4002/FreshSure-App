import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const [step, setStep] = useState("fish");
  const [fish, setFish] = useState("");
  const [feature, setFeature] = useState("");
  const [result, setResult] = useState("");
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);

  // Ask camera permission
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Fake AI result for now
  const handleScan = async () => {
    setResult(""); // clear old result first

    // Later you will use this:
    if (feature === "Eyes & Skin") {
      // TODO: call Eyes & Skin model API here
      // Example:
      // const response = await fetch("http://your-api/eyes-skin", {...})
    }

    if (feature === "Gills") {
      // TODO: call Gills model API here
      // Example:
      // const response = await fetch("http://your-api/gills", {...})
    }

    // Temporary fake result (for prototype/testing only)
    const fake = Math.random() > 0.5 ? "FRESH" : "NOT FRESH";
    setResult(fake);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/ocean.jpg")}
      style={styles.screen}
      resizeMode="cover"
    >
      <View style={styles.card}>
        <Text style={styles.title}>FreshSure</Text>

        {/* STEP 1: Fish */}
        {step === "fish" && (
          <>
            <Text style={styles.subtitle}>Select Fish Type</Text>
            {["Bangus", "Tilapia", "Sardines"].map((f) => (
              <TouchableOpacity
                key={f}
                style={styles.button}
                onPress={() => {
                  setFish(f);
                  setStep("feature");
                }}
              >
                <Text style={styles.buttonText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 2: Feature */}
        {step === "feature" && (
          <>
            <Text style={styles.subtitle}>Fish: {fish}</Text>
            <Text style={styles.subtitle}>Select Feature</Text>

            {["Eyes & Skin", "Gills"].map((f) => (
              <TouchableOpacity
                key={f}
                style={styles.button}
                onPress={() => {
                  setFeature(f);
                  setStep("scan");
                }}
              >
                <Text style={styles.buttonText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 3: CAMERA + RESULT BELOW */}
        {step === "scan" && (
          <>
            <Text style={styles.subtitle}>
              Scanning {feature} of {fish}
            </Text>

            <CameraView ref={cameraRef} style={styles.camera} facing="back" />

            <TouchableOpacity style={styles.button} onPress={handleScan}>
              <Text style={styles.buttonText}>Scan Now</Text>
            </TouchableOpacity>

            {result !== "" && (
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>Result: {result}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                setResult("");
                setStep("feature");
              }}
            >
              <Text style={styles.outlineText}>Change Feature</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                setResult("");
                setFeature("");
                setFish("");
                setStep("fish");
              }}
            >
              <Text style={styles.outlineText}>Change Fish</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                setResult("");
              }}
            >
              <Text style={styles.outlineText}>Scan Again</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#001F2D", // deep ocean background
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "92%",
    backgroundColor: "rgba(0,0,0,0.04)", // darker overlay
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#E0FBFC",
    marginBottom: 15,
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 16,
    color: "#CDECEE",
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#005F73",
    paddingVertical: 14,
    borderRadius: 18,
    width: "100%",
    marginVertical: 6,
  },

  buttonText: {
    color: "#E0FBFC",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#459b90",
    paddingVertical: 12,
    borderRadius: 18,
    width: "100%",
    marginTop: 8,
  },

  outlineText: {
    color: "#459b90",
    textAlign: "center",
    fontWeight: "600",
  },

  camera: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  resultBox: {
    width: "100%",
    backgroundColor: "rgba(148,210,189,0.15)",
    padding: 14,
    borderRadius: 18,
    marginTop: 10,
    alignItems: "center",
  },

  resultText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f7c7e",
  },
});

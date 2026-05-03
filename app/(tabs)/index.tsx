import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [step, setStep] = useState("fish");
  const [fish, setFish] = useState("");
  const [feature, setFeature] = useState("");
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // 🔥 RESET FUNCTION (VERY IMPORTANT)
  const resetScan = () => {
    setResult("");
    setConfidence("");
    setLoading(false);
  };

  const handleScan = async () => {
    try {
      if (!feature || !fish) {
        alert("Please select fish and feature");
        return;
      }

      // reset before scan
      resetScan();
      setLoading(true);

      const photo = await cameraRef.current.takePictureAsync();
      const uri = photo.uri;

      const formData = new FormData();

      formData.append("file", {
        uri: uri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      formData.append("fish", fish);
      formData.append("feature", feature);

      const response = await fetch("http://192.168.1.7:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setResult(data.result.replace(/_/g, " "));
      setConfidence(data.confidence + "%");
    } catch (error) {
      console.log("ERROR:", error);
      setResult("Error connecting to server");
      setConfidence("");
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.screen}>
        <Text style={{ color: "white" }}>Allow camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "yellow" }}>Grant Permission</Text>
        </TouchableOpacity>
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

        {/* STEP 1 */}
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

        {/* STEP 2 */}
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

        {/* STEP 3 */}
        {step === "scan" && (
          <>
            <Text style={styles.subtitle}>
              Scanning {feature} of {fish}
            </Text>

            <CameraView ref={cameraRef} style={styles.camera} facing="back" />

            <TouchableOpacity style={styles.button} onPress={handleScan}>
              <Text style={styles.buttonText}>Scan Now</Text>
            </TouchableOpacity>

            {loading && (
              <Text style={{ color: "#fff", marginTop: 10 }}>Scanning...</Text>
            )}

            {result !== "" && !loading && (
              <Text
                style={{
                  fontSize: 30,
                  marginTop: 20,
                  fontWeight: "bold",
                  color:
                    result.toLowerCase() === "fresh" ? "#4CAF50" : "#FF4D4D",
                }}
              >
                {result}
              </Text>
            )}

            {confidence !== "" && !loading && (
              <Text style={{ color: "#ccc", marginTop: 10 }}>
                Confidence: {confidence}
              </Text>
            )}

            {/* 🔥 FIXED BUTTONS */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                resetScan();
                setStep("feature");
              }}
            >
              <Text style={styles.outlineText}>Change Feature</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                resetScan();
                setFeature("");
                setFish("");
                setStep("fish");
              }}
            >
              <Text style={styles.outlineText}>Change Fish</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineButton} onPress={resetScan}>
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
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "90%",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },

  subtitle: {
    color: "#fff",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#0077b6",
    padding: 12,
    width: "100%",
    borderRadius: 10,
    marginVertical: 5,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: "#fff",
    padding: 10,
    width: "100%",
    borderRadius: 10,
    marginTop: 5,
  },

  outlineText: {
    color: "#fff",
    textAlign: "center",
  },

  camera: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    marginVertical: 10,
    overflow: "hidden",
  },
});

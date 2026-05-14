import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Image,
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

  // TYPE SAFE
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // TORCH/FLASH
  const [flash, setFlash] = useState<"on" | "off">("on");

  const [permission, requestPermission] = useCameraPermissions();

  // CAMERA REF
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // RESET FUNCTION
  const resetScan = () => {
    setResult("");
    setConfidence("");
    setLoading(false);
    setCapturedImage(null);
  };

  // SCAN FUNCTION
  const handleScan = async () => {
    try {
      if (!feature || !fish) {
        alert("Please select fish and feature");
        return;
      }

      // CAMERA SAFETY
      if (!cameraRef.current) {
        alert("Camera not ready");
        return;
      }

      resetScan();

      // TAKE PHOTO
      const photo = await cameraRef.current.takePictureAsync();

      const uri = photo.uri;

      // FREEZE CAMERA PREVIEW
      setCapturedImage(uri);

      setLoading(true);

      // FORM DATA
      const formData = new FormData();

      formData.append("file", {
        uri: uri,
        name: "image.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("fish", fish);
      formData.append("feature", feature);

      // API REQUEST
      const response = await fetch("http://172.16.11.240:8000/predict", {
        method: "POST",
        body: formData,
      });

      // RESPONSE ERROR HANDLING
      if (!response.ok) {
        throw new Error("Server connection failed");
      }

      const data = await response.json();

      // SERVER ERROR CHECK
      if (data.error) {
        throw new Error(data.error);
      }

      // DISPLAY RESULT
      setResult(data.result.replace(/_/g, " "));
      setConfidence(data.confidence + "%");
    } catch (error: any) {
      console.log("ERROR:", error);

      setResult("Error connecting to server");
      setConfidence("");
    } finally {
      setLoading(false);
    }
  };

  // LOADING CAMERA PERMISSION
  if (!permission) return <View />;

  // CAMERA PERMISSION UI
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

            <View style={styles.cameraContainer}>
              {capturedImage ? (
                // SHOW FROZEN IMAGE
                <Image source={{ uri: capturedImage }} style={styles.camera} />
              ) : (
                <>
                  {/* LIVE CAMERA */}
                  <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                    flash={flash}
                  />

                  {/* FLASH BUTTON */}
                  <TouchableOpacity
                    style={styles.flashIcon}
                    onPress={() => setFlash(flash === "off" ? "on" : "off")}
                  >
                    <Ionicons
                      name={flash === "on" ? "flash" : "flash-off"}
                      size={28}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* SCAN BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleScan}>
              <Text style={styles.buttonText}>Scan Now</Text>
            </TouchableOpacity>

            {/* LOADING */}
            {loading && (
              <Text
                style={{
                  color: "#fff",
                  marginTop: 10,
                }}
              >
                Scanning...
              </Text>
            )}

            {/* RESULT */}
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

            {/* CONFIDENCE */}
            {confidence !== "" && !loading && (
              <Text
                style={{
                  color: "#ccc",
                  marginTop: 10,
                }}
              >
                Confidence: {confidence}
              </Text>
            )}

            {/* CHANGE FEATURE */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => {
                resetScan();
                setStep("feature");
              }}
            >
              <Text style={styles.outlineText}>Change Feature</Text>
            </TouchableOpacity>

            {/* CHANGE FISH */}
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

            {/* SCAN AGAIN */}
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

  cameraContainer: {
    width: "100%",
    height: 350,
    marginVertical: 20,
  },

  flashIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
    zIndex: 999,
  },

  camera: {
    width: "100%",
    height: 350,
    borderRadius: 15,
    overflow: "hidden",
  },
});

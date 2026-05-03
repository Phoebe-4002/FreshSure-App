from fastapi import FastAPI, File, UploadFile, Form
from ultralytics import YOLO
import shutil

app = FastAPI()

# MODELS
sardines_model = YOLO("models/sardines_best.pt")
gills_model = YOLO("models/gills_best.pt")

@app.get("/")
def root():
    return {"status": "Server is running"}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    fish: str = Form(...),
    feature: str = Form(...)
):
    file_path = "temp.jpg"

    # save image
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔥 MODEL SELECTION
    if feature.lower() == "gills":
        model = gills_model
        model_name = "gills_best.pt"
    else:
        model = sardines_model
        model_name = "sardines_best.pt"

    # 🔥 RUN MODEL
    results = model(file_path)
    result = results[0]

    # ✅ CLASSIFICATION FIX (VERY IMPORTANT)
    probs = result.probs

    if probs is not None:
        confidence = float(probs.top1conf) * 100
        label = result.names[probs.top1]
    else:
        label = "Unknown"
        confidence = 0

    return {
        "result": label.upper(),
        "confidence": round(confidence, 2),
        "model_used": model_name
    }
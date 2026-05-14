from fastapi import FastAPI, File, UploadFile, Form
from ultralytics import YOLO
import shutil
import uuid
import os

app = FastAPI()

# LOAD ALL MODELS
sardines_model = YOLO("models/Sardines_best.pt")
tilapia_model = YOLO("models/Tilapia_best.pt")
bangus_model = YOLO("models/Bangus_best.pt")
gills_model = YOLO("models/Gills_best.pt")

# CONFIDENCE THRESHOLD
THRESHOLD = 80


@app.get("/")
def root():
    return {"status": "Server is running"}


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    fish: str = Form(...),
    feature: str = Form(...)
):

    file_path = ""

    try:

        # CREATE UNIQUE FILE NAME
        file_path = f"{uuid.uuid4()}.jpg"

        # SAVE IMAGE
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # MODEL SELECTION
        if feature.lower() == "gills":
            model = gills_model
            model_name = "Gills_best.pt"

        elif fish.lower() == "sardines":
            model = sardines_model
            model_name = "Sardines_best.pt"

        elif fish.lower() == "tilapia":
            model = tilapia_model
            model_name = "Tilapia_best.pt"

        elif fish.lower() == "bangus":
            model = bangus_model
            model_name = "Bangus_best.pt"

        else:
            return {
                "error": "Invalid fish type selected"
            }

        # RUN MODEL
        results = model(file_path)
        result = results[0]

        # GET CLASSIFICATION OUTPUT
        probs = result.probs

        if probs is not None:

            # GET CONFIDENCE
            confidence = float(probs.top1conf) * 100

            # GET LABEL
            label = result.names[probs.top1]

            # FINAL RESULT
            final_result = label.upper()

            # INTERNAL THRESHOLD CHECK
            low_confidence = confidence < THRESHOLD

        else:

            final_result = "UNKNOWN"
            confidence = 0
            low_confidence = True

        # DELETE TEMP IMAGE
        if os.path.exists(file_path):
            os.remove(file_path)

        # RETURN RESULT
        return {
            "result": final_result,
            "confidence": round(confidence, 2),
            "low_confidence": low_confidence,
            "model_used": model_name,
            "threshold": THRESHOLD
        }

    except Exception as e:

        # DELETE FILE IF ERROR HAPPENS
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        return {
            "error": str(e)
        }
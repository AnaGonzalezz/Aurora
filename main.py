from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import csv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes limitar si lo deseas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    message: str

@app.post("/chat")
async def chat(prompt: Prompt):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(prompt.message)
        return {"response": response.text.strip()}
    except Exception as e:
        return {"error": str(e)}

@app.post("/guardar_formulario")
async def guardar_formulario(
    nombre: str = Form(...),
    edad: int = Form(...),
    fecha: str = Form(...),
    departamento: str = Form(...),
    ciudad: str = Form(...),
    municipio: str = Form(...),
    direccion: str = Form(...),
    tipo_violencia: str = Form(...),
    descripcion: str = Form(...),
    genero_agresor: str = Form(...),
    violencia_previa: str = Form(...),
    atencion_medica: str = Form(...)
):
    ruta_csv = "formulario.csv"
    archivo_nuevo = not os.path.exists(ruta_csv)

    with open(ruta_csv, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=';')
        if archivo_nuevo:
            writer.writerow([
                "NOMBRE", "EDAD", "FECHA", "DEPARTAMENTO", "CIUDAD", "MUNICIPIO",
                "DIRECCIÓN", "TIPO_VIOLENCIA", "DESCRIPCION", "GENERO_AGRESOR",
                "VIOLENCIA_PREVIA", "ATENCION_MEDICA"
            ])
        writer.writerow([
            nombre, edad, fecha, departamento, ciudad, municipio,
            direccion, tipo_violencia, descripcion, genero_agresor,
            violencia_previa, atencion_medica
        ])

    return {"mensaje": "✅ Se reportó tu caso correctamente."}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from auth import init_auth
from routers import clients, events

load_dotenv()

# Инициализируем авторизацию токеном бота
init_auth(os.getenv("TELEGRAM_BOT_TOKEN"))

app = FastAPI(title="Tutor LMS API")

# Разрешаем запросы с фронта (CORS) ПОТОМ ВАЖНО НАСТРОИТЬ
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(clients.router)
app.include_router(events.router)

@app.get("/")
async def root():
    return {"message": "Tutor LMS API is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
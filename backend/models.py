from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# Модель для создания/обновления ученика
class ClientCreate(BaseModel):
    name: str
    telegram_username: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

# Модель для ответа 
class ClientResponse(ClientCreate):
    id: str
    created_at: datetime
    updated_at: datetime

# Модель для занятия
class EventCreate(BaseModel):
    client_id: str
    title: str
    start_time: datetime
    end_time: datetime
    meeting_link: Optional[str] = None
    materials_link: Optional[str] = None
    price: Optional[float] = None
    notes: Optional[str] = None


class EventResponse(EventCreate):
    id: str
    status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime
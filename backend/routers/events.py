from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from models import EventCreate, EventResponse
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])

@router.post("", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    user_id: int = Depends(get_current_user)
):
    # Проверяем, что ученик принадлежит этому репетитору
    client_check = supabase.table("clients").select("id").eq("id", event.client_id).eq("profile_id", user_id).execute()
    if not client_check.data:
        raise HTTPException(status_code=403, detail="Client not found or access denied")
    
    data = event.model_dump()

    if isinstance(data.get("start_time"), datetime):
        data["start_time"] = data["start_time"].isoformat()
    if isinstance(data.get("end_time"), datetime):
        data["end_time"] = data["end_time"].isoformat()

    data["profile_id"] = user_id

    result = supabase.table("events").insert(data).execute()
    return result.data[0]

@router.get("", response_model=list[EventResponse])
async def list_events(
    user_id: int = Depends(get_current_user),
    start_date: str = None, 
    end_date: str = None
):
    query = supabase.table("events").select("*").eq("profile_id", user_id)
    
    if start_date:
        query = query.gte("start_time", start_date)
    if end_date:
        query = query.lte("end_time", end_date)
    
    result = query.execute()
    return result.data

@router.put("/{event_id}/status")
async def update_event_status(
    event_id: str,
    status: str,  # "completed", "cancelled"
    user_id: int = Depends(get_current_user)
):
    result = supabase.table("events").update({"status": status}).eq("id", event_id).eq("profile_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": f"Status updated to {status}"}

@router.delete("/{event_id}")
async def delete_client(
    event_id: str,
    user_id: int = Depends(get_current_user)
):
    """
    Удалить ученика.
    """
    result = supabase.table("events").delete().eq("id", event_id).eq("profile_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="event not found")
    
    return {"message": "event deleted successfully"}
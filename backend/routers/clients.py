from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from models import ClientCreate, ClientResponse
from auth import get_current_user

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("", response_model=ClientResponse)
async def create_client(
    client: ClientCreate,
    user_id: int = Depends(get_current_user)
):
    """
    Создать нового ученика.
    user_id — ID репетитора из Telegram, полученный из зависимости get_current_user.
    """
    # Превращаем модель в словарь и добавляем profile_id
    data = client.model_dump()
    data["profile_id"] = user_id
    
    # Вставляем в Supabase
    result = supabase.table("clients").insert(data).execute()
    
    # result.data — это список с одной записью
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create client")
    
    return result.data[0]

@router.get("", response_model=list[ClientResponse])
async def list_clients(
    user_id: int = Depends(get_current_user)
):
    """
    Получить всех учеников текущего репетитора.
    """

    
    result = supabase.table("clients").select("*").eq("profile_id", user_id).execute()
    return result.data

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    user_id: int = Depends(get_current_user)
):
    """
    Получить одного ученика по ID.
    """
    result = supabase.table("clients").select("*").eq("id", client_id).eq("profile_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return result.data[0]

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client: ClientCreate,
    user_id: int = Depends(get_current_user)
):
    """
    Обновить данные ученика.
    """
    result = supabase.table("clients").update(client.dict()).eq("id", client_id).eq("profile_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return result.data[0]

@router.delete("/{client_id}")
async def delete_client(
    client_id: str,
    user_id: int = Depends(get_current_user)
):
    """
    Удалить ученика.
    """
    result = supabase.table("clients").delete().eq("id", client_id).eq("profile_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client deleted successfully"}
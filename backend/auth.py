import hashlib
import hmac
import json
from urllib.parse import parse_qs, unquote
from fastapi import HTTPException, Request

TELEGRAM_BOT_TOKEN = None  # все потом

def init_auth(token: str):
    global TELEGRAM_BOT_TOKEN
    TELEGRAM_BOT_TOKEN = token

def verify_telegram_auth(init_data: str) -> dict:
    """
    Проверяет подпись Telegram и возвращает данные пользователя.
    Если подпись неверная — возвращает None.
    """
    if not TELEGRAM_BOT_TOKEN:
        raise Exception("TELEGRAM_BOT_TOKEN not initialized")
    
    # Разбираем строку вида "user=%7B%22id%22%3A123%7D&hash=abc..."
    params = parse_qs(init_data)
    received_hash = params.get('hash', [None])[0]
    
    if not received_hash:
        return None
    
    # Убираем hash из списка параметров
    check_params = []
    for key, value in params.items():
        if key != 'hash':
            # value это список, берём первый элемент
            check_params.append((key, value[0]))
    
    # Сортируем по ключу (как требует Telegram)
    check_params.sort(key=lambda x: x[0])
    
    # Склеиваем в строку "key1=value1\nkey2=value2"
    data_check_string = '\n'.join(f"{k}={v}" for k, v in check_params)
    
    # Генерируем секретный ключ из токена бота
    secret_key = hmac.new(
        key=b"WebAppData",  # фиксированная строка
        msg=TELEGRAM_BOT_TOKEN.encode(),
        digestmod=hashlib.sha256
    ).digest()
    
    # Вычисляем хеш от строки параметров
    computed_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    # Сравниваем с тем, что прислал Telegram
    if computed_hash == received_hash:
        # Парсим поле user (там JSON)
        user_str = params.get('user', [None])[0]
        if user_str:
            user_data = json.loads(unquote(user_str))
            return user_data
        return {}
    
    return None

async def get_current_user(request: Request, init_data: str = None):
    """
    FastAPI dependency. Используй её в каждом эндпоинте.
    """
    if not init_data:
        # Пробуем взять из заголовка Authorization
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('tma '):
            init_data = auth_header[4:]
        else:
            raise HTTPException(status_code=401, detail="Missing auth")
    
    user = verify_telegram_auth(init_data)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid auth")
    
    # Возвращаем ID пользователя Telegram
    return user.get('id')

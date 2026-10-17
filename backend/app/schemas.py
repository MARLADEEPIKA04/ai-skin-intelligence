from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date

class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool

class ConsultationCreate(BaseModel):
    subject: str
    description: str
    dermatologist_id: Optional[int] = None
    priority: Optional[str] = None

class ConsultationUpdate(BaseModel):
    dermatologist_notes: Optional[str] = None
    recommendations: Optional[str] = None

class ConsultationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    subject: str
    description: str
    status: str
    priority: str
    created_at: datetime

class MessageCreate(BaseModel):
    message: str

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    consultation_id: int
    sender_id: int
    message: str
    created_at: datetime

class IngredientAnalysisRequest(BaseModel):
    ingredient_name: str
    product_ingredients: Optional[str] = None

class ProductCompareRequest(BaseModel):
    product_ids: List[int]

class ProgressEntryCreate(BaseModel):
    routine_adherence: Optional[float] = None
    improvement_score: Optional[float] = None
    hydration_score: Optional[float] = None
    lifestyle_score: Optional[float] = None
    sleep_score: Optional[float] = None
    concern_status: Optional[str] = None
    notes: Optional[str] = None

class RoutineLogCreate(BaseModel):
    log_date: date
    morning_completed: bool = False
    evening_completed: bool = False
    sunscreen_completed: bool = False
    notes: Optional[str] = None

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    brand: str
    category: str
    description: str
    price: float
    rating: float

class IngredientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: str
    description: str
    benefits: str

class AppointmentCreate(BaseModel):
    specialist_id: int
    appointment_date: str
    slot_time: Optional[str] = None
    time_slot: Optional[str] = None
    service_type: Optional[str] = "Clinical Tele-Consultation"
    consultation_type: Optional[str] = None
    notes: Optional[str] = None
    reason: Optional[str] = None

class IngredientConflictRequest(BaseModel):
    ingredients: List[str]

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None


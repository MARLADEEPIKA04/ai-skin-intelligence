from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from .database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default='user')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    
    skin_profile = relationship("SkinProfile", back_populates="user", uselist=False)
    progress_entries = relationship("ProgressEntry", back_populates="user")
    routine_logs = relationship("RoutineLog", back_populates="user")
    recommendation_events = relationship("RecommendationEvent", back_populates="user")


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    age_group = Column(String)
    skin_type = Column(String)
    primary_concern = Column(String)
    allergies = Column(String)
    sensitivities = Column(String)
    lifestyle_habits = Column(String)
    sleep_quality = Column(String)
    water_intake = Column(String)
    environmental_exposure = Column(String)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    user = relationship("User", back_populates="skin_profile")


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dermatologist_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    subject = Column(String)
    description = Column(String)
    skin_type = Column(String)
    primary_concern = Column(String)
    status = Column(String, default="pending")
    priority = Column(String, default="medium")
    dermatologist_notes = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    patient = relationship("User", foreign_keys=[user_id])
    dermatologist = relationship("User", foreign_keys=[dermatologist_id])
    messages = relationship("ConsultationMessage", back_populates="consultation")


class ConsultationMessage(Base):
    __tablename__ = "consultation_messages"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    created_at = Column(DateTime, default=utcnow)

    consultation = relationship("Consultation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    description = Column(Text)
    benefits = Column(Text)
    caution = Column(Text)
    suitable_skin_types = Column(String)
    concern_targets = Column(String)
    common_interactions = Column(Text)
    allergen_flag = Column(Boolean, default=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    brand = Column(String)
    category = Column(String)
    description = Column(Text)
    ingredients = Column(Text)
    suitable_skin_types = Column(String)
    concern_targets = Column(String)
    price = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skin_health_score = Column(Float)
    routine_adherence = Column(Float)
    improvement_score = Column(Float, default=0.0)
    hydration_score = Column(Float)
    lifestyle_score = Column(Float)
    sleep_score = Column(Float)
    concern_status = Column(String)
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="progress_entries")


class RoutineLog(Base):
    __tablename__ = "routine_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    log_date = Column(Date)
    morning_completed = Column(Boolean, default=False)
    evening_completed = Column(Boolean, default=False)
    sunscreen_completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    user = relationship("User", back_populates="routine_logs")


class RecommendationEvent(Base):
    __tablename__ = "recommendation_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_type = Column(String)
    item_type = Column(String)
    item_id = Column(Integer)
    score = Column(Float)
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="recommendation_events")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, default="routine") # 'routine', 'hydration', 'sleep', 'replenishment', 'consultation', 'system'
    title = Column(String)
    message = Column(Text)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", foreign_keys=[user_id])


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    specialist_id = Column(Integer, ForeignKey("users.id"))
    appointment_date = Column(Date)
    slot_time = Column(String)
    service_type = Column(String, default="Clinical Tele-Consultation")
    meeting_link = Column(String)
    status = Column(String, default="scheduled") # 'scheduled', 'completed', 'cancelled'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    patient = relationship("User", foreign_keys=[user_id])
    specialist = relationship("User", foreign_keys=[specialist_id])


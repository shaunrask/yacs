from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class UserSession(Base):
    __tablename__ = 'user_session'

    session_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Assumes a 'users' table
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
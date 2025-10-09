from pydantic import BaseModel

class UserPydantic(BaseModel):
    """Data model for creating a user."""
    username: str
    password: str

class SessionPydantic(BaseModel):
    """Data model for logging in."""
    username: str
    password: str

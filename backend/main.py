#!/usr/bin/python3
from fastapi import FastAPI, Request, Response
from starlette.middleware.sessions import SessionMiddleware
import os

# Import Pydantic models and controllers
from api_models import UserPydantic, SessionPydantic
from controllers import user_controller, session_controller

# --- Initialize FastAPI App ---
app = FastAPI()

# --- Add Middleware ---
app.add_middleware(SessionMiddleware, secret_key="a_very_secret_key")

# --- API Endpoints ---

@app.get('/')
async def root():
    """Confirms the API is running."""
    return {"message": "YACS API is Up!"}

## User Account Management ##
@app.post('/api/user')
async def add_user(user: UserPydantic):
    return user_controller.create_user(user.dict())

@app.delete('/api/user')
async def delete_user(request: Request):
    if 'user' not in request.session:
        return Response("Not authorized", status_code=403)
    user_id = request.session['user']['user_id']
    return user_controller.delete_current_user(user_id)

## Session Management (Login/Logout) ##
@app.post('/api/session')
async def log_in(request: Request, credentials: SessionPydantic):
    return session_controller.log_user_in(credentials.dict(), request.session)

@app.delete('/api/session')
def log_out(request: Request):
    return session_controller.log_user_out(request.session)

# --- Add your Course, Professor, and other endpoints below ---
# Example:
# from controllers import course_controller
#
# @app.get('/api/semester')
# async def get_semesters():
#     return course_controller.get_all_semesters()
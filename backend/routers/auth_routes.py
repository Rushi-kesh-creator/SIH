from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from database import get_db
from models import User
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(
    name: str,
    email: str,
    password: str,
    role: str,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if role not in ["student", "academician", "company", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.role)

    return {
        "message": "Registration successful",
        "user_id": user.id,
        "role": user.role,
        "access_token": token
    }

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user.id, user.role)

    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "role": user.role
    }
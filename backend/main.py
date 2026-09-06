from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
from routers.auth_routes import router as auth_router
from routers.application_routes import router as application_router
from routers.academician_routes import router as academician_router
from routers.admin_routes import router as admin_router
from routers.company_routes import router as company_router
from routers.internship_routes import router as internship_router
from routers.job_routes import router as job_router
from routers.ml_routes import router as ml_router
from routers.recommendation_routes import router as recommendation_router
from routers.student_routes import router as student_router     
app = FastAPI(
    title="Academia-Industry Collaboration Portal",
    description="AI-powered platform for skill mapping, internships and placements",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(application_router)
app.include_router(academician_router)
app.include_router(admin_router)
app.include_router(company_router)
app.include_router(internship_router)
app.include_router(job_router)
app.include_router(ml_router)
app.include_router(recommendation_router)
app.include_router(student_router)

@app.get("/")
def root():
    return {
        "message": "Academia-Industry Collaboration Portal API is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }

@app.get("/protected")
def protected_route(current_user=Depends(get_current_user)):
    return {
        "message": "You are authenticated",
        "user": current_user
    }
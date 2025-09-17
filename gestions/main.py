from fastapi import FastAPI
from routers import auctions, bids, users, ads, payments, notifications, categories  # à créer
from fastapi import FastAPI
from routers.bids import router as bids_router
from routers.notifications import router as notifications_router

app = FastAPI(title="Plateforme Annonces & Enchères")

app.include_router(auctions.router, prefix="/api/auctions", tags=["auctions"])
app.include_router(bids.router, prefix="/api/bids", tags=["bids"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(ads.router, prefix="/api/ads", tags=["ads"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(bids_router, prefix="/api/bids", tags=["bids"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])

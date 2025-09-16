# ads.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Ad, User
from schemas import AdCreate, AdRead, AdUpdate
from database import get_db
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=AdRead, status_code=status.HTTP_201_CREATED)
async def create_ad(ad: AdCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends()):
    # Ici tu peux ajouter une dépendance pour l’utilisateur connecté si tu as auth
    # Exemple: current_user = Depends(get_current_user)
    db_ad = Ad(**ad.dict(), user_id=current_user.id)
    db.add(db_ad)
    await db.commit()
    await db.refresh(db_ad)
    return db_ad

@router.get("/{ad_id}", response_model=AdRead)
async def read_ad(ad_id: int, db: AsyncSession = Depends(get_db)):
    ad = await db.get(Ad, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    return ad

@router.get("/", response_model=List[AdRead])
async def list_ads(
    skip: int = 0,
    limit: int = Query(100, le=1000),
    status: Optional[str] = Query(None, description="Filtrer par status"),
    category_id: Optional[int] = Query(None, description="Filtrer par catégorie"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Ad)
    if status:
        query = query.where(Ad.status == status)
    if category_id:
        query = query.where(Ad.category_id == category_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    ads = result.scalars().all()
    return ads

@router.patch("/{ad_id}", response_model=AdRead)
async def update_ad(ad_id: int, ad_update: AdUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends()):
    ad = await db.get(Ad, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    # Vérifier que current_user est bien propriétaire (ou admin)
    if ad.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this ad")
    update_data = ad_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ad, key, value)
    await db.commit()
    await db.refresh(ad)
    return ad

@router.delete("/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ad(ad_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends()):
    ad = await db.get(Ad, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    # Vérifier que current_user est bien propriétaire (ou admin)
    if ad.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this ad")
    await db.delete(ad)
    await db.commit()
    return

# categories.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Category
from schemas import CategoryCreate, CategoryRead, CategoryUpdate
from database import get_db
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    # Optionnel : vérifier unicité du slug
    existing = await db.execute(select(Category).where(Category.slug == category.slug))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Slug already exists")

    db_category = Category(**category.dict())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

@router.get("/{category_id}", response_model=CategoryRead)
async def read_category(category_id: int, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("/", response_model=List[CategoryRead])
async def list_categories(skip: int = 0, limit: int = 100, parent_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    query = select(Category)
    if parent_id is not None:
        query = query.where(Category.parent_id == parent_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    categories = result.scalars().all()
    return categories

@router.patch("/{category_id}", response_model=CategoryRead)
async def update_category(category_id: int, category_update: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    update_data = category_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(category)
    await db.commit()
    return

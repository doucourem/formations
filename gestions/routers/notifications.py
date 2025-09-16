# notifications.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Notification
from schemas import NotificationCreate, NotificationRead
from database import get_db

router = APIRouter()

@router.post("/", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
async def create_notification(notification: NotificationCreate, db: AsyncSession = Depends(get_db)):
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

@router.get("/{notification_id}", response_model=NotificationRead)
async def read_notification(notification_id: int, db: AsyncSession = Depends(get_db)):
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.get("/", response_model=list[NotificationRead])
async def list_notifications(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).offset(skip).limit(limit))
    notifications = result.scalars().all()
    return notifications

@router.patch("/{notification_id}", response_model=NotificationRead)
async def update_notification(notification_id: int, is_read: bool, db: AsyncSession = Depends(get_db)):
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = is_read
    await db.commit()
    await db.refresh(notification)
    return notification

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(notification_id: int, db: AsyncSession = Depends(get_db)):
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    await db.delete(notification)
    await db.commit()
    return

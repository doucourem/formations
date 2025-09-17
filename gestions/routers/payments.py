# payments.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Payment, User, Ad
from schemas import PaymentCreate, PaymentRead
from database import get_db
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
async def create_payment(payment: PaymentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends()):
    # On s'assure que le user_id correspond à current_user.id pour éviter fraude
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create payment for another user")

    # Optionnel : vérifier que l'annonce existe si ad_id fourni
    if payment.ad_id:
        ad = await db.get(Ad, payment.ad_id)
        if not ad:
            raise HTTPException(status_code=404, detail="Ad not found")

    db_payment = Payment(**payment.dict())
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    return db_payment

@router.get("/{payment_id}", response_model=PaymentRead)
async def read_payment(payment_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends()):
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this payment")
    return payment

@router.get("/", response_model=List[PaymentRead])
async def list_payments(
    skip: int = 0,
    limit: int = Query(100, le=1000),
    payment_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends()
):
    query = select(Payment).where(Payment.user_id == current_user.id)
    if payment_status:
        query = query.where(Payment.payment_status == payment_status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    payments = result.scalars().all()
    return payments

@router.patch("/{payment_id}", response_model=PaymentRead)
async def update_payment_status(payment_id: int, payment_status: str, db: AsyncSession = Depends(get_db), current_user: User = Depends()):
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this payment")

    payment.payment_status = payment_status
    await db.commit()
    await db.refresh(payment)
    return payment

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(payment_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends()):
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this payment")
    await db.delete(payment)
    await db.commit()
    return

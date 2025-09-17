# bids.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Bid
from schemas import BidCreate, BidRead
from database import get_db

router = APIRouter()

@router.post("/", response_model=BidRead, status_code=status.HTTP_201_CREATED)
async def create_bid(bid: BidCreate, db: AsyncSession = Depends(get_db)):
    db_bid = Bid(**bid.dict())
    db.add(db_bid)
    await db.commit()
    await db.refresh(db_bid)
    return db_bid

@router.get("/{bid_id}", response_model=BidRead)
async def read_bid(bid_id: int, db: AsyncSession = Depends(get_db)):
    bid = await db.get(Bid, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    return bid

@router.get("/", response_model=list[BidRead])
async def list_bids(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bid).offset(skip).limit(limit))
    bids = result.scalars().all()
    return bids

@router.delete("/{bid_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bid(bid_id: int, db: AsyncSession = Depends(get_db)):
    bid = await db.get(Bid, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    await db.delete(bid)
    await db.commit()
    return

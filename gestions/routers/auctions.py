# routers/auctions.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Auction
from schemas import AuctionCreate, AuctionRead
from database import get_db

router = APIRouter()

@router.post("/", response_model=AuctionRead, status_code=status.HTTP_201_CREATED)
async def create_auction(auction: AuctionCreate, db: AsyncSession = Depends(get_db)):
    db_auction = Auction(**auction.dict(), current_price=auction.starting_price)
    db.add(db_auction)
    await db.commit()
    await db.refresh(db_auction)
    return db_auction

@router.get("/{auction_id}", response_model=AuctionRead)
async def get_auction(auction_id: int, db: AsyncSession = Depends(get_db)):
    auction = await db.get(Auction, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction

@router.get("/", response_model=list[AuctionRead])
async def list_auctions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Auction).offset(skip).limit(limit))
    auctions = result.scalars().all()
    return auctions

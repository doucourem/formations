# schemas.py
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, constr, condecimal, ConfigDict

# ENUMS
class UserRole(str, Enum):
    user = "user"
    admin = "admin"
    moderator = "moderator"

class AccountType(str, Enum):
    particulier = "particulier"
    professionnel = "professionnel"

class AdStatus(str, Enum):
    pending = "pending"
    active = "active"
    rejected = "rejected"
    expired = "expired"

class PaymentStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

class AuctionStatus(str, Enum):
    pending = "pending"
    active = "active"
    closed = "closed"
    cancelled = "cancelled"

class NotificationType(str, Enum):
    bid_placed = "bid_placed"
    auction_won = "auction_won"
    payment_completed = "payment_completed"

# USER
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.user
    account_type: AccountType = AccountType.particulier
    phone: Optional[str] = None
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    company_registration: Optional[str] = None
    company_address: Optional[str] = None
    company_website: Optional[str] = None

class UserCreate(UserBase):
    password: str  # en clair à recevoir (hashé en backend)

class UserUpdate(BaseModel):
    username: Optional[str]
    phone: Optional[str]
    company_name: Optional[str]
    company_logo: Optional[str]
    company_registration: Optional[str]
    company_address: Optional[str]
    company_website: Optional[str]

class UserRead(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class CategoryBase(BaseModel):
    parent_id: Optional[int]
    name: Optional[str]
    slug: Optional[str]

class CategoryCreate(CategoryBase):
    name: str
    slug: str

class CategoryUpdate(CategoryBase):
    # Tous les champs optionnels pour update partiel
    pass

class CategoryRead(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# AD
class AdBase(BaseModel):
    category_id: Optional[int]
    title: str
    description: Optional[str] = None
    price: condecimal(max_digits=12, decimal_places=2) = 0.00
    currency: str = "EUR"
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: AdStatus = AdStatus.pending
    is_featured: bool = False
    expires_at: Optional[datetime] = None

class AdCreate(AdBase):
    pass

class AdUpdate(BaseModel):
    category_id: Optional[int]
    title: Optional[str]
    description: Optional[str]
    price: Optional[condecimal(max_digits=12, decimal_places=2)]
    currency: Optional[str]
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: Optional[AdStatus]
    is_featured: Optional[bool]
    expires_at: Optional[datetime]

class AdRead(AdBase):
    id: int
    user_id: int
    views_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# AUCTION
class AuctionBase(BaseModel):
    ad_id: int
    starting_price: condecimal(max_digits=12, decimal_places=2)
    bid_increment: condecimal(max_digits=12, decimal_places=2) = 1.00
    start_time: datetime
    end_time: datetime
    status: AuctionStatus = AuctionStatus.pending

class AuctionCreate(AuctionBase):
    pass

class AuctionUpdate(BaseModel):
    starting_price: Optional[condecimal(max_digits=12, decimal_places=2)]
    bid_increment: Optional[condecimal(max_digits=12, decimal_places=2)]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    status: Optional[AuctionStatus]

class AuctionRead(AuctionBase):
    id: int
    current_price: condecimal(max_digits=12, decimal_places=2)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# BID
class BidBase(BaseModel):
    auction_id: int
    amount: condecimal(max_digits=12, decimal_places=2)

class BidCreate(BidBase):
    pass

class BidRead(BidBase):
    id: int
    bidder_id: int
    bid_time: datetime

    model_config = ConfigDict(from_attributes=True)


# PAYMENT
class PaymentBase(BaseModel):
    amount: condecimal(max_digits=12, decimal_places=2)
    currency: str = "EUR"
    payment_status: PaymentStatus = PaymentStatus.pending
    stripe_payment_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    payment_intent_id: Optional[str] = None
    refund_id: Optional[str] = None
    meta: Optional[dict] = None

class PaymentCreate(PaymentBase):
    user_id: int
    ad_id: Optional[int] = None

class PaymentRead(PaymentBase):
    id: int
    user_id: int
    ad_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# NOTIFICATION
class NotificationBase(BaseModel):
    type: NotificationType
    message: str
    is_read: bool = False
    related_auction_id: Optional[int] = None
    related_bid_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationRead(NotificationBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

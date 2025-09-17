# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Boolean, Text, JSON, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.sqltypes import Enum as PgEnum
import enum

Base = declarative_base()

# ENUMS
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    moderator = "moderator"

class AccountType(str, enum.Enum):
    particulier = "particulier"
    professionnel = "professionnel"

class AdStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    rejected = "rejected"
    expired = "expired"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

class SubscriptionStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"

class DocStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class AdMediaType(str, enum.Enum):
    image = "image"
    video = "video"
    html = "html"

class AdPosition(str, enum.Enum):
    header = "header"
    sidebar = "sidebar"
    footer = "footer"
    inline = "inline"
    popup = "popup"

class AdStatusType(str, enum.Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    ended = "ended"

class TargetingType(str, enum.Enum):
    location = "location"
    category = "category"
    keyword = "keyword"
    device = "device"

class AuctionStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    closed = "closed"
    cancelled = "cancelled"

class NotificationType(str, enum.Enum):
    bid_placed = "bid_placed"
    auction_won = "auction_won"
    payment_completed = "payment_completed"


# TABLES

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(PgEnum(UserRole), default=UserRole.user)
    account_type = Column(PgEnum(AccountType), default=AccountType.particulier)
    phone = Column(String(20))
    company_name = Column(String(150))
    company_logo = Column(String(255))
    company_registration = Column(String(100))
    company_address = Column(String(255))
    company_website = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))

    ads = relationship("Ad", back_populates="user")
    bids = relationship("Bid", back_populates="bidder")
    notifications = relationship("Notification", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    pro_subscriptions = relationship("ProSubscription", back_populates="user")
    pro_documents = relationship("ProDocument", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(150), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    parent = relationship("Category", remote_side=[id])
    ads = relationship("Ad", back_populates="category")
    advertisements = relationship("Advertisement", back_populates="category")


class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    price = Column(Numeric(12,2), default=0.00)
    currency = Column(String(10), default="EUR")
    location = Column(String(150))
    latitude = Column(Numeric(10,6))
    longitude = Column(Numeric(10,6))
    status = Column(PgEnum(AdStatus), default=AdStatus.pending)
    is_featured = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="ads")
    category = relationship("Category", back_populates="ads")
    images = relationship("AdImage", back_populates="ad")
    bids = relationship("Bid", back_populates="ad")
    auctions = relationship("Auction", back_populates="ad")
    payments = relationship("Payment", back_populates="ad")


class AdImage(Base):
    __tablename__ = "ad_images"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(255), nullable=False)
    position = Column(Integer, default=0)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    ad = relationship("Ad", back_populates="images")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        # Ensure user cannot favorite the same ad twice
        # UniqueConstraint is handled by Unique in migration, can be added here via __table_args__
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(12,2), nullable=False)
    currency = Column(String(10), default="EUR")
    payment_status = Column(PgEnum(PaymentStatus), default=PaymentStatus.pending)
    stripe_payment_id = Column(String(100), unique=True, nullable=True)
    stripe_customer_id = Column(String(100), nullable=True)
    payment_intent_id = Column(String(100), nullable=True)
    refund_id = Column(String(100), nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payments")
    ad = relationship("Ad", back_populates="payments")


class StripeSubscription(Base):
    __tablename__ = "stripe_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stripe_subscription_id = Column(String(100), unique=True, nullable=False)
    stripe_customer_id = Column(String(100), nullable=True)
    stripe_price_id = Column(String(100), nullable=True)
    plan_name = Column(String(100), nullable=True)
    status = Column(PgEnum(SubscriptionStatus), default=SubscriptionStatus.active)
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StripeWebhookLog(Base):
    __tablename__ = "stripe_webhook_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, nullable=False)
    event_type = Column(String(150), nullable=True)
    payload = Column(JSON, nullable=True)
    received_at = Column(DateTime(timezone=True), server_default=func.now())


class ProSubscription(Base):
    __tablename__ = "pro_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_name = Column(String(100), nullable=False)
    price = Column(Numeric(12,2), default=0.00)
    ads_limit = Column(Integer, default=0)
    featured_limit = Column(Integer, default=0)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(PgEnum(SubscriptionStatus), default=SubscriptionStatus.active)

    user = relationship("User", back_populates="pro_subscriptions")


class ProStat(Base):
    __tablename__ = "pro_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=False)
    views_count = Column(Integer, default=0)
    messages_count = Column(Integer, default=0)
    favorites_count = Column(Integer, default=0)
    last_update = Column(DateTime(timezone=True), server_default=func.now())

class ProDocument(Base):
    __tablename__ = "pro_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String(100), nullable=False)
    doc_file = Column(String(255), nullable=False)
    status = Column(PgEnum(DocStatus), default=DocStatus.pending)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="pro_documents")


class Advertisement(Base):
    __tablename__ = "advertisements"

    id = Column(Integer, primary_key=True, index=True)
    advertiser_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    media_url = Column(String(255), nullable=False)
    media_type = Column(PgEnum(AdMediaType), default=AdMediaType.image)
    target_url = Column(String(255), nullable=True)
    position = Column(PgEnum(AdPosition), default=AdPosition.sidebar)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    budget = Column(Numeric(12,2), default=0.00)
    status = Column(PgEnum(AdStatusType), default=AdStatusType.draft)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    advertiser = relationship("User")
    category = relationship("Category", back_populates="advertisements")
    stats = relationship("AdvertisementStat", back_populates="advertisement")
    targetings = relationship("AdvertisementTargeting", back_populates="advertisement")


class AdvertisementStat(Base):
    __tablename__ = "advertisement_stats"

    id = Column(Integer, primary_key=True, index=True)
    advertisement_id = Column(Integer, ForeignKey("advertisements.id", ondelete="CASCADE"), nullable=False)
    views_count = Column(Integer, default=0)
    clicks_count = Column(Integer, default=0)
    stat_date = Column(DateTime(timezone=True), server_default=func.now())

    advertisement = relationship("Advertisement", back_populates="stats")


class AdvertisementTargeting(Base):
    __tablename__ = "advertisement_targeting"

    id = Column(Integer, primary_key=True, index=True)
    advertisement_id = Column(Integer, ForeignKey("advertisements.id", ondelete="CASCADE"), nullable=False)
    type = Column(PgEnum(TargetingType), nullable=False)
    value = Column(String(255), nullable=False)

    advertisement = relationship("Advertisement", back_populates="targetings")


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=False)
    starting_price = Column(Numeric(12,2), nullable=False)
    current_price = Column(Numeric(12,2), default=0.00)
    bid_increment = Column(Numeric(12,2), default=1.00)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(PgEnum(AuctionStatus), default=AuctionStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ad = relationship("Ad", back_populates="auctions")
    bids = relationship("Bid", back_populates="auction")
    winners = relationship("AuctionWinner", back_populates="auction")


class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    bidder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12,2), nullable=False)
    bid_time = Column(DateTime(timezone=True), server_default=func.now())

    auction = relationship("Auction", back_populates="bids")
    bidder = relationship("User", back_populates="bids")


class AuctionWinner(Base):
    __tablename__ = "auction_winners"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    winner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    winning_bid_id = Column(Integer, ForeignKey("bids.id", ondelete="CASCADE"), nullable=False)
    paid = Column(Boolean, default=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    auction = relationship("Auction", back_populates="winners")
    winner = relationship("User")
    winning_bid = relationship("Bid")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(PgEnum(NotificationType), nullable=False)
    message = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    related_auction_id = Column(Integer, ForeignKey("auctions.id", ondelete="SET NULL"), nullable=True)
    related_bid_id = Column(Integer, ForeignKey("bids.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="notifications")

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.config.db import Base

class Feature(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True) # e.g. "classes", "results"
    display_name = Column(String(200))

class PlanFeature(Base):
    """Default features included in a plan"""
    __tablename__ = "plan_features"
    id = Column(Integer, primary_key=True, index=True)
    plan = Column(String(50), index=True) # "starter", "growth", "premium"
    feature_name = Column(String(100), ForeignKey("features.name"))

class ClientFeature(Base):
    """Client-specific overrides for features"""
    __tablename__ = "client_features"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), index=True)
    feature_name = Column(String(100), ForeignKey("features.name"))
    is_enabled = Column(Boolean, default=True)

    client = relationship("Client")

from focus_flow_app import db
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship


# Model for Users
class User(db.Model, UserMixin):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String(150), unique=True, nullable=False)
    password = Column(String(450), nullable=False)
    email = Column(String(150), unique=True, nullable=False)

    tasks = relationship("Task", back_populates="user", lazy="dynamic")


# Model for tasks in the database.
class Task(db.Model):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(200), nullable=False)
    description = Column(String(350), nullable=True)
    done = Column(Boolean, default=False, nullable=False)

    date = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)

    user = relationship("User", back_populates="tasks")

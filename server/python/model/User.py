from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, desc
from db.mysqlCon import Base, Session

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True)
    phone = Column(String(20))
    gender = Column(String(1))
    token = Column(String(255), nullable=False)
    token_up_time = Column(DateTime)
    token_expire_time = Column(DateTime)
    psw = Column(String(255), nullable=False)
    psw_update_time = Column(DateTime, nullable=False)
    psw_expire_time = Column(DateTime, nullable=False)
    psw_error_times = Column(Integer, nullable=False)
    psw_lock_time = Column(Integer)
    psw_lock_status = Column(Integer, nullable=False)
    login_time = Column(DateTime)
    ip = Column(String(255), unique=True)
    avatar_path = Column(String(255))
    role = Column(String(30))
    clear_psw = Column(Integer, nullable=False)
    email = Column(String(255))
    
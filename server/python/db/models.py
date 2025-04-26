
from dataclasses import dataclass
from datetime import datetime
from typing import List
import os

from sqlalchemy import Column
from apps import db
from sqlalchemy import DATETIME, Integer, String, Index

def parse_mysql_return(func):
    def wrapper(*args, **kwargs):
        items = func(*args, **kwargs)

        if items is None:
            return None
        if isinstance(items, list):
            result = []
            for item in items:
                item_dict = item.__dict__
                item_dict.pop('_sa_instance_state', None)
                result.append(item_dict)
        else:
            result = items.__dict__
            result.pop('_sa_instance_state', None)
        return result

    return wrapper


def parse_mysql_paging_return(func):
    def wrapper(*args, **kwargs):
        items = func(*args, **kwargs)
        data_list = items[0]
        total = items[1]
        result = []
        for item in data_list:
            item_dict = item.__dict__
            item_dict.pop('_sa_instance_state', None)
            result.append(item_dict)

        return result, total

    return wrapper

@dataclass
class FrontEndErrors(db.Model):
    __tablename__ = 'front_end_errors'
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)
    message = Column(String(255), nullable=False)
    stack = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    lineno = Column(Integer, nullable=False)
    colno = Column(Integer, nullable=False)
    component_stack = Column(String(255), nullable=False)
    created_at = Column(DATETIME, default=datetime.now)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def commit(self):
        db.session.commit()

    @staticmethod
    @parse_mysql_return
    def find_all():
        obj = FrontEndErrors.query.all()
        return obj

    @staticmethod
    @parse_mysql_paging_return
    def find_paging(offset, size):
        query = FrontEndErrors.query
        query = query.order_by(FrontEndErrors.created_at.desc())
        query = query.offset(offset).limit(size)
        obj_all = query.all()
        total = query.count()
        return obj_all, total

    @staticmethod
    @parse_mysql_return
    def find_by_id(id: int):
        obj = FrontEndErrors.query.filter_by(id=id).first()
        return obj

    @staticmethod
    def delete(id: int):
        t = FrontEndErrors.query.filter_by(id=id).first()
        db.session.delete(t)
        db.session.commit()
        return True

    @staticmethod
    def delete_all():
        db.session.query(FrontEndErrors).delete()
        db.session.commit()
        return True

class ApiLog(db.Model):
    __tablename__ = 'api_log'
    log_id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(255), unique=False, nullable=True)
    host = Column(String(128), unique=False, nullable=True)
    start_time = Column(DATETIME, default=datetime.now)
    execute_ms = Column(Integer, unique=False, nullable=True)
    succeed = Column(Integer, unique=False, nullable=True, default=0)
    user = Column(String(100), nullable=True)
    payload = Column(db.JSON, nullable=True)
    error_info = Column(db.JSON, nullable=True)
    header = Column(db.JSON, nullable=True)
    error = Column(db.JSON, nullable=True)
    __table_args__ = (
        Index('api_log_start_time_index', start_time),
        Index('api_log_succeed_index', succeed),
        Index('api_log_url_index', url),
        Index('api_log_host_index', host),
    )

    @staticmethod
    def insert_api_log(url: str, host: str, start_time: datetime, execute_ms: int,
                       succeed: bool, user: str = None):
        api_log = ApiLog(url=url, host=host, start_time=start_time, execute_ms=execute_ms, succeed=succeed,
                         user=user)
        db.session.add(api_log)
        db.session.commit()
        return api_log.log_id
class User(db.Model):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    gender = Column(String(1), nullable=True)
    token = Column(String(255), nullable=False)
    token_up_time = Column(DATETIME, nullable=True)
    token_expire_time = Column(DATETIME, nullable=True)
    psw = Column(String(255), nullable=False)
    psw_update_time = Column(DATETIME, nullable=False)
    psw_expire_time = Column(DATETIME, nullable=False)
    psw_error_times = Column(Integer, nullable=False)
    psw_lock_time = Column(Integer, nullable=True)
    psw_lock_status = Column(Integer, nullable=False)
    login_time = Column(DATETIME, nullable=True)
    ip = Column(String(255), nullable=True)
    avatar_path = Column(String(255), nullable=True)

    @staticmethod
    def update_avatar(user_id: int, avatar_path: str):
        user = User.query.filter_by(id=user_id).first()
        user.avatar_path = avatar_path
        db.session.commit()
        return True
    
    @staticmethod
    def delete_old_avatar(user_id: int):
        user = User.query.filter_by(id=user_id).first()
        if user:
            old_avatar_path = user.avatar_path
            user.avatar_path = None
            db.session.commit()
            if old_avatar_path:
                os.remove(old_avatar_path)
        return True 

class UploadedFile(db.Model):
    __tablename__ = 'uploaded_files'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    filename = Column(String(255), nullable=False)
    md5 = Column(String(255), nullable=False)
    chunk_num = Column(Integer, nullable=False)
    upload_time = Column(DATETIME, default=datetime.now, nullable=False)
    size = Column(Integer, nullable=False)

    @staticmethod
    @parse_mysql_return
    def find_by_md5(md5: str):
        obj = UploadedFile.query.filter_by(md5=md5).first()
        return obj

    @staticmethod
    @parse_mysql_return
    def find_by_user_id(user_id: int):
        obj = UploadedFile.query.filter_by(user_id=user_id).all()
        return obj
    
    @staticmethod
    def delete(**kwargs):
        id = kwargs.get("id")
        md5 = kwargs.get("md5")
        user_id = kwargs.get("user_id")
        if id:
          t = UploadedFile.query.filter_by(id=id).first()
        elif md5:
          t = UploadedFile.query.filter_by(md5=md5).first()
        elif user_id:
          t = UploadedFile.query.filter_by(user_id=user_id).first()
        db.session.delete(t)
        db.session.commit()
        return True

def to_dict(obj):
    # Convert an SQLAlchemy model instance into a dict
    from sqlalchemy.orm import class_mapper
    return {c.key: getattr(obj, c.key)
            for c in class_mapper(obj.__class__).columns}


def format_datetime_fields_in_pipline_cnt(date_count_list):
    result = []
    for obj in date_count_list:
        key = obj[0].strftime('%Y-%m-%d')
        tmp_dict = {key: obj[1]}
        result.append(tmp_dict)
    return result


def format_datetime_fields_in_service_cnt(service_date_count_dict):
    result = {}
    for service_name, obj in service_date_count_dict.items():
        if service_name not in result:
            result[service_name] = []
        for key, value in obj.items():
            key1 = key  # use the key directly
            temp_dict = {"date": str(key1), "cnt": value}
            result[service_name].append(temp_dict)
    return result

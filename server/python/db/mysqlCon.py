
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from sqlalchemy import create_engine, Column, Integer, String, DateTime

BOKEH_TASK_LOG = "bokeh_log"
DEFAULT_INSERT_BATCH_SIZE = 1000

DB_CONFIG={
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "mmtly",
    "database": "antdp1use",
}


engine = create_engine('mysql+pymysql://root:mmtly@127.0.0.1:3306/antdp1use')
Base = declarative_base()
Session = sessionmaker(bind=engine)

Base.metadata.create_all(engine)
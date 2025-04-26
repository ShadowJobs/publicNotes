from flask import request, jsonify
from flask import Blueprint
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from db.mysqlCon import Base, Session

class FrontEndError(Base):
    __tablename__ = 'front_end_errors'

    id = Column(Integer, primary_key=True)
    type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    stack = Column(Text)
    source = Column(String(255))
    lineno = Column(Integer)
    colno = Column(Integer)
    component_stack = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = Column(String(50))

# 创建数据库连接

errStatisticRouter = Blueprint("errstatistic", __name__, url_prefix="/front-err")

@errStatisticRouter.route("/upload", methods=['POST'])
def uploadFrontErr():
    try:
        data = request.json
        session = Session()
        # 如果表长度超过1000000，删除最早的500000条
        if session.query(FrontEndError).count() > 1000000:
            session.query(FrontEndError).order_by(FrontEndError.created_at).limit(500000).delete()
            session.commit()
        error = FrontEndError(
            type=data.get('type'),
            message=data.get('message'),
            stack=data.get('stack'),
            source=data.get('source'),
            lineno=data.get('lineno'),
            colno=data.get('colno'),
            user=data.get('user'),
            component_stack=data.get('componentStack')
        )
        
        session.add(error)
        session.commit()
        session.close()
        
        return jsonify({"status": "success", "message": "Error logged successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500
    

@errStatisticRouter.route("/list", methods=['GET'])
def getFrontErr():
    try:
        page_num = int(request.args.get('page_num', 1))
        page_size = int(request.args.get('page_size', 10))
        
        session = Session()
        
        total_count = session.query(FrontEndError).count()
        errors = session.query(FrontEndError).order_by(desc(FrontEndError.created_at)).offset((page_num - 1) * page_size).limit(page_size).all()
        
        result = []
        for error in errors:
            result.append({
                "id": error.id,
                "type": error.type,
                "message": error.message,
                "stack": error.stack,
                "source": error.source,
                "lineno": error.lineno,
                "colno": error.colno,
                "component_stack": error.component_stack,
                "created_at": error.created_at.isoformat(),
                "user": error.user
            })
        
        session.close()
        
        return jsonify({
            "status": "success",
            "data": result,
            "total": total_count,
            "page_num": page_num,
            "page_size": page_size,
            "code":1,
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

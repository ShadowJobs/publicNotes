from flask import g, Blueprint
from db.mysqlCon import Base, Session
from model.User import User
from functools import wraps
from werkzeug.exceptions import Unauthorized, Forbidden

from tools.token_checker import token_checker

UserRouter = Blueprint("userapi", __name__, url_prefix="/py-user")

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token_checker(force=True)()
        user = g.user
        if user is None or user == "no_auth_default" or user == "anonymous":
            raise Unauthorized("token is invalid")
        session = Session()
        userRole = session.query(User).filter(User.name == user.decode('utf-8')).first().role
        session.close()
        if userRole != "admin":
            raise Forbidden("Permission denied")
        return f(*args, **kwargs)
    return decorated

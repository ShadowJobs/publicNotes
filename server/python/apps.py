
from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config['SWAGGER'] = {
    "openapi": "3.0.3",
    "uiversion": 3,
    "persistAuthorization": True,
    "title": "P3 API",
}
SWAGGER_TEMPLATE = {
    'components': {
        'securitySchemes': {
            "apiKeyAuth": {
                "type": "apiKey",
                "in": "header",
                "name": "Authorization"
            }
        },
        'security': {
            'apiKeyAuth': []
        }
    },
    "info" : {
        "description": "## **You can obtain your authorization token from [here](/token-management)**"
    }
}
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True
        }
    ],
    "specs_route": "/docs/",
    "url_prefix": "/p3"
}
swagger = Swagger(app, config=swagger_config, template=SWAGGER_TEMPLATE)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:mmtly@127.0.0.1:3306/antdp1use"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = 'True'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# 命令行工具
app.app_context().push() 


# coding=utf-8

from flask import Flask, session, jsonify
from flask_cors import *
import pytz

# 设置vue静态资源
instance = Flask(__name__, template_folder="../../public")
instance.config.from_object('config')
# 设置允许跨域
CORS(instance, supports_credentials=True)
# 限制文件大小
instance.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

tz = pytz.timezone('Asia/Shanghai')


@instance.teardown_request
def remove_db_session(exception):
    pass


@instance.errorhandler(Exception)
def handle_bad_request(e):
    print('handle_bad_request', e)
    response = dict(status=0, message="500 Error")
    return jsonify(response), 400


from .controller import api
instance.register_blueprint(api.mod)

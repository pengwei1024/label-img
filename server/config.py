import os

_basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE_URI = 'sqlite:///' + os.path.join(_basedir, 'app.db?charset=utf8')
DATABASE_CONNECT_OPTIONS = {}
BASE_URL = _basedir

del os

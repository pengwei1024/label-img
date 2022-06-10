# -*- coding: utf-8 -*-
import flask
from flask import request, Blueprint, jsonify
import os

mod = Blueprint('api', __name__, url_prefix='/api')


def list_dir(filepath, dataset):
    # 遍历目录下所有图片
    files = os.listdir(filepath)
    for fi in files:
        fi_d = os.path.join(filepath, fi)
        if os.path.isdir(fi_d):
            list_dir(os.path.join(filepath, fi_d), dataset)
        else:
            if fi.endswith('.png') or fi.endswith('.jpg') or fi.endswith('.jpeg') or fi.endswith('.bmp'):
                dataset.append(os.path.join(filepath, fi_d))


@mod.route('/getList', methods=['POST', 'GET'])
def get_list():
    path = request.values.get('path', None)
    dataset = []
    if path and os.path.isdir(path):
        list_dir(path, dataset)
    return jsonify({"dataset": dataset})


@mod.route('/image', methods=['GET'])
def get_image():
    """
    获取本地图片
    """
    src = request.values.get('src', None)
    if src and os.path.isfile(src):
        folder_path, file_name = os.path.split(src)
        return flask.send_from_directory(folder_path, file_name, as_attachment=True)
    return jsonify({'msg': '文件找不到'})


@mod.route('/voc', methods=['POST'])
def write_voc():
    """
    voc 写入文件
    :return:
    """
    file_path = request.form.get("filePath")
    voc_content = request.form.get("vocContent")
    path, name = os.path.split(file_path)
    if not os.path.exists(path):
        os.mkdir(path)
    with open(file_path, 'w') as f:
        f.write(voc_content)
    return jsonify({'code': 0})

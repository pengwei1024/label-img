# -*- coding: utf-8 -*-
import flask
from flask import request, Blueprint, jsonify
import os

mod = Blueprint('api', __name__, url_prefix='/api')
# voc 目录名称
VOC_DIR = 'annotations'
VOC_FILE_EXT = '.xml'


def get_voc_file(file_path):
    """
    获取对应的 voc 目录
    :param file_path:
    :return:
    """
    path, name = os.path.split(file_path)
    name_prefix, _ = os.path.splitext(name)
    output_file = os.path.join(path, VOC_DIR, name_prefix + VOC_FILE_EXT)
    output_dir = os.path.dirname(output_file)
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
    return output_file


def list_dir(filepath, dataset, exist_list=[]):
    # 遍历目录下所有图片
    files = os.listdir(filepath)
    for fi in files:
        fi_d = os.path.join(filepath, fi)
        if os.path.isdir(fi_d):
            list_dir(os.path.join(filepath, fi_d), dataset)
        else:
            if fi.endswith('.png') or fi.endswith('.jpg') or fi.endswith('.jpeg') or fi.endswith('.bmp'):
                full_path = os.path.join(filepath, fi_d)
                if os.path.exists(get_voc_file(full_path)):
                    exist_list.append(full_path)
                else:
                    dataset.append(full_path)


@mod.route('/getList', methods=['POST', 'GET'])
def get_list():
    path = request.values.get('path', None)
    dataset = []
    exist_list = []
    if path and os.path.isdir(path):
        list_dir(path, dataset, exist_list)
    return jsonify({'code': 0, "dataset": dataset, 'existCount': len(exist_list)})


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
    if not file_path or file_path.strip() == "":
        return jsonify({'code': -1, 'msg': '地址为空'})
    with open(get_voc_file(file_path), 'w') as f:
        f.write(voc_content)
    return jsonify({'code': 0})

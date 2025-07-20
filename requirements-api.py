#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
需求中心API服务器
简单的Python Flask服务器，用于处理需求数据的保存和读取
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置
CONTENT_DIR = "content/requirements"
PORT = 3001

# 确保内容目录存在
os.makedirs(CONTENT_DIR, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'message': '需求中心API服务运行正常',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/save-content', methods=['POST'])
def save_content():
    """保存需求内容"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': '无效的请求数据'}), 400
        
        file_name = data.get('fileName')
        content = data.get('content')
        content_type = data.get('contentType', 'requirements')
        
        if not file_name or not content:
            return jsonify({'success': False, 'message': '缺少必要参数'}), 400
        
        # 构建文件路径
        file_path = os.path.join(CONTENT_DIR, file_name)
        
        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logger.info(f"需求文件已保存: {file_path}")
        
        return jsonify({
            'success': True,
            'message': '需求保存成功',
            'filePath': file_path
        })
        
    except Exception as e:
        logger.error(f"保存需求失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'保存失败: {str(e)}'
        }), 500

@app.route('/api/requirements/list', methods=['GET'])
def list_requirements():
    """获取需求列表"""
    try:
        requirements = []
        
        # 读取所有需求文件
        if os.path.exists(CONTENT_DIR):
            for filename in os.listdir(CONTENT_DIR):
                if filename.endswith('.md') and filename.startswith('REQ-'):
                    file_path = os.path.join(CONTENT_DIR, filename)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # 解析front matter
                        requirement = parse_front_matter(content)
                        if requirement:
                            requirements.append(requirement)
                    except Exception as e:
                        logger.warning(f"读取需求文件失败 {filename}: {str(e)}")
        
        # 按时间排序
        requirements.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'data': requirements,
            'count': len(requirements)
        })
        
    except Exception as e:
        logger.error(f"获取需求列表失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'获取需求列表失败: {str(e)}'
        }), 500

def parse_front_matter(content):
    """解析Markdown文件的front matter"""
    try:
        lines = content.split('\n')
        if not lines[0].strip() == '---':
            return None
        
        front_matter = {}
        i = 1
        while i < len(lines) and lines[i].strip() != '---':
            line = lines[i].strip()
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip().strip('"\'')
                front_matter[key] = value
            i += 1
        
        # 提取正文
        body_start = i + 1
        body = '\n'.join(lines[body_start:]).strip()
        
        # 构建需求对象
        requirement = {
            'id': front_matter.get('requirement_id', ''),
            'timestamp': front_matter.get('date', ''),
            'status': front_matter.get('status', 'active'),
            'productType': front_matter.get('product_type', ''),
            'contactName': front_matter.get('contact_name', ''),
            'companyName': front_matter.get('company_name', ''),
            'region': front_matter.get('region', ''),
            'budget': front_matter.get('budget', ''),
            'description': extract_description(body),
            'probeDiameter': front_matter.get('probe_diameter', ''),
            'workingLength': front_matter.get('working_length', ''),
            'viewingDirection': front_matter.get('viewing_direction', ''),
            'resolution': front_matter.get('resolution', ''),
            'fieldOfView': front_matter.get('field_of_view', ''),
            'opticalSystem': front_matter.get('optical_system', ''),
            'lightSource': front_matter.get('light_source', ''),
            'specialFeatures': front_matter.get('special_features', ''),
            'flexibility': front_matter.get('flexibility', ''),
            'guidance': front_matter.get('guidance', '')
        }
        
        return requirement
        
    except Exception as e:
        logger.warning(f"解析front matter失败: {str(e)}")
        return None

def extract_description(body):
    """从正文中提取需求描述"""
    try:
        lines = body.split('\n')
        for i, line in enumerate(lines):
            if '## 需求描述' in line and i + 2 < len(lines):
                return lines[i + 2].strip()
        return body[:200] + '...' if len(body) > 200 else body
    except:
        return ''

@app.route('/api/requirements/<req_id>', methods=['GET'])
def get_requirement(req_id):
    """获取单个需求详情"""
    try:
        file_path = os.path.join(CONTENT_DIR, f"{req_id}.md")
        
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'message': '需求不存在'
            }), 404
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        requirement = parse_front_matter(content)
        
        if not requirement:
            return jsonify({
                'success': False,
                'message': '需求数据解析失败'
            }), 500
        
        return jsonify({
            'success': True,
            'data': requirement
        })
        
    except Exception as e:
        logger.error(f"获取需求详情失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'获取需求详情失败: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def index():
    """根路径"""
    return jsonify({
        'message': 'Vision NDT 需求中心 API 服务',
        'version': '1.0.0',
        'endpoints': [
            'GET /health - 健康检查',
            'POST /api/save-content - 保存需求',
            'GET /api/requirements/list - 获取需求列表',
            'GET /api/requirements/<id> - 获取需求详情'
        ]
    })

if __name__ == '__main__':
    print(f"""
    🚀 Vision NDT 需求中心 API 服务启动
    
    服务地址: http://localhost:{PORT}
    健康检查: http://localhost:{PORT}/health
    需求列表: http://localhost:{PORT}/api/requirements/list
    
    按 Ctrl+C 停止服务
    """)
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=True,
        threaded=True
    )

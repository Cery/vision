#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的测试服务
"""

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': '图片抓取服务运行正常',
        'version': '1.0.0'
    })

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'success': True,
        'message': 'Python服务测试成功'
    })

if __name__ == '__main__':
    print("🚀 测试服务启动中...")
    print("📍 服务地址: http://localhost:5001")
    print("📖 测试接口:")
    print("  GET /api/health - 健康检查")
    print("  GET /api/test - 测试接口")
    print("⏹️  按 Ctrl+C 停止服务")
    print("")
    
    app.run(host='127.0.0.1', port=5001, debug=True, use_reloader=False)

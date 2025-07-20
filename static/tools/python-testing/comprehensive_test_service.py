#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vision NDT 综合测试服务
提供深度的Python后端测试功能
"""

import os
import sys
import json
import time
import asyncio
import logging
import traceback
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# 第三方库
try:
    from flask import Flask, request, jsonify, render_template_string
    from flask_cors import CORS
    import requests
    import psutil
    import pytest
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import aiohttp
    import asyncio
except ImportError as e:
    print(f"❌ 缺少依赖包: {e}")
    print("请运行: pip install -r requirements.txt")
    sys.exit(1)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class VisionNDTTester:
    """Vision NDT 综合测试器"""
    
    def __init__(self):
        self.base_url = "http://localhost:1313"
        self.api_base_url = "http://localhost:3000"
        self.python_service_url = "http://localhost:5000"
        self.test_results = {}
        self.driver = None
        
    async def initialize_browser(self):
        """初始化浏览器驱动"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')  # 无头模式
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            logger.info("✅ 浏览器驱动初始化成功")
            return True
        except Exception as e:
            logger.error(f"❌ 浏览器驱动初始化失败: {e}")
            return False
    
    def cleanup_browser(self):
        """清理浏览器资源"""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    async def test_frontend_comprehensive(self) -> Dict[str, Any]:
        """全面前端测试"""
        logger.info("🔍 开始全面前端测试")
        results = {
            'category': 'frontend',
            'tests': [],
            'summary': {'passed': 0, 'failed': 0, 'total': 0}
        }
        
        # 测试页面列表
        pages = [
            {'name': '首页', 'url': '/'},
            {'name': '产品中心', 'url': '/products'},
            {'name': '资讯中心', 'url': '/news'},
            {'name': '需求中心', 'url': '/requirements'},
            {'name': '商务服务', 'url': '/cooperation'},
            {'name': '应用领域', 'url': '/applications'},
            {'name': '应用案例', 'url': '/cases'},
            {'name': '搜索页面', 'url': '/search'}
        ]
        
        if not await self.initialize_browser():
            return {'error': '浏览器初始化失败'}
        
        try:
            for page in pages:
                test_result = await self.test_single_page(page)
                results['tests'].append(test_result)
                results['summary']['total'] += 1
                if test_result['passed']:
                    results['summary']['passed'] += 1
                else:
                    results['summary']['failed'] += 1
        finally:
            self.cleanup_browser()
        
        return results
    
    async def test_single_page(self, page: Dict[str, str]) -> Dict[str, Any]:
        """测试单个页面"""
        start_time = time.time()
        test_result = {
            'name': page['name'],
            'url': page['url'],
            'passed': False,
            'load_time': 0,
            'errors': [],
            'metrics': {}
        }
        
        try:
            full_url = self.base_url + page['url']
            self.driver.get(full_url)
            
            # 等待页面加载
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            load_time = time.time() - start_time
            test_result['load_time'] = round(load_time * 1000)  # 转换为毫秒
            
            # 检查页面标题
            title = self.driver.title
            if not title or title == "":
                test_result['errors'].append("页面标题为空")
            
            # 检查是否有JavaScript错误
            logs = self.driver.get_log('browser')
            js_errors = [log for log in logs if log['level'] == 'SEVERE']
            if js_errors:
                test_result['errors'].extend([f"JS错误: {log['message']}" for log in js_errors])
            
            # 检查页面元素
            await self.check_page_elements(test_result)
            
            # 性能指标
            test_result['metrics'] = {
                'title': title,
                'url': self.driver.current_url,
                'page_size': len(self.driver.page_source),
                'load_time_ms': test_result['load_time']
            }
            
            test_result['passed'] = len(test_result['errors']) == 0
            
        except Exception as e:
            test_result['errors'].append(f"页面测试异常: {str(e)}")
            test_result['load_time'] = round((time.time() - start_time) * 1000)
        
        return test_result
    
    async def check_page_elements(self, test_result: Dict[str, Any]):
        """检查页面关键元素"""
        try:
            # 检查导航栏
            nav_elements = self.driver.find_elements(By.TAG_NAME, "nav")
            if not nav_elements:
                test_result['errors'].append("缺少导航栏")
            
            # 检查主要内容区域
            main_elements = self.driver.find_elements(By.TAG_NAME, "main")
            if not main_elements:
                # 如果没有main标签，检查是否有内容容器
                content_elements = self.driver.find_elements(By.CLASS_NAME, "container")
                if not content_elements:
                    test_result['errors'].append("缺少主要内容区域")
            
            # 检查图片是否正常加载
            images = self.driver.find_elements(By.TAG_NAME, "img")
            broken_images = []
            for img in images[:10]:  # 只检查前10张图片
                src = img.get_attribute("src")
                if src and not self.driver.execute_script(
                    "return arguments[0].complete && arguments[0].naturalHeight !== 0", img
                ):
                    broken_images.append(src)
            
            if broken_images:
                test_result['errors'].extend([f"图片加载失败: {src}" for src in broken_images])
                
        except Exception as e:
            test_result['errors'].append(f"元素检查异常: {str(e)}")
    
    async def test_backend_services(self) -> Dict[str, Any]:
        """测试后端服务"""
        logger.info("🔍 开始后端服务测试")
        results = {
            'category': 'backend',
            'tests': [],
            'summary': {'passed': 0, 'failed': 0, 'total': 0}
        }
        
        # API端点测试
        api_endpoints = [
            {'name': '健康检查', 'url': '/api/health', 'method': 'GET'},
            {'name': '产品列表', 'url': '/api/products/list', 'method': 'GET'},
            {'name': '媒体库', 'url': '/api/media/list', 'method': 'GET'},
            {'name': '搜索索引', 'url': '/index.json', 'method': 'GET'}
        ]
        
        for endpoint in api_endpoints:
            test_result = await self.test_api_endpoint(endpoint)
            results['tests'].append(test_result)
            results['summary']['total'] += 1
            if test_result['passed']:
                results['summary']['passed'] += 1
            else:
                results['summary']['failed'] += 1
        
        # Python服务测试
        python_test = await self.test_python_service()
        results['tests'].append(python_test)
        results['summary']['total'] += 1
        if python_test['passed']:
            results['summary']['passed'] += 1
        else:
            results['summary']['failed'] += 1
        
        return results
    
    async def test_api_endpoint(self, endpoint: Dict[str, str]) -> Dict[str, Any]:
        """测试API端点"""
        start_time = time.time()
        test_result = {
            'name': endpoint['name'],
            'url': endpoint['url'],
            'method': endpoint['method'],
            'passed': False,
            'response_time': 0,
            'status_code': 0,
            'errors': []
        }
        
        try:
            full_url = self.api_base_url + endpoint['url']
            async with aiohttp.ClientSession() as session:
                async with session.request(endpoint['method'], full_url) as response:
                    test_result['status_code'] = response.status
                    test_result['response_time'] = round((time.time() - start_time) * 1000)
                    
                    if response.status == 200:
                        try:
                            data = await response.json()
                            test_result['passed'] = True
                        except:
                            # 如果不是JSON，检查是否是有效响应
                            text = await response.text()
                            test_result['passed'] = len(text) > 0
                    else:
                        test_result['errors'].append(f"HTTP状态码: {response.status}")
                        
        except Exception as e:
            test_result['errors'].append(f"请求异常: {str(e)}")
            test_result['response_time'] = round((time.time() - start_time) * 1000)
        
        return test_result
    
    async def test_python_service(self) -> Dict[str, Any]:
        """测试Python抓取服务"""
        test_result = {
            'name': 'Python抓取服务',
            'url': self.python_service_url + '/api/health',
            'passed': False,
            'errors': []
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(test_result['url']) as response:
                    if response.status == 200:
                        test_result['passed'] = True
                    else:
                        test_result['errors'].append(f"Python服务响应异常: {response.status}")
        except Exception as e:
            test_result['errors'].append(f"Python服务连接失败: {str(e)}")
        
        return test_result
    
    async def test_performance_metrics(self) -> Dict[str, Any]:
        """性能测试"""
        logger.info("🔍 开始性能测试")
        results = {
            'category': 'performance',
            'tests': [],
            'summary': {'passed': 0, 'failed': 0, 'total': 0},
            'system_metrics': {}
        }
        
        # 系统性能指标
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            results['system_metrics'] = {
                'cpu_usage': cpu_percent,
                'memory_usage': memory.percent,
                'memory_available': memory.available,
                'disk_usage': disk.percent,
                'disk_free': disk.free
            }
        except Exception as e:
            logger.error(f"系统指标获取失败: {e}")
        
        # 页面性能测试
        performance_tests = [
            {'name': '首页加载性能', 'url': '/', 'threshold': 3000},
            {'name': '产品页面性能', 'url': '/products', 'threshold': 5000},
            {'name': 'API响应性能', 'url': '/api/products/list', 'threshold': 2000}
        ]
        
        for test in performance_tests:
            test_result = await self.test_page_performance(test)
            results['tests'].append(test_result)
            results['summary']['total'] += 1
            if test_result['passed']:
                results['summary']['passed'] += 1
            else:
                results['summary']['failed'] += 1
        
        return results
    
    async def test_page_performance(self, test: Dict[str, Any]) -> Dict[str, Any]:
        """测试页面性能"""
        start_time = time.time()
        test_result = {
            'name': test['name'],
            'url': test['url'],
            'threshold': test['threshold'],
            'passed': False,
            'load_time': 0,
            'errors': []
        }
        
        try:
            if test['url'].startswith('/api/'):
                # API性能测试
                full_url = self.api_base_url + test['url']
                async with aiohttp.ClientSession() as session:
                    async with session.get(full_url) as response:
                        load_time = round((time.time() - start_time) * 1000)
                        test_result['load_time'] = load_time
                        test_result['passed'] = load_time <= test['threshold'] and response.status == 200
                        if response.status != 200:
                            test_result['errors'].append(f"HTTP状态码: {response.status}")
            else:
                # 页面性能测试
                full_url = self.base_url + test['url']
                async with aiohttp.ClientSession() as session:
                    async with session.get(full_url) as response:
                        load_time = round((time.time() - start_time) * 1000)
                        test_result['load_time'] = load_time
                        test_result['passed'] = load_time <= test['threshold'] and response.status == 200
                        if response.status != 200:
                            test_result['errors'].append(f"HTTP状态码: {response.status}")
                            
        except Exception as e:
            test_result['errors'].append(f"性能测试异常: {str(e)}")
            test_result['load_time'] = round((time.time() - start_time) * 1000)
        
        return test_result

# Flask路由
@app.route('/')
def index():
    """服务首页"""
    return jsonify({
        'service': 'Vision NDT 综合测试服务',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': [
            'GET / - 服务信息',
            'GET /health - 健康检查',
            'POST /test/frontend - 前端测试',
            'POST /test/backend - 后端测试',
            'POST /test/performance - 性能测试',
            'POST /test/comprehensive - 全面测试'
        ]
    })

@app.route('/health')
def health():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'system': {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent
        }
    })

@app.route('/test/frontend', methods=['POST'])
async def test_frontend():
    """前端测试接口"""
    try:
        tester = VisionNDTTester()
        results = await tester.test_frontend_comprehensive()
        return jsonify(results)
    except Exception as e:
        logger.error(f"前端测试失败: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/test/backend', methods=['POST'])
async def test_backend():
    """后端测试接口"""
    try:
        tester = VisionNDTTester()
        results = await tester.test_backend_services()
        return jsonify(results)
    except Exception as e:
        logger.error(f"后端测试失败: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/test/performance', methods=['POST'])
async def test_performance():
    """性能测试接口"""
    try:
        tester = VisionNDTTester()
        results = await tester.test_performance_metrics()
        return jsonify(results)
    except Exception as e:
        logger.error(f"性能测试失败: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/test/comprehensive', methods=['POST'])
async def test_comprehensive():
    """全面测试接口"""
    try:
        tester = VisionNDTTester()
        
        # 并行执行各类测试
        frontend_task = tester.test_frontend_comprehensive()
        backend_task = tester.test_backend_services()
        performance_task = tester.test_performance_metrics()
        
        frontend_results, backend_results, performance_results = await asyncio.gather(
            frontend_task, backend_task, performance_task
        )
        
        # 汇总结果
        comprehensive_results = {
            'timestamp': datetime.now().isoformat(),
            'frontend': frontend_results,
            'backend': backend_results,
            'performance': performance_results,
            'summary': {
                'total_tests': (
                    frontend_results['summary']['total'] +
                    backend_results['summary']['total'] +
                    performance_results['summary']['total']
                ),
                'total_passed': (
                    frontend_results['summary']['passed'] +
                    backend_results['summary']['passed'] +
                    performance_results['summary']['passed']
                ),
                'total_failed': (
                    frontend_results['summary']['failed'] +
                    backend_results['summary']['failed'] +
                    performance_results['summary']['failed']
                )
            }
        }
        
        return jsonify(comprehensive_results)
        
    except Exception as e:
        logger.error(f"全面测试失败: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("""
    🚀 Vision NDT 综合测试服务启动
    
    服务地址: http://localhost:5002
    健康检查: http://localhost:5002/health
    
    API端点:
    - POST /test/frontend - 前端测试
    - POST /test/backend - 后端测试  
    - POST /test/performance - 性能测试
    - POST /test/comprehensive - 全面测试
    
    按 Ctrl+C 停止服务
    """)
    
    app.run(
        host='0.0.0.0',
        port=5002,
        debug=False,
        threaded=True
    )

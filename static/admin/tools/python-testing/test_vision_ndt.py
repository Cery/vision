#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vision NDT pytest测试套件
使用pytest框架进行结构化测试
"""

import pytest
import requests
import time
import yaml
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 加载测试配置
config_path = Path(__file__).parent / "test_config.yaml"
with open(config_path, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

class TestVisionNDT:
    """Vision NDT 测试类"""
    
    @pytest.fixture(scope="class")
    def browser(self):
        """浏览器fixture"""
        chrome_options = Options()
        if config['testing']['browser']['headless']:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument(f"--window-size={','.join(map(str, config['testing']['browser']['window_size']))}")
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(config['testing']['browser']['timeout'])
        
        yield driver
        driver.quit()
    
    @pytest.fixture(scope="class")
    def base_url(self):
        """基础URL fixture"""
        return config['services']['hugo_site']['url']
    
    @pytest.fixture(scope="class")
    def api_base_url(self):
        """API基础URL fixture"""
        return config['services']['api_server']['url']

class TestFrontendPages(TestVisionNDT):
    """前端页面测试"""
    
    @pytest.mark.parametrize("page", config['test_pages'])
    def test_page_loads(self, browser, base_url, page):
        """测试页面是否正常加载"""
        url = base_url + page['url']
        start_time = time.time()
        
        browser.get(url)
        
        # 等待页面加载
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        load_time = (time.time() - start_time) * 1000
        
        # 检查页面标题
        assert browser.title, f"页面 {page['name']} 标题为空"
        
        # 检查加载时间（仅对关键页面）
        if page.get('critical', False):
            assert load_time < config['testing']['performance']['page_load_threshold'], \
                f"页面 {page['name']} 加载时间过长: {load_time}ms"
        
        # 检查页面元素
        if 'elements' in page:
            for element in page['elements']:
                elements = browser.find_elements(By.CSS_SELECTOR, element['selector'])
                assert elements, f"页面 {page['name']} 缺少元素: {element['description']}"
    
    @pytest.mark.parametrize("page", [p for p in config['test_pages'] if p.get('critical', False)])
    def test_critical_page_performance(self, browser, base_url, page):
        """测试关键页面性能"""
        url = base_url + page['url']
        start_time = time.time()
        
        browser.get(url)
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        load_time = (time.time() - start_time) * 1000
        threshold = config['testing']['performance']['page_load_threshold']
        
        assert load_time < threshold, \
            f"关键页面 {page['name']} 性能不达标: {load_time}ms > {threshold}ms"
    
    def test_navigation_menu(self, browser, base_url):
        """测试导航菜单"""
        browser.get(base_url)
        
        # 检查主导航
        nav_elements = browser.find_elements(By.TAG_NAME, "nav")
        assert nav_elements, "缺少导航栏"
        
        # 检查主要菜单项
        menu_items = browser.find_elements(By.CSS_SELECTOR, "nav a")
        assert len(menu_items) >= 4, "主导航菜单项不足"
    
    def test_responsive_design(self, browser, base_url):
        """测试响应式设计"""
        # 测试不同屏幕尺寸
        screen_sizes = [
            (1920, 1080),  # 桌面
            (768, 1024),   # 平板
            (375, 667)     # 手机
        ]
        
        for width, height in screen_sizes:
            browser.set_window_size(width, height)
            browser.get(base_url)
            
            # 检查页面是否正常显示
            body = browser.find_element(By.TAG_NAME, "body")
            assert body.is_displayed(), f"页面在 {width}x{height} 分辨率下显示异常"

class TestAPIEndpoints(TestVisionNDT):
    """API端点测试"""
    
    @pytest.mark.parametrize("endpoint", config['api_endpoints'])
    def test_api_endpoint(self, api_base_url, endpoint):
        """测试API端点"""
        url = api_base_url + endpoint['url']
        method = endpoint.get('method', 'GET')
        expected_status = endpoint.get('expected_status', 200)
        
        start_time = time.time()
        
        if method == 'GET':
            response = requests.get(url, timeout=config['services']['api_server']['timeout'])
        elif method == 'POST':
            response = requests.post(url, timeout=config['services']['api_server']['timeout'])
        else:
            pytest.skip(f"不支持的HTTP方法: {method}")
        
        response_time = (time.time() - start_time) * 1000
        
        # 检查状态码
        assert response.status_code == expected_status, \
            f"API {endpoint['name']} 状态码错误: {response.status_code} != {expected_status}"
        
        # 检查响应时间
        threshold = config['testing']['performance']['api_response_threshold']
        if endpoint.get('critical', False):
            assert response_time < threshold, \
                f"API {endpoint['name']} 响应时间过长: {response_time}ms > {threshold}ms"
        
        # 检查响应内容
        if 'response_checks' in endpoint:
            for check in endpoint['response_checks']:
                if check['type'] == 'json':
                    data = response.json()
                    assert check['key'] in data, f"API响应缺少字段: {check['key']}"
                elif check['type'] == 'json_array':
                    data = response.json()
                    assert isinstance(data, list), "API响应不是数组"
                    if 'min_length' in check:
                        assert len(data) >= check['min_length'], \
                            f"API响应数组长度不足: {len(data)} < {check['min_length']}"
    
    def test_api_health_check(self, api_base_url):
        """测试API健康检查"""
        response = requests.get(f"{api_base_url}/api/health", timeout=5)
        assert response.status_code == 200, "API健康检查失败"
        
        # 如果返回JSON，检查状态
        try:
            data = response.json()
            if 'status' in data:
                assert data['status'] in ['ok', 'healthy'], f"API状态异常: {data['status']}"
        except:
            # 如果不是JSON响应，只要状态码正确就行
            pass

class TestToolPages(TestVisionNDT):
    """工具页面测试"""
    
    @pytest.mark.parametrize("tool", config['tool_pages'])
    def test_tool_page_loads(self, browser, base_url, tool):
        """测试工具页面加载"""
        url = base_url + tool['url']
        browser.get(url)
        
        # 等待页面加载
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # 检查页面标题
        assert browser.title, f"工具页面 {tool['name']} 标题为空"
        
        # 检查是否有JavaScript错误
        logs = browser.get_log('browser')
        severe_errors = [log for log in logs if log['level'] == 'SEVERE']
        assert not severe_errors, f"工具页面 {tool['name']} 有严重JavaScript错误"
    
    def test_tools_index_page(self, browser, base_url):
        """测试工具首页"""
        browser.get(f"{base_url}/tools/")
        
        # 检查工具卡片
        tool_cards = browser.find_elements(By.CSS_SELECTOR, ".tool-card")
        assert len(tool_cards) >= 3, "工具首页显示的工具数量不足"

class TestPerformance(TestVisionNDT):
    """性能测试"""
    
    @pytest.mark.parametrize("test", config['performance_tests'])
    def test_performance_metrics(self, base_url, api_base_url, test):
        """测试性能指标"""
        if test['url'].startswith('/api/'):
            url = api_base_url + test['url']
        else:
            url = base_url + test['url']
        
        start_time = time.time()
        response = requests.get(url, timeout=30)
        response_time = (time.time() - start_time) * 1000
        
        assert response.status_code == 200, f"性能测试页面 {test['name']} 加载失败"
        assert response_time < test['threshold'], \
            f"性能测试 {test['name']} 不达标: {response_time}ms > {test['threshold']}ms"

class TestSecurity(TestVisionNDT):
    """安全测试"""
    
    def test_security_headers(self, base_url):
        """测试安全响应头"""
        response = requests.get(base_url)
        headers = response.headers
        
        # 检查基本安全头
        security_headers = [
            'X-Content-Type-Options',
            'X-Frame-Options'
        ]
        
        missing_headers = []
        for header in security_headers:
            if header not in headers:
                missing_headers.append(header)
        
        # 允许缺少一些安全头，但不能全部缺少
        assert len(missing_headers) < len(security_headers), \
            f"缺少重要安全响应头: {missing_headers}"
    
    def test_no_sensitive_info_exposure(self, base_url):
        """测试敏感信息泄露"""
        response = requests.get(base_url)
        content = response.text.lower()
        
        # 检查是否泄露敏感信息
        sensitive_patterns = [
            'password',
            'secret',
            'api_key',
            'database',
            'mysql',
            'mongodb'
        ]
        
        for pattern in sensitive_patterns:
            assert pattern not in content, f"页面可能泄露敏感信息: {pattern}"

# 测试运行配置
if __name__ == "__main__":
    # 运行测试并生成HTML报告
    pytest.main([
        __file__,
        "-v",
        "--html=test_reports/vision_ndt_test_report.html",
        "--self-contained-html",
        "--tb=short"
    ])

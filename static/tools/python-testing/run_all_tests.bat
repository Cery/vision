@echo off
chcp 65001 >nul
title Vision NDT 全面测试执行器

echo.
echo ========================================
echo   Vision NDT 全面自动化测试
echo ========================================
echo.

REM 创建测试报告目录
if not exist "test_reports" mkdir test_reports
if not exist "test_reports\screenshots" mkdir test_reports\screenshots

echo 📋 测试计划:
echo   1. 前端页面测试
echo   2. API接口测试  
echo   3. 工具页面测试
echo   4. 性能测试
echo   5. 安全测试
echo   6. 集成测试
echo.

REM 检查依赖
echo 🔍 检查测试环境...
python -c "import pytest, selenium, requests, yaml" >nul 2>&1
if errorlevel 1 (
    echo ❌ 测试依赖不完整，正在安装...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)
echo ✅ 测试环境就绪

echo.
echo 🚀 开始执行测试...
echo.

REM 设置测试开始时间
set start_time=%time%

REM 运行pytest测试套件
echo 📊 执行pytest测试套件...
python -m pytest test_vision_ndt.py -v ^
    --html=test_reports/pytest_report.html ^
    --self-contained-html ^
    --tb=short ^
    --maxfail=10 ^
    --durations=10

set pytest_result=%errorlevel%

echo.
echo 🔧 执行综合测试服务...

REM 启动综合测试服务（后台）
start /B python comprehensive_test_service.py

REM 等待服务启动
timeout /t 5 /nobreak >nul

REM 调用综合测试API
echo 📡 调用综合测试API...
python -c "
import requests
import json
import time

try:
    # 等待服务启动
    for i in range(10):
        try:
            response = requests.get('http://localhost:5002/health', timeout=5)
            if response.status_code == 200:
                break
        except:
            time.sleep(1)
    else:
        print('❌ 测试服务启动失败')
        exit(1)
    
    print('✅ 测试服务已启动')
    
    # 执行全面测试
    print('🔍 执行全面测试...')
    response = requests.post('http://localhost:5002/test/comprehensive', timeout=300)
    
    if response.status_code == 200:
        results = response.json()
        
        # 保存结果
        with open('test_reports/comprehensive_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # 显示摘要
        summary = results.get('summary', {})
        print(f'📊 测试摘要:')
        print(f'   总测试项: {summary.get(\"total_tests\", 0)}')
        print(f'   通过: {summary.get(\"total_passed\", 0)}')
        print(f'   失败: {summary.get(\"total_failed\", 0)}')
        
        if summary.get('total_failed', 0) > 0:
            exit(1)
    else:
        print(f'❌ 综合测试失败: {response.status_code}')
        exit(1)
        
except Exception as e:
    print(f'❌ 测试执行异常: {e}')
    exit(1)
"

set api_result=%errorlevel%

REM 停止测试服务
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Vision NDT 综合测试服务" >nul 2>&1

echo.
echo 📄 生成测试报告...

REM 生成Markdown报告
python -c "
import json
import os
from datetime import datetime

# 读取测试结果
try:
    with open('test_reports/comprehensive_results.json', 'r', encoding='utf-8') as f:
        results = json.load(f)
except:
    results = {'summary': {'total_tests': 0, 'total_passed': 0, 'total_failed': 0}}

# 生成Markdown报告
report_content = f'''# Vision NDT 自动化测试报告

## 测试概览

- **测试时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **总测试项**: {results['summary'].get('total_tests', 0)}
- **通过**: {results['summary'].get('total_passed', 0)}
- **失败**: {results['summary'].get('total_failed', 0)}
- **成功率**: {round(results['summary'].get('total_passed', 0) / max(results['summary'].get('total_tests', 1), 1) * 100, 2)}%

## 测试结果

### 前端测试
{results.get('frontend', {}).get('summary', {})}

### 后端测试  
{results.get('backend', {}).get('summary', {})}

### 性能测试
{results.get('performance', {}).get('summary', {})}

## 报告文件

- [pytest测试报告](pytest_report.html)
- [综合测试结果](comprehensive_results.json)

---
*报告生成时间: {datetime.now().isoformat()}*
'''

with open('test_reports/test_summary.md', 'w', encoding='utf-8') as f:
    f.write(report_content)

print('✅ 测试报告已生成')
"

echo.
echo ========================================
echo   测试执行完成
echo ========================================

REM 计算执行时间
set end_time=%time%

echo.
echo 📊 测试结果摘要:
if %pytest_result% EQU 0 (
    echo   ✅ pytest测试: 通过
) else (
    echo   ❌ pytest测试: 失败
)

if %api_result% EQU 0 (
    echo   ✅ 综合测试: 通过  
) else (
    echo   ❌ 综合测试: 失败
)

echo.
echo 📁 测试报告位置:
echo   - test_reports\pytest_report.html
echo   - test_reports\comprehensive_results.json
echo   - test_reports\test_summary.md

echo.
if %pytest_result% EQU 0 if %api_result% EQU 0 (
    echo 🎉 所有测试通过！
    set overall_result=0
) else (
    echo ⚠️  部分测试失败，请查看详细报告
    set overall_result=1
)

echo.
echo 按任意键打开测试报告...
pause >nul

REM 打开测试报告
if exist "test_reports\pytest_report.html" (
    start test_reports\pytest_report.html
)

exit /b %overall_result%

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片抓取服务测试脚本
用于验证抓取功能是否正常工作
"""

import requests
import json

def test_service():
    """测试服务是否正常运行"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ 服务运行正常")
            return True
        else:
            print("❌ 服务响应异常")
            return False
    except Exception as e:
        print(f"❌ 服务连接失败: {e}")
        return False

def test_crawl():
    """测试图片抓取功能"""
    test_url = "https://httpbin.org/html"  # 测试用的HTML页面
    
    try:
        response = requests.post('http://localhost:5000/api/crawl', 
                               json={
                                   'url': test_url,
                                   'filters': {
                                       'format': 'all',
                                       'min_size': 50
                                   }
                               },
                               timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print(f"✅ 抓取测试成功，找到 {result['total']} 张图片")
                return True
            else:
                print(f"❌ 抓取失败: {result.get('error', '未知错误')}")
                return False
        else:
            print("❌ 抓取请求失败")
            return False
            
    except Exception as e:
        print(f"❌ 抓取测试失败: {e}")
        return False

def main():
    print("图片抓取服务测试")
    print("=" * 30)
    
    # 测试服务状态
    print("\n1. 测试服务状态...")
    if not test_service():
        print("\n请先启动图片抓取服务：")
        print("双击运行 start_service.bat")
        return
    
    # 测试抓取功能
    print("\n2. 测试抓取功能...")
    if test_crawl():
        print("\n🎉 所有测试通过！服务工作正常。")
    else:
        print("\n⚠️ 抓取功能测试失败，请检查网络连接。")
    
    print("\n测试完成。")

if __name__ == '__main__':
    main()

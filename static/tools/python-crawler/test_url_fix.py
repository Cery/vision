#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试URL修复功能
"""

def fix_url_format(url):
    """修复URL格式，自动添加协议前缀"""
    if not url:
        return url
        
    url = url.strip()
    
    # 如果已经有协议，直接返回
    if url.startswith(('http://', 'https://')):
        return url
    
    # 如果以www开头，添加https://
    if url.startswith('www.'):
        return 'https://' + url
    
    # 如果看起来像域名，添加https://
    if '.' in url and not url.startswith(('ftp://', 'file://')):
        return 'https://' + url
    
    # 其他情况，默认添加https://
    return 'https://' + url

def test_url_fixes():
    """测试各种URL格式"""
    test_cases = [
        'www.vsndt.com',
        'vsndt.com',
        'https://www.vsndt.com',
        'http://www.vsndt.com',
        'example.org',
        'subdomain.example.com',
        'localhost:8080',
        '192.168.1.1',
        'ftp://files.example.com',
    ]
    
    print("URL修复功能测试")
    print("=" * 50)
    
    for original_url in test_cases:
        fixed_url = fix_url_format(original_url)
        print(f"原始: {original_url}")
        print(f"修复: {fixed_url}")
        print("-" * 30)

if __name__ == '__main__':
    test_url_fixes()

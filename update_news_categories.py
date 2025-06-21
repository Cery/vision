#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新资讯文件的分类和标签
"""

import os
import re
import random
import yaml
from pathlib import Path

# 定义新的分类选项
CATEGORIES = ["展会资讯", "行业资讯", "技术文章", "企业新闻"]

# 定义新的标签选项
TAGS = ["AI应用", "电子视频内窥镜", "光学内窥镜", "光纤内窥镜", 
        "新品发布", "技术创新", "智能识别", "工业展会"]

def parse_front_matter(content):
    """解析front matter"""
    # 匹配front matter (在---之间的内容)
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(pattern, content, re.DOTALL)
    
    if not match:
        return None, content
    
    front_matter_str = match.group(1)
    body = match.group(2)
    
    try:
        front_matter = yaml.safe_load(front_matter_str)
        return front_matter, body
    except yaml.YAMLError:
        return None, content

def generate_random_category():
    """随机生成一个分类"""
    return random.choice(CATEGORIES)

def generate_random_tags():
    """随机生成2-3个标签"""
    num_tags = random.randint(2, 3)
    return random.sample(TAGS, num_tags)

def update_front_matter(front_matter):
    """更新front matter中的分类和标签"""
    if front_matter is None:
        return None
    
    # 更新分类 - 统一使用categories数组格式
    new_category = generate_random_category()
    front_matter['categories'] = [new_category]
    
    # 如果存在旧的category字段，删除它
    if 'category' in front_matter:
        del front_matter['category']
    
    # 更新标签
    front_matter['tags'] = generate_random_tags()
    
    return front_matter

def write_front_matter(front_matter, body):
    """将front matter和body重新组合"""
    if front_matter is None:
        return body
    
    # 将front matter转换为YAML字符串
    front_matter_str = yaml.dump(front_matter, 
                                default_flow_style=False, 
                                allow_unicode=True,
                                sort_keys=False)
    
    return f"---\n{front_matter_str}---\n{body}"

def update_news_file(file_path):
    """更新单个资讯文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        front_matter, body = parse_front_matter(content)
        
        if front_matter is None:
            print(f"警告: 无法解析 {file_path} 的front matter")
            return False
        
        # 更新front matter
        updated_front_matter = update_front_matter(front_matter)
        
        # 重新组合内容
        new_content = write_front_matter(updated_front_matter, body)
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"已更新: {file_path}")
        print(f"  新分类: {updated_front_matter['categories']}")
        print(f"  新标签: {updated_front_matter['tags']}")
        return True
        
    except Exception as e:
        print(f"错误: 更新 {file_path} 时出错: {e}")
        return False

def main():
    """主函数"""
    print("开始执行批量更新脚本...")

    news_dir = Path("content/news")
    print(f"检查目录: {news_dir.absolute()}")

    if not news_dir.exists():
        print("错误: content/news 目录不存在")
        return

    # 获取所有.md文件，排除_index.md
    md_files = [f for f in news_dir.glob("*.md") if f.name != "_index.md"]
    print(f"找到的文件: {[f.name for f in md_files]}")

    if not md_files:
        print("没有找到需要更新的资讯文件")
        return

    print(f"找到 {len(md_files)} 个资讯文件需要更新")
    print("开始批量更新...")
    print("-" * 50)

    success_count = 0
    for file_path in md_files:
        print(f"正在处理: {file_path.name}")
        if update_news_file(file_path):
            success_count += 1
        print("-" * 30)

    print(f"更新完成! 成功更新 {success_count}/{len(md_files)} 个文件")

if __name__ == "__main__":
    main()

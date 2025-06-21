#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证资讯文件更新结果
"""

import yaml
import re
from pathlib import Path

def main():
    news_dir = Path('content/news')
    md_files = [f for f in news_dir.glob('*.md') if f.name != '_index.md']

    categories_count = {}
    tags_count = {}

    print('更新后的分类和标签统计:')
    print('=' * 50)

    for file_path in md_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 解析front matter
        pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
        match = re.match(pattern, content, re.DOTALL)
        
        if match:
            front_matter_str = match.group(1)
            try:
                front_matter = yaml.safe_load(front_matter_str)
                
                # 统计分类
                if 'categories' in front_matter:
                    for cat in front_matter['categories']:
                        categories_count[cat] = categories_count.get(cat, 0) + 1
                
                # 统计标签
                if 'tags' in front_matter:
                    for tag in front_matter['tags']:
                        tags_count[tag] = tags_count.get(tag, 0) + 1
                        
                print(f'{file_path.name}:')
                print(f'  分类: {front_matter.get("categories", [])}')
                print(f'  标签: {front_matter.get("tags", [])}')
                print()
            except Exception as e:
                print(f'解析错误: {file_path.name} - {e}')

    print('分类统计:')
    for cat, count in categories_count.items():
        print(f'  {cat}: {count} 篇')

    print('\n标签统计:')
    for tag, count in tags_count.items():
        print(f'  {tag}: {count} 次')

if __name__ == "__main__":
    main()

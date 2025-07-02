#!/usr/bin/env python3
"""
更新资讯文件的封面图片
把所有资讯封面图交替更换为：news-1.jpeg、展会.webp、新闻.webp、行业资讯.png
"""

import os
import re
import glob

def update_news_images():
    # 定义封面图片列表
    cover_images = [
        "/images/news/news-1.jpeg",
        "/images/news/展会.webp", 
        "/images/news/新闻.webp",
        "/images/news/行业资讯.png"
    ]
    
    # 获取所有资讯文件
    news_files = glob.glob("content/news/*.md")
    # 排除 _index.md
    news_files = [f for f in news_files if not f.endswith('_index.md')]
    news_files.sort()  # 确保顺序一致
    
    print(f"找到 {len(news_files)} 个资讯文件")
    
    updated_count = 0
    
    for i, file_path in enumerate(news_files):
        # 选择封面图片（循环使用）
        cover_image = cover_images[i % len(cover_images)]
        
        try:
            # 读取文件内容
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查是否有 front matter
            if not content.startswith('---'):
                print(f"跳过 {file_path}：没有 front matter")
                continue
            
            # 分离 front matter 和内容
            parts = content.split('---', 2)
            if len(parts) < 3:
                print(f"跳过 {file_path}：front matter 格式错误")
                continue
            
            front_matter = parts[1]
            body_content = parts[2]
            
            # 更新或添加 featured_image
            if 'featured_image:' in front_matter:
                # 替换现有的 featured_image
                front_matter = re.sub(
                    r'featured_image:\s*["\']?[^"\'\n]*["\']?',
                    f'featured_image: "{cover_image}"',
                    front_matter
                )
            else:
                # 添加 featured_image（在 front matter 末尾）
                front_matter = front_matter.rstrip() + f'\nfeatured_image: "{cover_image}"\n'
            
            # 重新组合内容
            new_content = f"---{front_matter}---{body_content}"
            
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ 更新 {os.path.basename(file_path)} -> {cover_image}")
            updated_count += 1
            
        except Exception as e:
            print(f"❌ 处理 {file_path} 时出错: {e}")
    
    print(f"\n🎉 完成！共更新了 {updated_count} 个文件")
    
    # 显示图片分配统计
    print("\n📊 图片分配统计:")
    for i, image in enumerate(cover_images):
        count = len([f for j, f in enumerate(news_files) if j % len(cover_images) == i])
        print(f"  {image}: {count} 个文件")

if __name__ == "__main__":
    update_news_images()

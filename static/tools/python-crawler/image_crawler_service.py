#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片抓取服务
为图片处理工具提供后端支持，实现真正的网页图片抓取功能
"""

import os
import re
import json
import base64
import requests
from urllib.parse import urljoin, urlparse
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from bs4 import BeautifulSoup
from PIL import Image
import io
import tempfile
import zipfile
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

class ImageCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': USER_AGENT})
    
    def crawl_images_from_url(self, url, filters=None):
        """从指定URL抓取图片"""
        try:
            # 自动修复URL格式
            url = self._fix_url_format(url)

            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            images = []
            
            # 查找所有图片标签
            img_tags = soup.find_all('img')
            
            for img in img_tags:
                img_url = self._get_image_url(img, url)
                if img_url and self._is_valid_image_url(img_url):
                    image_info = self._get_image_info(img_url, img)
                    if image_info and self._passes_filters(image_info, filters):
                        images.append(image_info)
            
            return {
                'success': True,
                'images': images,
                'total': len(images)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'images': []
            }

    def _fix_url_format(self, url):
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
        if '.' in url and not any(url.startswith(prefix) for prefix in ['ftp://', 'file://', 'mailto:']):
            return 'https://' + url

        # 其他情况，默认添加https://
        return 'https://' + url

    def _get_image_url(self, img_tag, base_url):
        """获取图片URL"""
        # 尝试多种可能的图片URL属性
        for attr in ['src', 'data-src', 'data-original', 'data-lazy']:
            url = img_tag.get(attr)
            if url:
                return urljoin(base_url, url)
        return None
    
    def _is_valid_image_url(self, url):
        """验证是否为有效的图片URL"""
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return False
            
            # 检查文件扩展名
            path = parsed.path.lower()
            return any(path.endswith(ext) for ext in SUPPORTED_FORMATS) or '?' in path
        except:
            return False
    
    def _get_image_info(self, img_url, img_tag):
        """获取图片详细信息"""
        try:
            # 发送HEAD请求获取图片信息
            head_response = self.session.head(img_url, timeout=10)
            if head_response.status_code != 200:
                return None
            
            content_type = head_response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                return None
            
            content_length = head_response.headers.get('content-length')
            file_size = int(content_length) if content_length else 0
            
            # 如果文件太大，跳过
            if file_size > MAX_IMAGE_SIZE:
                return None
            
            # 获取图片尺寸（下载部分数据）
            width, height = self._get_image_dimensions(img_url)
            
            # 生成文件名
            filename = self._generate_filename(img_url)
            
            return {
                'url': img_url,
                'filename': filename,
                'alt': img_tag.get('alt', ''),
                'title': img_tag.get('title', ''),
                'width': width,
                'height': height,
                'size': file_size,
                'content_type': content_type,
                'size_text': self._format_file_size(file_size)
            }
            
        except Exception as e:
            print(f"获取图片信息失败 {img_url}: {e}")
            return None
    
    def _get_image_dimensions(self, img_url):
        """获取图片尺寸"""
        try:
            response = self.session.get(img_url, stream=True, timeout=10)
            response.raise_for_status()
            
            # 只读取前1024字节来获取尺寸
            img_data = b''
            for chunk in response.iter_content(chunk_size=1024):
                img_data += chunk
                if len(img_data) >= 1024:
                    break
            
            img = Image.open(io.BytesIO(img_data))
            return img.size
            
        except Exception:
            return 0, 0
    
    def _passes_filters(self, image_info, filters):
        """检查图片是否通过过滤条件"""
        if not filters:
            return True
        
        # 最小尺寸过滤
        min_size = filters.get('min_size', 0)
        if min_size > 0:
            if image_info['width'] < min_size and image_info['height'] < min_size:
                return False
        
        # 格式过滤
        format_filter = filters.get('format')
        if format_filter and format_filter != 'all':
            content_type = image_info['content_type']
            if format_filter == 'jpg' and 'jpeg' not in content_type:
                return False
            elif format_filter == 'png' and 'png' not in content_type:
                return False
            elif format_filter == 'webp' and 'webp' not in content_type:
                return False
        
        # 大图片过滤
        if filters.get('large_only'):
            if image_info['width'] < 200 or image_info['height'] < 200:
                return False
        
        return True
    
    def _generate_filename(self, url):
        """从URL生成文件名"""
        try:
            parsed = urlparse(url)
            filename = os.path.basename(parsed.path)
            if not filename or '.' not in filename:
                filename = f"image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            return filename
        except:
            return f"image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    
    def _format_file_size(self, size_bytes):
        """格式化文件大小"""
        if size_bytes == 0:
            return "未知大小"
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"

# 全局爬虫实例
crawler = ImageCrawler()

@app.route('/api/crawl', methods=['POST'])
def crawl_images():
    """抓取图片API"""
    try:
        data = request.get_json()
        url = data.get('url')
        filters = data.get('filters', {})
        
        if not url:
            return jsonify({'success': False, 'error': '请提供有效的URL'})
        
        result = crawler.crawl_images_from_url(url, filters)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/download', methods=['POST'])
def download_images():
    """下载图片API"""
    try:
        data = request.get_json()
        image_urls = data.get('urls', [])
        filenames = data.get('filenames', [])
        
        if not image_urls:
            return jsonify({'success': False, 'error': '没有提供图片URL'})
        
        # 创建临时zip文件
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(temp_dir, 'images.zip')
        
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for i, url in enumerate(image_urls):
                try:
                    response = crawler.session.get(url, timeout=30)
                    response.raise_for_status()
                    
                    filename = filenames[i] if i < len(filenames) else f"image_{i+1}.jpg"
                    zipf.writestr(filename, response.content)
                    
                except Exception as e:
                    print(f"下载图片失败 {url}: {e}")
                    continue
        
        return send_file(zip_path, as_attachment=True, download_name='images.zip')
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'ok', 'service': 'image-crawler'})

# 新增：单张图片下载到项目目录API
@app.route('/api/download-image', methods=['POST'])
def download_image_to_project():
    """下载单张图片到项目指定目录"""
    try:
        data = request.get_json()
        image_url = data.get('url')
        filename = data.get('filename')
        target_dir = data.get('targetDir', 'static/images/content')

        if not image_url or not filename:
            return jsonify({
                'success': False,
                'error': '缺少必要参数: url 和 filename'
            }), 400

        # 智能路径处理
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

        # 如果target_dir已经包含static，直接使用；否则相对于项目根目录
        if target_dir.startswith('static/'):
            full_target_dir = os.path.join(project_root, target_dir)
        elif os.path.isabs(target_dir):
            full_target_dir = target_dir
        else:
            full_target_dir = os.path.join(project_root, 'static', target_dir)

        # 确保目标目录存在
        os.makedirs(full_target_dir, exist_ok=True)

        # 下载图片
        crawler = ImageCrawler()
        response = crawler.session.get(image_url, timeout=30)
        response.raise_for_status()

        # 验证是否为图片
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('image/'):
            return jsonify({
                'success': False,
                'error': f'URL不是有效的图片: {content_type}'
            }), 400

        # 保存图片
        file_path = os.path.join(full_target_dir, filename)
        with open(file_path, 'wb') as f:
            f.write(response.content)

        # 智能生成Markdown路径
        if target_dir.startswith('static/'):
            # 如果是static目录，生成相对于网站根目录的路径
            relative_path = f"/{target_dir.replace('static/', '')}/{filename}"
        else:
            # 其他情况，保持原有逻辑
            relative_path = f"/{target_dir}/{filename}".replace('static/', '/')

        return jsonify({
            'success': True,
            'message': '图片下载成功',
            'localPath': relative_path,
            'filename': filename,
            'fullPath': file_path,
            'targetDir': full_target_dir,
            'size': len(response.content)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 新增：批量图片处理API
@app.route('/api/process-content-images', methods=['POST'])
def process_content_images():
    """处理内容中的所有图片"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        content_type = data.get('contentType', 'article')
        content_id = data.get('contentId', 'default')

        # 提取图片URL
        import re
        image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        images = re.findall(image_pattern, content)

        if not images:
            return jsonify({
                'success': True,
                'message': '没有找到需要处理的图片',
                'processedContent': content,
                'processedImages': []
            })

        processed_images = []
        processed_content = content

        # 确保目标目录存在
        target_dir = f'static/images/content/{content_type}'
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        full_target_dir = os.path.join(project_root, target_dir)
        os.makedirs(full_target_dir, exist_ok=True)

        crawler = ImageCrawler()

        for i, (alt_text, image_url) in enumerate(images):
            try:
                # 生成新文件名
                extension = os.path.splitext(urlparse(image_url).path)[1] or '.jpg'
                new_filename = f"{content_type}-{content_id}-{str(i+1).zfill(2)}{extension}"

                # 下载图片
                response = crawler.session.get(image_url, timeout=30)
                response.raise_for_status()

                # 保存图片
                file_path = os.path.join(full_target_dir, new_filename)
                with open(file_path, 'wb') as f:
                    f.write(response.content)

                # 生成新的Markdown路径
                new_path = f"/{target_dir}/{new_filename}".replace('static/', '/')

                # 替换内容中的图片路径
                old_markdown = f"![{alt_text}]({image_url})"
                new_markdown = f"![{alt_text}]({new_path})"
                processed_content = processed_content.replace(old_markdown, new_markdown)

                processed_images.append({
                    'originalUrl': image_url,
                    'newPath': new_path,
                    'filename': new_filename,
                    'alt': alt_text,
                    'size': len(response.content)
                })

            except Exception as e:
                print(f"处理图片失败 {image_url}: {e}")
                # 保持原始URL
                processed_images.append({
                    'originalUrl': image_url,
                    'newPath': image_url,
                    'filename': None,
                    'alt': alt_text,
                    'error': str(e)
                })

        return jsonify({
            'success': True,
            'message': f'成功处理 {len([img for img in processed_images if not img.get("error")])} 张图片',
            'processedContent': processed_content,
            'processedImages': processed_images,
            'totalImages': len(images)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    try:
        print("🚀 图片抓取服务启动中...")
        print("📍 服务地址: http://localhost:5000")
        print("📖 API文档:")
        print("  POST /api/crawl - 抓取图片")
        print("  POST /api/download - 下载图片")
        print("  POST /api/download-image - 下载单张图片到项目")
        print("  POST /api/process-content-images - 批量处理内容图片")
        print("  GET /api/health - 健康检查")
        print("🖼️  新增功能: 内容图片自动处理")
        print("⏹️  按 Ctrl+C 停止服务")
        print("")

        app.run(host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        print(f"❌ 服务启动失败: {e}")
        print("请检查:")
        print("1. 端口5000是否被占用")
        print("2. Python依赖是否完整安装")
        print("3. 防火墙设置")
        input("按回车键退出...")

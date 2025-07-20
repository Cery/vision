#!/bin/bash

echo "========================================"
echo "维森视觉检测仪器网站 - 开发环境启动"
echo "========================================"

echo ""
echo "检查 Hugo 是否可用..."
if command -v hugo &> /dev/null; then
    echo "✓ Hugo 已安装"
elif [ -f "./hugo.exe" ]; then
    echo "✓ Hugo 可执行文件已找到"
    HUGO_CMD="./hugo.exe"
else
    echo "✗ Hugo 未找到，请先安装 Hugo"
    exit 1
fi

echo ""
echo "检查 Node.js 依赖..."
if [ -d "node_modules" ]; then
    echo "✓ Node.js 依赖已安装"
else
    echo "正在安装 Node.js 依赖..."
    npm install
fi

echo ""
echo "启动开发服务器..."
echo ""

# 启动 Hugo 开发服务器
echo "启动 Hugo 开发服务器 (端口 1313)..."
if [ -n "$HUGO_CMD" ]; then
    $HUGO_CMD server -D --bind 0.0.0.0 &
else
    hugo server -D --bind 0.0.0.0 &
fi
HUGO_PID=$!

sleep 3

# 启动 Node.js 后端服务器
echo "启动 Node.js 后端服务器 (端口 3002)..."
node server.js &
NODE_PID=$!

sleep 2

echo ""
echo "========================================"
echo "开发环境已启动！"
echo "========================================"
echo ""
echo "前端网站: http://localhost:1313"
echo "CMS 管理: http://localhost:1313/admin"
echo "后端 API: http://localhost:3002"
echo ""
echo "按 Ctrl+C 停止所有服务器"

# 等待用户中断
trap "echo ''; echo '正在停止服务器...'; kill $HUGO_PID $NODE_PID 2>/dev/null; echo '服务器已停止'; exit 0" INT

# 保持脚本运行
wait

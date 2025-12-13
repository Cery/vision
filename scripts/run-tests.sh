#!/bin/bash
# Vision NDT 全业务流程测试启动脚本 (Linux/Mac)

echo "========================================"
echo "Vision NDT 全业务流程测试"
echo "========================================"
echo ""

# 检查环境
echo "[1/3] 检查测试环境..."

if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

if ! command -v hugo &> /dev/null; then
    echo "警告: 未找到 Hugo，将跳过前端测试"
fi

# 选择环境
echo "[2/3] 选择测试环境..."
echo "1. 本地开发环境 (localhost:8787)"
echo "2. 生产环境 (api.visndt.com)"
echo ""
read -p "请选择 (1 或 2): " choice

if [ "$choice" = "1" ]; then
    ENV="local"
    echo "使用本地环境测试"
elif [ "$choice" = "2" ]; then
    ENV="production"
    echo "使用生产环境测试"
else
    echo "无效选择，使用本地环境"
    ENV="local"
fi

echo ""
echo "[3/3] 运行测试..."
echo ""

# 获取脚本目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 运行测试
node test-full-workflow.js "$ENV"

echo ""
echo "========================================"
echo "测试完成"
echo "========================================"


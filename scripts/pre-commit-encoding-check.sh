#!/bin/bash

# Git pre-commit hook for encoding check
# 在提交前检查文件编码，确保所有文本文件都是UTF-8编码

set -e

echo "🔍 检查文件编码..."

# 获取暂存的文件
staged_files=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$staged_files" ]; then
    echo "✅ 没有暂存的文件需要检查"
    exit 0
fi

# 需要检查的文件扩展名
text_extensions=("html" "css" "js" "md" "yml" "yaml" "toml" "json" "svg" "txt")

# 检查函数
check_encoding() {
    local file="$1"
    
    # 检查文件是否存在
    if [ ! -f "$file" ]; then
        return 0
    fi
    
    # 获取文件扩展名
    extension="${file##*.}"
    extension=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
    
    # 检查是否是需要检查的文件类型
    if [[ ! " ${text_extensions[@]} " =~ " ${extension} " ]]; then
        return 0
    fi
    
    # 检查BOM
    if [ -f "$file" ]; then
        bom=$(head -c 3 "$file" | od -t x1 -A n | tr -d ' ')
        if [ "$bom" = "efbbbf" ]; then
            echo "❌ 文件包含BOM: $file"
            echo "   请运行: node scripts/fix-encoding.js"
            return 1
        fi
    fi
    
    # 检查是否为有效的UTF-8
    if ! iconv -f utf-8 -t utf-8 "$file" > /dev/null 2>&1; then
        echo "❌ 文件不是有效的UTF-8编码: $file"
        echo "   请运行: node scripts/fix-encoding.js"
        return 1
    fi
    
    return 0
}

# 检查所有暂存的文件
encoding_errors=0

for file in $staged_files; do
    if ! check_encoding "$file"; then
        encoding_errors=$((encoding_errors + 1))
    fi
done

if [ $encoding_errors -gt 0 ]; then
    echo ""
    echo "❌ 发现 $encoding_errors 个编码问题"
    echo "请修复编码问题后重新提交"
    echo ""
    echo "修复方法："
    echo "1. 运行编码修复工具: node scripts/fix-encoding.js"
    echo "2. 重新添加文件: git add ."
    echo "3. 重新提交: git commit"
    exit 1
fi

echo "✅ 所有文件编码检查通过"
exit 0

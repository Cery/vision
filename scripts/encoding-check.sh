#!/bin/bash

# VisNDT 项目编码一致性检查脚本
# 用于本地开发环境的编码验证

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查结果统计
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNING_CHECKS=0
FAILED_CHECKS=0

# 更新统计
update_stats() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    case $1 in
        "pass") PASSED_CHECKS=$((PASSED_CHECKS + 1)) ;;
        "warning") WARNING_CHECKS=$((WARNING_CHECKS + 1)) ;;
        "fail") FAILED_CHECKS=$((FAILED_CHECKS + 1)) ;;
    esac
}

# 检查文件编码
check_file_encoding() {
    log_info "检查文件编码..."
    
    local file_types=("*.html" "*.js" "*.css" "*.md" "*.json")
    local exclude_paths=("./node_modules" "./public" "./.git")
    
    for file_type in "${file_types[@]}"; do
        log_info "检查 $file_type 文件..."
        
        # 构建find命令的排除参数
        local exclude_args=""
        for exclude_path in "${exclude_paths[@]}"; do
            exclude_args="$exclude_args -not -path \"$exclude_path/*\""
        done
        
        # 查找并检查文件
        eval "find . -name \"$file_type\" $exclude_args" | while read -r file; do
            if [ -f "$file" ]; then
                if file "$file" | grep -q "UTF-8"; then
                    log_success "编码正确: $file"
                else
                    log_error "编码异常: $file"
                    update_stats "fail"
                fi
            fi
        done
    done
    
    update_stats "pass"
}

# 检查HTML meta标签
check_html_meta() {
    log_info "检查HTML meta标签..."
    
    # 检查charset声明
    if grep -r "charset" layouts/ static/ 2>/dev/null | grep -v "utf-8\|UTF-8"; then
        log_error "发现非UTF-8编码声明"
        update_stats "fail"
    else
        log_success "HTML charset声明正确"
        update_stats "pass"
    fi
    
    # 检查是否缺少charset声明
    find layouts/ -name "*.html" 2>/dev/null | while read -r file; do
        if ! grep -q "charset.*utf-8\|charset.*UTF-8" "$file"; then
            log_warning "文件可能缺少charset声明: $file"
            update_stats "warning"
        fi
    done
}

# 检查CSS编码声明
check_css_charset() {
    log_info "检查CSS编码声明..."
    
    if [ -d "static/css" ]; then
        find static/css/ -name "*.css" | while read -r file; do
            if ! head -1 "$file" | grep -q "@charset"; then
                log_warning "CSS文件缺少@charset声明: $file"
                update_stats "warning"
            else
                log_success "CSS编码声明正确: $file"
                update_stats "pass"
            fi
        done
    else
        log_warning "未找到CSS目录"
        update_stats "warning"
    fi
}

# 检查Hugo配置
check_hugo_config() {
    log_info "检查Hugo配置..."
    
    if [ -f "hugo.toml" ]; then
        # 检查语言配置
        if grep -q "languageCode.*zh" hugo.toml; then
            log_success "Hugo语言配置正确"
            update_stats "pass"
        else
            log_error "Hugo配置缺少中文语言设置"
            update_stats "fail"
        fi
        
        # 检查CJK语言支持
        if grep -q "hasCJKLanguage.*true" hugo.toml; then
            log_success "Hugo CJK语言支持已启用"
            update_stats "pass"
        else
            log_error "Hugo配置缺少CJK语言支持"
            update_stats "fail"
        fi
        
        # 检查默认内容语言
        if grep -q "defaultContentLanguage.*zh" hugo.toml; then
            log_success "Hugo默认内容语言配置正确"
            update_stats "pass"
        else
            log_warning "建议设置defaultContentLanguage为zh-cn"
            update_stats "warning"
        fi
    else
        log_error "未找到hugo.toml配置文件"
        update_stats "fail"
    fi
}

# 检查Netlify配置
check_netlify_config() {
    log_info "检查Netlify配置..."
    
    if [ -f "netlify.toml" ]; then
        # 检查环境变量
        if grep -q "LC_ALL.*UTF-8" netlify.toml; then
            log_success "Netlify编码环境变量配置正确"
            update_stats "pass"
        else
            log_warning "建议在netlify.toml中设置编码环境变量"
            update_stats "warning"
        fi
        
        # 检查HTTP头部设置
        if grep -q "charset=utf-8" netlify.toml; then
            log_success "Netlify HTTP头部编码设置正确"
            update_stats "pass"
        else
            log_warning "建议在netlify.toml中设置HTTP头部编码"
            update_stats "warning"
        fi
    else
        log_warning "未找到netlify.toml配置文件"
        update_stats "warning"
    fi
}

# 检查JavaScript编码处理
check_js_encoding() {
    log_info "检查JavaScript编码处理..."
    
    # 检查是否有编码处理函数
    if grep -r "encodeURIComponent\|decodeURIComponent\|normalize" static/js/ static/admin/ 2>/dev/null | head -1 > /dev/null; then
        log_success "发现JavaScript编码处理函数"
        update_stats "pass"
    else
        log_warning "建议添加JavaScript编码处理函数"
        update_stats "warning"
    fi
    
    # 检查JSON处理
    if grep -r "JSON.stringify\|JSON.parse" static/js/ static/admin/ 2>/dev/null | head -1 > /dev/null; then
        log_success "发现JSON处理代码"
        update_stats "pass"
    else
        log_warning "未发现JSON处理代码"
        update_stats "warning"
    fi
}

# 测试中文字符处理
test_chinese_handling() {
    log_info "测试中文字符处理..."
    
    # 创建临时测试文件
    cat > /tmp/test_chinese.js << 'EOF'
const testString = "维森视觉检测仪器 - 专业的工业内窥镜解决方案";

try {
    // 测试URL编码/解码
    const encoded = encodeURIComponent(testString);
    const decoded = decodeURIComponent(encoded);
    
    if (testString !== decoded) {
        console.error("中文字符编码/解码测试失败");
        process.exit(1);
    }
    
    // 测试JSON序列化
    const jsonString = JSON.stringify({ title: testString });
    const parsed = JSON.parse(jsonString);
    
    if (parsed.title !== testString) {
        console.error("中文字符JSON序列化测试失败");
        process.exit(1);
    }
    
    // 测试字符串标准化
    const normalized = testString.normalize('NFC');
    if (normalized !== testString) {
        console.log("字符串需要标准化");
    }
    
    console.log("中文字符处理测试通过");
    
} catch (error) {
    console.error("中文字符处理测试失败:", error.message);
    process.exit(1);
}
EOF
    
    if command -v node > /dev/null; then
        if node /tmp/test_chinese.js; then
            log_success "中文字符处理测试通过"
            update_stats "pass"
        else
            log_error "中文字符处理测试失败"
            update_stats "fail"
        fi
    else
        log_warning "未安装Node.js，跳过中文字符处理测试"
        update_stats "warning"
    fi
    
    # 清理临时文件
    rm -f /tmp/test_chinese.js
}

# 生成检查报告
generate_report() {
    log_info "生成检查报告..."
    
    local report_file="encoding_check_report.md"
    
    cat > "$report_file" << EOF
# 编码一致性检查报告

## 检查时间
$(date '+%Y-%m-%d %H:%M:%S')

## 检查统计
- 总检查项: $TOTAL_CHECKS
- 通过: $PASSED_CHECKS
- 警告: $WARNING_CHECKS  
- 失败: $FAILED_CHECKS

## 检查项目
- [x] 文件编码检查
- [x] HTML meta标签检查
- [x] CSS编码声明检查
- [x] Hugo配置检查
- [x] Netlify配置检查
- [x] JavaScript编码处理检查
- [x] 中文字符处理测试

## 环境信息
- 操作系统: $(uname -s)
- 语言环境: ${LANG:-未设置}
- 字符集: ${LC_ALL:-未设置}

## 文件统计
- HTML文件: $(find . -name "*.html" -not -path "./node_modules/*" -not -path "./public/*" 2>/dev/null | wc -l)
- JavaScript文件: $(find . -name "*.js" -not -path "./node_modules/*" -not -path "./public/*" 2>/dev/null | wc -l)
- CSS文件: $(find . -name "*.css" -not -path "./node_modules/*" -not -path "./public/*" 2>/dev/null | wc -l)
- Markdown文件: $(find . -name "*.md" -not -path "./node_modules/*" -not -path "./public/*" 2>/dev/null | wc -l)

## 建议
EOF

    if [ $FAILED_CHECKS -gt 0 ]; then
        echo "- ❌ 发现 $FAILED_CHECKS 个严重问题，需要立即修复" >> "$report_file"
    fi
    
    if [ $WARNING_CHECKS -gt 0 ]; then
        echo "- ⚠️  发现 $WARNING_CHECKS 个警告项，建议优化" >> "$report_file"
    fi
    
    if [ $FAILED_CHECKS -eq 0 ] && [ $WARNING_CHECKS -eq 0 ]; then
        echo "- ✅ 所有检查项目通过，编码配置良好" >> "$report_file"
    fi
    
    log_success "检查报告已生成: $report_file"
}

# 主函数
main() {
    echo "🌐 VisNDT 项目编码一致性检查"
    echo "================================"
    
    check_file_encoding
    check_html_meta
    check_css_charset
    check_hugo_config
    check_netlify_config
    check_js_encoding
    test_chinese_handling
    
    echo ""
    echo "📊 检查完成统计:"
    echo "总检查项: $TOTAL_CHECKS"
    echo "通过: $PASSED_CHECKS"
    echo "警告: $WARNING_CHECKS"
    echo "失败: $FAILED_CHECKS"
    
    generate_report
    
    # 返回适当的退出码
    if [ $FAILED_CHECKS -gt 0 ]; then
        log_error "检查发现严重问题，请修复后重新运行"
        exit 1
    elif [ $WARNING_CHECKS -gt 0 ]; then
        log_warning "检查发现警告项，建议优化"
        exit 0
    else
        log_success "所有检查项目通过！"
        exit 0
    fi
}

# 运行主函数
main "$@"

# LeanCloud 浏览次数统计问题排查指南

## 问题现象
- 浏览次数显示"网络错误"
- 控制台显示LeanCloud API连接失败
- Cloudflare阻止访问错误

## 解决方案

### 方案1：检查LeanCloud应用配置

1. **登录LeanCloud控制台**
   - 访问：https://console.leancloud.cn/
   - 或国际版：https://console.leancloud.app/

2. **检查应用信息**
   - 确认App ID：`pUEgNUJ66pc7S4FqVpqxkTkx-MdYXbMMI`
   - 确认App Key：`K9OXRf3L6Zp0s6TEzJElWQ5r`
   - 检查应用是否正常运行

3. **检查域名白名单**
   - 进入应用设置 → 安全中心
   - 添加域名：`localhost:1313`
   - 添加域名：您的实际域名

4. **检查数据存储权限**
   - 确认Counter表是否存在
   - 检查读写权限设置

### 方案2：更换LeanCloud服务器节点

当前使用的是国际版API：`lncldglobal.com`

如果网络不通，可以尝试：

1. **国内版API**（需要备案域名）
   ```javascript
   const API_BASE = 'https://pUEgNUJ66pc7S4FqVpqxkTkx.api.lncld.net/1.1/classes/Counter';
   ```

2. **华东节点**
   ```javascript
   const API_BASE = 'https://pUEgNUJ66pc7S4FqVpqxkTkx.api.lncldapi.com/1.1/classes/Counter';
   ```

### 方案3：使用代理或CDN

如果直接访问有问题，可以：

1. **使用代理服务**
2. **配置CDN加速**
3. **使用VPN访问**

### 方案4：替代统计服务

如果LeanCloud无法使用，推荐以下替代方案：

#### 4.1 使用免费的统计服务

1. **不蒜子统计**
   ```html
   <script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
   <span id="busuanzi_container_page_pv">
       本文总阅读量<span id="busuanzi_value_page_pv"></span>次
   </span>
   ```

2. **Google Analytics**
   - 免费且稳定
   - 功能强大
   - 需要Google账号

3. **百度统计**
   - 国内访问稳定
   - 免费使用
   - 功能完善

#### 4.2 自建统计服务

1. **使用GitHub Pages + GitHub API**
2. **使用Vercel + Vercel KV**
3. **使用Netlify Functions**

### 方案5：本地存储 + 定期同步

当前代码已实现本地存储备用方案：

```javascript
function initLocalPageViews() {
    // 使用localStorage存储浏览次数
    const storageKey = 'pageviews_' + currentPath.replace(/[^a-zA-Z0-9]/g, '_');
    let currentViews = parseInt(localStorage.getItem(storageKey) || '0');
    currentViews += 1;
    localStorage.setItem(storageKey, currentViews.toString());
    pageViewsElement.textContent = currentViews.toString();
}
```

## 推荐解决步骤

1. **立即解决**：当前代码已实现自动回退到本地存储
2. **短期解决**：检查LeanCloud配置，尝试不同API节点
3. **长期解决**：考虑迁移到更稳定的统计服务

## 测试方法

1. 打开浏览器开发者工具（F12）
2. 访问产品页面
3. 查看Console输出的详细错误信息
4. 查看Network面板的请求状态

## 常见错误及解决方法

### 错误1：CORS跨域问题
```
Access to fetch at 'https://...' from origin 'http://localhost:1313' has been blocked by CORS policy
```
**解决**：在LeanCloud控制台添加域名白名单

### 错误2：401 Unauthorized
```
HTTP 401: Unauthorized
```
**解决**：检查App ID和App Key是否正确

### 错误3：网络超时
```
TypeError: Failed to fetch
```
**解决**：检查网络连接，尝试其他API节点

### 错误4：Cloudflare阻止
```
Sorry, you have been blocked
```
**解决**：更换API节点或使用代理

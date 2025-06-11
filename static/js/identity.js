// 处理Netlify Identity
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}

// 检查URL中是否包含邀请或恢复令牌
document.addEventListener('DOMContentLoaded', function() {
  const hash = window.location.hash;
  if (hash && (hash.includes('invite_token=') || hash.includes('recovery_token='))) {
    // 如果包含令牌，重定向到identity-callback.html处理
    window.location.replace('/identity-callback.html' + hash);
  }
}); 
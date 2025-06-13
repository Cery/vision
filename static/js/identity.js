// 处理Netlify Identity
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    } else {
      // User is logged in
      window.netlifyIdentity.close();
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

  // Netlify Identity Widget Configuration
  if (window.netlifyIdentity) {
    // Ensure CMS is loaded after identity
    if (window.CMS) {
      window.CMS.init({
        config: {
          backend: {
            name: 'git-gateway',
            branch: 'master',
            repo: 'Cery/VisNDT',
            base_url: 'https://api.netlify.com'
          },
          local_backend: true,
          media_folder: 'static/images',
          public_folder: '/images'
        }
      });
    }
  }

  // Debug logging
  console.log('Netlify Identity and CMS initialization script loaded');
}); 
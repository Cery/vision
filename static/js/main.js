document.addEventListener('DOMContentLoaded', function() {
    // 搜索功能实现
    const searchIcon = document.querySelector('.search-icon');
    const searchBox = document.querySelector('.search-box');
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const searchTypeInput = document.querySelector('#search-type');
    
    let isSearchBoxOpen = false;
    
    // 切换搜索框显示/隐藏
    if (searchIcon) {
    searchIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (searchBox.classList.contains('active')) {
            // 如果搜索框已经打开，则关闭它
            searchBox.classList.remove('active');
            isSearchBoxOpen = false;
        } else {
            // 如果搜索框关闭，则打开它
            searchBox.classList.add('active');
            isSearchBoxOpen = true;
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        }
    });
    }
    
    // 点击页面其他区域关闭搜索框
    document.addEventListener('click', function(e) {
        if (searchBox && !e.target.closest('.search-container') && isSearchBoxOpen) {
            searchBox.classList.remove('active');
            isSearchBoxOpen = false;
        }
    });
    
    // 切换搜索标签
    if (searchTabs) {
    searchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有active类
            searchTabs.forEach(t => t.classList.remove('active'));
            // 给当前点击的标签添加active类
            this.classList.add('active');
                // 根据标签更新placeholder和隐藏的类型输入
            const tabType = this.getAttribute('data-tab');
                if (searchInput) {
            searchInput.placeholder = tabType === 'products' 
                ? '输入产品名称或型号...' 
                : '输入文章标题或关键词...';
                }
                if (searchTypeInput) {
                    searchTypeInput.value = tabType === 'products' ? 'products' : 'articles';
        }
    });
        });
        }
}); 
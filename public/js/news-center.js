let allNews = [];
let filteredNews = [];
let currentPage = 1;
const pageSize = 12;

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || '';
}

function getMultiParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) ? url.searchParams.get(name).split(',').filter(Boolean) : [];
}

function updateActiveStates() {
  const selectedCategories = getMultiParam('category');
  const selectedTags = getMultiParam('tags');
  const sortOrder = getQueryParam('sort') || 'date-desc';

  document.querySelectorAll('[data-filter-type="category"]').forEach(btn => {
    btn.classList.toggle('active', selectedCategories.includes(btn.getAttribute('data-filter-value')));
  });
  document.querySelectorAll('[data-filter-type="tag"]').forEach(btn => {
    btn.classList.toggle('active', selectedTags.includes(btn.getAttribute('data-filter-value')));
  });
  document.querySelectorAll('input[name="sortOrder"]').forEach(radio => {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    if (label) label.classList.toggle('active', radio.value === sortOrder);
    radio.checked = radio.value === sortOrder;
  });

  // 状态显示
  const catDisp = document.getElementById('current-category-display');
  if (catDisp) catDisp.textContent = selectedCategories.length > 0 ? `(已选择: ${selectedCategories.join(', ')})` : '';
  const tagDisp = document.getElementById('current-tags-display');
  if (tagDisp) tagDisp.textContent = selectedTags.length > 0 ? `(已选择: ${selectedTags.join(', ')})` : '';
}

function renderNewsList(news) {
  const container = document.getElementById('newsList');
  container.innerHTML = '';
  if (news.length === 0) {
    document.getElementById('no-news-message').style.display = 'block';
    return;
  }
  document.getElementById('no-news-message').style.display = 'none';
  news.forEach(item => {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4 news-item';
    card.innerHTML = `
      <div class="card h-100 shadow-sm news-card animate-fadein">
        <a href="${item.permalink}" class="text-decoration-none">
          <img src="${item.featured_image || 'https://picsum.photos/800/400?random=' + encodeURIComponent(item.title)}" class="card-img-top" alt="${item.title}" style="height: 200px; object-fit: cover;">
        </a>
        <div class="card-body d-flex flex-column">
          <div class="mb-2">
            ${(item.categories || []).map(cat => `<span class="badge rounded-pill bg-primary me-1">${cat}</span>`).join(' ')}
            ${(item.tags || []).map(tag => `<span class="badge bg-secondary rounded-pill me-1">${tag}</span>`).join(' ')}
          </div>
          <h5 class="card-title">
            <a href="${item.permalink}" class="text-dark text-decoration-none hover-primary">${item.title}</a>
          </h5>
          <p class="card-text text-muted">${item.summary || ''}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div>
              <small class="text-muted"><i class="far fa-calendar-alt me-1"></i>${item.date}</small>
              ${item.author ? `<small class="text-muted ms-2"><i class="far fa-user me-1"></i>${item.author}</small>` : ''}
            </div>
            <div>
              <small class="text-muted me-2"><i class="fas fa-eye"></i> <span class="view-count-display">${item.views}</span></small>
              <a href="${item.permalink}" class="btn btn-outline-primary btn-sm">
                <i class="fas fa-arrow-right me-1"></i>阅读更多
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderPagination(total, page, pageSize) {
  const container = document.getElementById('pagination');
  if (!container) return;
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  let html = `<ul class="pagination justify-content-center">`;
  html += `<li class="page-item${page === 1 ? ' disabled' : ''}">
    <a class="page-link" href="javascript:void(0)" onclick="goToPage(${page - 1})" aria-label="上一页">&laquo;</a>
  </li>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${i === page ? ' active' : ''}">
      <a class="page-link" href="javascript:void(0)" onclick="goToPage(${i})">${i}</a>
    </li>`;
  }
  html += `<li class="page-item${page === totalPages ? ' disabled' : ''}">
    <a class="page-link" href="javascript:void(0)" onclick="goToPage(${page + 1})" aria-label="下一页">&raquo;</a>
  </li>`;
  html += `</ul>`;
  container.innerHTML = html;
}

window.goToPage = function(page) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  window.history.pushState({}, '', url);
  applyFiltersAndSort();
}

function applyFiltersAndSort() {
  const selectedCategories = getMultiParam('category');
  const selectedTags = getMultiParam('tags');
  const sortOrder = getQueryParam('sort') || 'date-desc';
  currentPage = parseInt(getQueryParam('page') || '1', 10);

  filteredNews = allNews.filter(item => {
    let categoryMatch = selectedCategories.length === 0 || (item.categories || []).some(cat => selectedCategories.includes(cat));
    let tagsMatch = selectedTags.length === 0 || (item.tags || []).some(tag => selectedTags.includes(tag));
    return categoryMatch && tagsMatch;
  });

  filteredNews.sort((a, b) => {
    if (sortOrder === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortOrder === 'views') return b.views - a.views;
    return new Date(b.date) - new Date(a.date);
  });

  const total = filteredNews.length;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageNews = filteredNews.slice(start, end);

  renderNewsList(pageNews);
  renderPagination(total, currentPage, pageSize);
  updateActiveStates();
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/news/index.json')
    .then(res => res.json())
    .then(data => {
      allNews = data;
      applyFiltersAndSort();
    });

  document.querySelectorAll('[data-filter-type]').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.getAttribute('data-filter-type');
      const value = this.getAttribute('data-filter-value');
      const url = new URL(window.location.href);
      let arr = url.searchParams.get(type) ? url.searchParams.get(type).split(',').filter(Boolean) : [];
      if (arr.includes(value)) arr = arr.filter(t => t !== value);
      else arr.push(value);
      if (arr.length > 0) url.searchParams.set(type, arr.join(','));
      else url.searchParams.delete(type);
      url.searchParams.set('page', 1);
      window.history.pushState({}, '', url);
      applyFiltersAndSort();
    });
  });

  document.querySelectorAll('input[name="sortOrder"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', this.value);
      url.searchParams.set('page', 1);
      window.history.pushState({}, '', url);
      applyFiltersAndSort();
    });
  });

  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      window.history.pushState({}, '', window.location.pathname);
      applyFiltersAndSort();
    });
  }

  window.addEventListener('popstate', applyFiltersAndSort);
}); 
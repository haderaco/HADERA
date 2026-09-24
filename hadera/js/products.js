/* ==========================================================================
   HADÉRA — products.js (catalog page)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const { qs } = HADERA;
  const grid = qs('#catalog-grid');
  const resultCount = qs('#result-count');
  const loadMoreBtn = qs('#load-more');

  const PAGE_SIZE = 8;
  let currentPage = 1;
  let allResults = [];

  const params = new URLSearchParams(window.location.search);

  const state = {
    category: params.get('category') || '',
    location: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: '',
  };

  // sync desktop + mobile controls
  const controls = {
    category: [qs('#f-category'), qs('#fm-category')],
    location: [qs('#f-location'), qs('#fm-location')],
    minPrice: [qs('#f-min'), qs('#fm-min')],
    maxPrice: [qs('#f-max'), qs('#fm-max')],
  };
  Object.entries(controls).forEach(([key, [a, b]]) => {
    if (state[key]) { a.value = state[key]; b.value = state[key]; }
  });

  async function runQuery(resetPage = true) {
    if (resetPage) currentPage = 1;
    renderSkeletonGrid(grid, 8);
    allResults = await getProducts(state);
    resultCount.textContent = `${allResults.length} product${allResults.length === 1 ? '' : 's'} found`;
    renderPage();
  }

  function renderPage() {
    const visible = allResults.slice(0, currentPage * PAGE_SIZE);
    renderProductGrid(grid, visible);
    loadMoreBtn.style.display = visible.length < allResults.length ? 'inline-flex' : 'none';
  }

  loadMoreBtn.addEventListener('click', () => { currentPage++; renderPage(); });

  qs('#f-search').addEventListener('input', debounce((e) => { state.search = e.target.value; runQuery(); }, 300));
  qs('#f-sort').addEventListener('change', (e) => { state.sort = e.target.value; runQuery(); });
  qs('#f-category').addEventListener('change', (e) => { state.category = e.target.value; qs('#fm-category').value = e.target.value; runQuery(); });
  qs('#f-location').addEventListener('change', (e) => { state.location = e.target.value; qs('#fm-location').value = e.target.value; runQuery(); });
  qs('#f-min').addEventListener('input', debounce((e) => { state.minPrice = e.target.value; qs('#fm-min').value = e.target.value; runQuery(); }, 400));
  qs('#f-max').addEventListener('input', debounce((e) => { state.maxPrice = e.target.value; qs('#fm-max').value = e.target.value; runQuery(); }, 400));

  qs('#clear-filters').addEventListener('click', () => {
    state.category = ''; state.location = ''; state.minPrice = ''; state.maxPrice = '';
    ['#f-category', '#fm-category', '#f-location', '#fm-location'].forEach(s => qs(s).value = '');
    ['#f-min', '#fm-min', '#f-max', '#fm-max'].forEach(s => qs(s).value = '');
    runQuery();
  });

  // mobile bottom sheet
  const sheet = qs('#filters-sheet');
  const backdrop = qs('#sheet-backdrop');
  function openSheet() { sheet.classList.add('open'); backdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeSheet() { sheet.classList.remove('open'); backdrop.classList.remove('open'); document.body.style.overflow = ''; }
  qs('#open-filters').addEventListener('click', openSheet);
  qs('#close-sheet').addEventListener('click', closeSheet);
  backdrop.addEventListener('click', closeSheet);
  qs('#apply-sheet').addEventListener('click', () => {
    state.category = qs('#fm-category').value; qs('#f-category').value = state.category;
    state.location = qs('#fm-location').value; qs('#f-location').value = state.location;
    state.minPrice = qs('#fm-min').value; qs('#f-min').value = state.minPrice;
    state.maxPrice = qs('#fm-max').value; qs('#f-max').value = state.maxPrice;
    closeSheet();
    runQuery();
  });

  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  runQuery();
});

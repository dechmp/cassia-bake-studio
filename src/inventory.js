// ── Inventory Module ──────────────────────────────────────────────────────────
// Injected into the main page; renders a full-screen overlay panel.

const API = '/api/inventory';

const INGREDIENT_CATEGORIES = [
  'Dry Goods', 'Dairy', 'Eggs & Fats', 'Sweeteners',
  'Flavorings', 'Fruits & Nuts', 'Packaging', 'Other'
];
const PRODUCT_CATEGORIES = [
  'Breads', 'Tarts', 'Cakes', 'Desserts', 'Seasonal', 'Other'
];
const INGREDIENT_UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'dozen', 'tsp', 'tbsp'];
const PRODUCT_UNITS    = ['pcs', 'dozen', 'kg', 'box', 'slice'];

let inventory   = { ingredients: [], products: [] };
let activeTab   = 'ingredients';
let searchQuery = '';
let catFilter   = '';
let editingId   = null;

// ── Build overlay HTML ────────────────────────────────────────────────────────
function buildInventoryHTML() {
  return `
  <div class="inv-overlay" id="inv-overlay">
    <!-- Header -->
    <div class="inv-header">
      <div class="inv-header-left">
        <button class="inv-back-btn" id="inv-back-btn">← Back to Store</button>
        <span class="inv-page-title">Inventory</span>
      </div>
    </div>

    <!-- Body -->
    <div class="inv-body">

      <!-- Stats -->
      <div class="inv-stats">
        <div class="stat-card">
          <div class="stat-label">Ingredients</div>
          <div class="stat-value" id="stat-ingredients">—</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Final Products</div>
          <div class="stat-value" id="stat-products">—</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Low Stock</div>
          <div class="stat-value warn" id="stat-low">—</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Out of Stock</div>
          <div class="stat-value danger" id="stat-out">—</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="inv-tabs">
        <button class="inv-tab-btn active" data-tab="ingredients">Ingredients</button>
        <button class="inv-tab-btn" data-tab="products">Final Products</button>
      </div>

      <!-- Toolbar -->
      <div class="inv-toolbar">
        <input type="text" class="inv-search" id="inv-search" placeholder="Search items…">
        <select class="inv-cat-filter" id="inv-cat-filter">
          <option value="">All Categories</option>
        </select>
        <button class="inv-add-btn" id="inv-add-btn">+ Add Item</button>
      </div>

      <!-- Table -->
      <div class="inv-table-wrap" id="inv-table-wrap">
        <table class="inv-table">
          <thead><tr id="inv-thead"></tr></thead>
          <tbody id="inv-tbody"></tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div class="inv-empty" id="inv-empty" style="display:none">
        <p>No items found.</p>
        <button class="inv-empty-add" id="inv-empty-add">Add your first item</button>
      </div>

    </div>
  </div>

  <!-- Modal -->
  <div class="inv-modal-overlay" id="inv-modal-overlay">
    <div class="inv-modal">
      <div class="inv-modal-header">
        <h3 id="inv-modal-title">Add Ingredient</h3>
        <button class="inv-modal-close" id="inv-modal-close">×</button>
      </div>
      <form id="inv-item-form">
        <div class="inv-form-row">
          <div class="inv-form-group">
            <label>Item Name *</label>
            <input type="text" id="inv-f-name" required placeholder="e.g. All-Purpose Flour">
          </div>
          <div class="inv-form-group">
            <label>Category</label>
            <select id="inv-f-category"></select>
          </div>
        </div>
        <div class="inv-form-row">
          <div class="inv-form-group">
            <label>Current Quantity *</label>
            <input type="number" id="inv-f-qty" min="0" step="0.01" required placeholder="0">
          </div>
          <div class="inv-form-group">
            <label>Unit</label>
            <select id="inv-f-unit"></select>
          </div>
        </div>
        <div class="inv-form-row">
          <div class="inv-form-group">
            <label>Min Stock Alert</label>
            <input type="number" id="inv-f-min" min="0" step="0.01" placeholder="0">
          </div>
          <div class="inv-form-group">
            <label id="inv-price-label">Cost per Unit (₹)</label>
            <input type="number" id="inv-f-price" min="0" step="0.01" placeholder="0">
          </div>
        </div>
        <div class="inv-form-row">
          <div class="inv-form-group full">
            <label>Notes</label>
            <textarea id="inv-f-notes" placeholder="Optional notes…"></textarea>
          </div>
        </div>
        <div class="inv-modal-actions">
          <button type="button" class="inv-btn-cancel" id="inv-btn-cancel">Cancel</button>
          <button type="submit" class="inv-btn-save">Save Item</button>
        </div>
      </form>
    </div>
  </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStatus(item) {
  const qty = parseFloat(item.quantity) || 0;
  const min = parseFloat(item.minStock) || 0;
  if (qty === 0) return 'out';
  if (min > 0 && qty <= min) return 'low';
  return 'in';
}

function statusBadge(item) {
  const s = getStatus(item);
  const labels = { in: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };
  return `<span class="status-badge status-${s}">
    <span class="status-dot"></span>${labels[s]}
  </span>`;
}

function getFilteredItems() {
  let items = inventory[activeTab] || [];
  if (catFilter)   items = items.filter(i => i.category === catFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.notes || '').toLowerCase().includes(q)
    );
  }
  return items;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderAll() {
  renderStats();
  renderCatFilter();
  renderTable();
}

function renderStats() {
  const all = [...inventory.ingredients, ...inventory.products];
  document.getElementById('stat-ingredients').textContent = inventory.ingredients.length;
  document.getElementById('stat-products').textContent    = inventory.products.length;
  document.getElementById('stat-low').textContent = all.filter(i => getStatus(i) === 'low').length;
  document.getElementById('stat-out').textContent = all.filter(i => getStatus(i) === 'out').length;
}

function renderCatFilter() {
  const cats  = activeTab === 'ingredients' ? INGREDIENT_CATEGORIES : PRODUCT_CATEGORIES;
  const sel   = document.getElementById('inv-cat-filter');
  sel.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${c}"${c === catFilter ? ' selected' : ''}>${c}</option>`).join('');
}

function renderTable() {
  const items      = getFilteredItems();
  const isIngr     = activeTab === 'ingredients';
  const tableWrap  = document.getElementById('inv-table-wrap');
  const emptyEl    = document.getElementById('inv-empty');
  const thead      = document.getElementById('inv-thead');
  const tbody      = document.getElementById('inv-tbody');

  const headers = ['Name', 'Category', 'Quantity', 'Min Stock',
    isIngr ? 'Cost / Unit' : 'Selling Price', 'Status', ''];
  thead.innerHTML = headers.map(h => `<th>${h}</th>`).join('');

  if (items.length === 0) {
    tableWrap.style.display = 'none';
    emptyEl.style.display   = 'block';
    return;
  }
  tableWrap.style.display = 'block';
  emptyEl.style.display   = 'none';

  const rowClass = { in: '', low: 'row-low', out: 'row-out' };
  tbody.innerHTML = items.map(item => {
    const s          = getStatus(item);
    const priceField = isIngr ? item.costPerUnit : item.price;
    const priceStr   = priceField != null ? `₹${priceField}` : '—';

    return `<tr class="${rowClass[s]}" data-id="${item.id}">
      <td>
        <div class="item-name">${item.name}</div>
        ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
      </td>
      <td><span class="cat-badge">${item.category || '—'}</span></td>
      <td>${item.quantity}<span class="qty-unit">${item.unit || ''}</span></td>
      <td>${item.minStock || 0}<span class="qty-unit">${item.unit || ''}</span></td>
      <td>${priceStr}</td>
      <td>${statusBadge(item)}</td>
      <td class="actions-cell">
        <button class="inv-btn-icon edit" data-id="${item.id}" title="Edit">✎</button>
        <button class="inv-btn-icon del"  data-id="${item.id}" title="Delete">✕</button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.inv-btn-icon.edit').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.id))
  );
  tbody.querySelectorAll('.inv-btn-icon.del').forEach(btn =>
    btn.addEventListener('click', () => deleteItem(btn.dataset.id))
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(id = null) {
  editingId    = id;
  const isIngr = activeTab === 'ingredients';
  const cats   = isIngr ? INGREDIENT_CATEGORIES : PRODUCT_CATEGORIES;
  const units  = isIngr ? INGREDIENT_UNITS : PRODUCT_UNITS;

  document.getElementById('inv-modal-title').textContent =
    id ? `Edit ${isIngr ? 'Ingredient' : 'Product'}` : `Add ${isIngr ? 'Ingredient' : 'Product'}`;
  document.getElementById('inv-price-label').textContent =
    isIngr ? 'Cost per Unit (₹)' : 'Selling Price (₹)';

  const catSel  = document.getElementById('inv-f-category');
  const unitSel = document.getElementById('inv-f-unit');
  catSel.innerHTML  = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  unitSel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');

  if (id) {
    const item = inventory[activeTab].find(i => i.id === id);
    if (item) {
      document.getElementById('inv-f-name').value  = item.name || '';
      catSel.value  = item.category || cats[0];
      document.getElementById('inv-f-qty').value   = item.quantity ?? '';
      unitSel.value = item.unit || units[0];
      document.getElementById('inv-f-min').value   = item.minStock ?? '';
      document.getElementById('inv-f-price').value = isIngr ? (item.costPerUnit ?? '') : (item.price ?? '');
      document.getElementById('inv-f-notes').value = item.notes || '';
    }
  } else {
    document.getElementById('inv-item-form').reset();
    catSel.value  = cats[0];
    unitSel.value = units[0];
  }

  document.getElementById('inv-modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('inv-modal-overlay').classList.remove('open');
  editingId = null;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
async function fetchInventory() {
  try {
    const res = await fetch(API);
    inventory  = await res.json();
    renderAll();
  } catch {
    console.error('Could not connect to inventory API. Is the server running?');
  }
}

async function saveItem(e) {
  e.preventDefault();
  const isIngr = activeTab === 'ingredients';
  const body   = {
    name:      document.getElementById('inv-f-name').value.trim(),
    category:  document.getElementById('inv-f-category').value,
    quantity:  parseFloat(document.getElementById('inv-f-qty').value) || 0,
    unit:      document.getElementById('inv-f-unit').value,
    minStock:  parseFloat(document.getElementById('inv-f-min').value) || 0,
    notes:     document.getElementById('inv-f-notes').value.trim(),
    ...(isIngr
      ? { costPerUnit: parseFloat(document.getElementById('inv-f-price').value) || 0 }
      : { price:      parseFloat(document.getElementById('inv-f-price').value) || 0 })
  };

  const url    = editingId ? `${API}/${activeTab}/${editingId}` : `${API}/${activeTab}`;
  const method = editingId ? 'PUT' : 'POST';

  try {
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { closeModal(); await fetchInventory(); }
    else alert(data.error || 'Failed to save item');
  } catch {
    alert('Failed to reach the server.');
  }
}

async function deleteItem(id) {
  const item = inventory[activeTab].find(i => i.id === id);
  if (!confirm(`Delete "${item?.name}"? This cannot be undone.`)) return;

  try {
    const res  = await fetch(`${API}/${activeTab}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) await fetchInventory();
    else alert(data.error || 'Failed to delete item');
  } catch {
    alert('Failed to reach the server.');
  }
}

// ── Panel open / close ────────────────────────────────────────────────────────
function openInventory() {
  document.getElementById('inv-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  fetchInventory();
}

function closeInventory() {
  document.getElementById('inv-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initInventory() {
  // Inject HTML into DOM
  const container = document.createElement('div');
  container.innerHTML = buildInventoryHTML();
  document.body.appendChild(container);

  // Tab switching
  document.querySelectorAll('.inv-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      catFilter = '';
      document.querySelectorAll('.inv-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAll();
    });
  });

  // Search
  document.getElementById('inv-search').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderTable();
  });

  // Category filter
  document.getElementById('inv-cat-filter').addEventListener('change', e => {
    catFilter = e.target.value;
    renderTable();
  });

  // Add buttons
  document.getElementById('inv-add-btn').addEventListener('click', () => openModal());
  document.getElementById('inv-empty-add').addEventListener('click', () => openModal());

  // Modal controls
  document.getElementById('inv-modal-close').addEventListener('click', closeModal);
  document.getElementById('inv-btn-cancel').addEventListener('click', closeModal);
  document.getElementById('inv-modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('inv-modal-overlay')) closeModal();
  });

  // Form submit
  document.getElementById('inv-item-form').addEventListener('submit', saveItem);

  // Back button
  document.getElementById('inv-back-btn').addEventListener('click', closeInventory);

  // Trigger button wired up in main.js
  return { open: openInventory, close: closeInventory };
}

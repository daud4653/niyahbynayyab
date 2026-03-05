import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { apiRequest } from '../lib/api';
import { formatMoney, toNumberPrice } from '../utils/price';
import logo from '../assets/logo.jpeg';

const EMPTY_FORM = {
  name: '', category: '', tagline: '', color: '', description: '',
  price: '', inventory: '', currency: 'PKR', badge: '', images: [''], sizesText: '',
};

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Dashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('niyah_admin_token');
  const { products, loading, error, createProduct, updateProduct, deleteProduct, refreshProducts } = useProduct();

  const [tab, setTab] = useState('products');
  const [selectedId, setSelectedId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [productListFilter, setProductListFilter] = useState('all');
  const lowStockThreshold = 5;

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDraftStatus, setOrderDraftStatus] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!token) navigate('/');
    if (sessionStorage.getItem('niyah_admin_must_change') === '1') navigate('/change-password');
  }, [navigate, token]);

  useEffect(() => {
    if (!selectedId && products.length && !isCreatingNew) setSelectedId(products[0]._id);
  }, [products, selectedId, isCreatingNew]);

  const selectedProduct = useMemo(() => products.find((p) => p._id === selectedId) || null, [products, selectedId]);

  const filteredProducts = useMemo(() => {
    if (productListFilter !== 'low') return products;
    return products
      .filter((p) => typeof p.inventory === 'number' && p.inventory <= lowStockThreshold)
      .sort((a, b) => (a.inventory ?? Infinity) - (b.inventory ?? Infinity));
  }, [products, productListFilter]);

  const lowStockCount = useMemo(
    () => products.filter((p) => typeof p.inventory === 'number' && p.inventory <= lowStockThreshold).length,
    [products]
  );

  useEffect(() => {
    if (!selectedProduct) return;
    const imgs =
      Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
        ? selectedProduct.images
        : selectedProduct.image ? [selectedProduct.image] : [''];
    setForm({
      name: selectedProduct.name || '',
      category: selectedProduct.category || '',
      tagline: selectedProduct.tagline || '',
      color: selectedProduct.color || '',
      description: selectedProduct.description || '',
      price: String(selectedProduct.price ?? ''),
      inventory: selectedProduct.inventory ?? '',
      currency: selectedProduct.currency || 'PKR',
      badge: selectedProduct.badge || '',
      images: imgs,
      sizesText: Array.isArray(selectedProduct.sizes) ? selectedProduct.sizes.join(', ') : '',
    });
  }, [selectedProduct]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (orderStatusFilter !== 'all') params.set('status', orderStatusFilter);
    if (orderSearch.trim()) params.set('q', orderSearch.trim());
    const qs = params.toString();
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const data = await apiRequest(qs ? `/orders?${qs}` : '/orders', { token });
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      setOrderDraftStatus(list.reduce((acc, o) => { acc[o._id] = o.status; return acc; }, {}));
    } catch (err) {
      setOrdersError(err.message || 'Failed to load orders');
      if (/invalid|expired|missing/i.test(err.message || '')) handleLogout();
    } finally {
      setOrdersLoading(false);
    }
  }, [token, orderSearch, orderStatusFilter]);

  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const data = await apiRequest('/upload', { method: 'POST', token, body: formData });
      setForm((prev) => ({
        ...prev,
        images: [...prev.images.filter(Boolean), ...data.urls],
      }));
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function resetToNew() { setIsCreatingNew(true); setSelectedId(null); setForm(EMPTY_FORM); setSaved(''); setUploadError(''); }
  function handleChange(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setSaved(''); }
  function handleImageChange(idx, val) { setForm((p) => { const imgs = [...p.images]; imgs[idx] = val; return { ...p, images: imgs }; }); setSaved(''); }
  function addImageField() { setForm((p) => ({ ...p, images: [...p.images, ''] })); }
  function removeImageField(idx) { setForm((p) => { const imgs = p.images.filter((_, i) => i !== idx); return { ...p, images: imgs.length ? imgs : [''] }; }); }

  async function handleSave(e) {
    e.preventDefault();
    if (!token) return;
    const cleanImages = form.images.map((u) => u.trim()).filter(Boolean);
    const payload = {
      name: form.name, category: form.category, tagline: form.tagline, color: form.color,
      description: form.description, price: toNumberPrice(form.price),
      inventory: form.inventory === '' ? null : Number(form.inventory),
      currency: form.currency || 'PKR', badge: form.badge,
      images: cleanImages, image: cleanImages[0] || '',
      sizes: form.sizesText.split(',').map((s) => s.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      if (selectedId) {
        await updateProduct(selectedId, payload, token);
        setIsCreatingNew(false);
        setSaved('Product updated');
      } else {
        const created = await createProduct(payload, token);
        setIsCreatingNew(false);
        setSelectedId(created._id);
        setSaved('Product created');
      }
    } catch (err) {
      if (/invalid|expired|missing/i.test(err.message || '')) { handleLogout(); return; }
      setSaved(err.message || 'Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(''), 2500);
    }
  }

  async function handleDelete() {
    if (!token || !selectedId || !window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(selectedId, token);
      resetToNew();
      await refreshProducts();
      setSaved('Deleted');
      setTimeout(() => setSaved(''), 2500);
    } catch (err) {
      if (/invalid|expired|missing/i.test(err.message || '')) { handleLogout(); return; }
      setSaved(err.message || 'Delete failed');
      setTimeout(() => setSaved(''), 2500);
    }
  }

  async function handleUpdateOrderStatus(orderId) {
    if (!token || !orderId) return;
    const nextStatus = orderDraftStatus[orderId];
    if (!nextStatus) return;
    setUpdatingOrderId(orderId);
    try {
      await apiRequest(`/orders/${orderId}/status`, { method: 'PATCH', token, body: { status: nextStatus } });
      await loadOrders();
    } catch (err) {
      setOrdersError(err.message || 'Failed to update');
      if (/invalid|expired|missing/i.test(err.message || '')) handleLogout();
    } finally {
      setUpdatingOrderId(''); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      await apiRequest('/admin/change-password', { method: 'POST', token, body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword } });
      setPwSuccess('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('niyah_admin_token');
    sessionStorage.removeItem('niyah_admin_must_change');
    navigate('/');
  }

  const input = 'w-full font-body text-sm text-ink bg-cream border border-border rounded-xl px-4 py-2.5 outline-none transition-all focus:border-red-brand focus:ring-2 focus:ring-red-brand/10 placeholder:text-ink-muted';
  const lbl = 'block text-[11px] font-bold tracking-wide uppercase text-ink-muted mb-1.5';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-ink flex-col justify-between py-8 px-4 sticky top-0 h-screen">
        <div>
          <div className="mb-8 px-1">
            <img src={logo} alt="niyah" className="h-[80px] w-auto object-contain mix-blend-screen opacity-90 mb-2" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Admin Portal</p>
          </div>
          <nav className="space-y-1">
            {[['products', 'Products'], ['orders', 'Orders'], ['settings', 'Settings']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${tab === key ? 'bg-white/10 text-cream' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="space-y-1 px-1">
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="flex items-center w-full px-3 py-2 text-xs font-semibold text-white/40 hover:text-white/70 rounded-xl hover:bg-white/5 transition-colors">
            ← View Store
          </a>
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-xs font-semibold text-white/30 hover:text-red-300 rounded-xl hover:bg-red-brand/10 transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-cream p-4 sm:p-6 md:p-8">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-cream/95 backdrop-blur border-b border-border mb-4">
          <div className="flex items-center justify-between gap-3">
            <img src={logo} alt="niyah" className="h-[72px] w-auto object-contain mix-blend-multiply opacity-95" />
            <div className="flex items-center gap-1.5">
              {[['products', 'Products'], ['orders', 'Orders'], ['settings', '⚙']].map(([key, lbl]) => (
                <button key={key} onClick={() => setTab(key)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${tab === key ? 'bg-red-brand text-white' : 'bg-white border border-border text-ink'}`}>{lbl}</button>
              ))}
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-border text-ink">Out</button>
            </div>
          </div>
        </div>

        {/* Products */}
        {tab === 'products' && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
              <div>
                <h1 className="font-brand font-extrabold text-3xl text-ink">Products</h1>
                <p className="text-sm text-ink-muted mt-1">Create and manage your catalogue</p>
              </div>
              <button onClick={resetToNew} className="btn-red rounded-xl px-5 py-2.5 text-xs whitespace-nowrap">Add New Product</button>
            </div>

            <div className="grid xl:grid-cols-[280px_1fr] gap-6 items-start">
              <div className="bg-white rounded-2xl p-4 shadow-sm xl:max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-ink-muted">
                    All {lowStockCount > 0 && <span className="text-red-brand">({lowStockCount} low)</span>}
                  </p>
                  <select value={productListFilter} onChange={(e) => setProductListFilter(e.target.value)} className="select-field text-xs bg-cream border border-border rounded-xl px-3 py-1.5 font-semibold text-ink">
                    <option value="all">All</option>
                    <option value="low">Low stock</option>
                  </select>
                </div>
                {loading && <p className="text-sm text-ink-muted">Loading...</p>}
                {!loading && error && <p className="text-sm text-red-brand">{error}</p>}
                {!loading && !error && products.length === 0 && <p className="text-sm text-ink-muted">No products yet.</p>}
                <div className="space-y-2">
                  {filteredProducts.map((item) => {
                    const inv = item.inventory;
                    const isLow = typeof inv === 'number' && inv <= lowStockThreshold;
                    const isOut = typeof inv === 'number' && inv <= 0;
                    return (
                      <button key={item._id} onClick={() => { setIsCreatingNew(false); setSelectedId(item._id); }} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedId === item._id ? 'border-red-brand bg-red-light' : 'border-border bg-cream hover:border-ink-muted'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-ink truncate">{item.name}</p>
                            <p className="text-xs text-ink-muted mt-0.5">{formatMoney(item.price, item.currency)}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${isOut ? 'bg-red-brand text-white' : isLow ? 'bg-red-light text-red-brand border border-red-brand/20' : 'bg-white text-ink-muted border border-border'}`}>
                            {typeof inv === 'number' ? inv : '∞'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-brand font-bold text-base text-ink border-b border-border pb-3 mb-5">Basic Info</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="Product Name" name="name" value={form.name} onChange={handleChange} className={input} lbl={lbl} required />
                    <Field label="Category" name="category" value={form.category} onChange={handleChange} className={input} lbl={lbl} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="Tagline" name="tagline" value={form.tagline} onChange={handleChange} className={input} lbl={lbl} />
                    <Field label="Color / Variant" name="color" value={form.color} onChange={handleChange} className={input} lbl={lbl} />
                  </div>
                  <div>
                    <label className={lbl}>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${input} resize-vertical`} />
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-brand font-bold text-base text-ink border-b border-border pb-3 mb-5">Pricing & Label</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Price" name="price" value={form.price} onChange={handleChange} className={input} lbl={lbl} required />
                    <Field label="Inventory" name="inventory" value={form.inventory} onChange={handleChange} className={input} lbl={lbl} type="number" />
                    <Field label="Currency" name="currency" value={form.currency} onChange={handleChange} className={input} lbl={lbl} />
                    <Field label="Badge" name="badge" value={form.badge} onChange={handleChange} className={input} lbl={lbl} />
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-brand font-bold text-base text-ink border-b border-border pb-3 mb-5">Images & Sizes</h2>

                  {/* Upload area */}
                  <div className="mb-5">
                    <label className={lbl}>Product Images</label>
                    <p className="text-[11px] text-ink-muted mb-3">First image is the primary display image. Upload files or paste URLs.</p>

                    <label className={`relative flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-2xl py-6 px-4 cursor-pointer transition-colors ${uploading ? 'border-red-brand/40 bg-red-light/30' : 'border-border hover:border-red-brand/50 hover:bg-cream-dark/40'}`}>
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileUpload} disabled={uploading} />
                      {uploading ? (
                        <div className="flex items-center gap-2 text-red-brand">
                          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                          <span className="text-sm font-semibold">Uploading to Cloudinary...</span>
                        </div>
                      ) : (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <span className="text-sm font-semibold text-ink-mid">Click to upload images</span>
                          <span className="text-xs text-ink-muted">PNG, JPG, WEBP · up to 8 MB each · up to 10 at once</span>
                        </>
                      )}
                    </label>

                    {uploadError && (
                      <p className="mt-2 text-xs font-bold text-red-brand">{uploadError}</p>
                    )}
                  </div>

                  {/* Image list */}
                  {form.images.some(Boolean) && (
                    <div className="mb-5 space-y-2">
                      <p className="text-[11px] font-bold tracking-wide uppercase text-ink-muted">Uploaded / Linked Images</p>
                      {form.images.map((url, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <div className="flex-1 relative">
                            {idx === 0 && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-brand tracking-widest uppercase pointer-events-none">Primary</span>}
                            <input value={url} onChange={(e) => handleImageChange(idx, e.target.value)} type="url" placeholder="https://..." className={`${input} ${idx === 0 ? 'pl-[68px]' : ''}`} />
                          </div>
                          {url && <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />}
                          <button type="button" onClick={() => removeImageField(idx)} className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-ink-muted hover:text-red-brand border border-border rounded-xl hover:border-red-brand/40 transition-colors">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={addImageField} className="text-xs font-bold text-red-brand hover:text-red-hover flex items-center gap-1 transition-colors">+ Add URL manually</button>
                    </div>
                  )}

                  {!form.images.some(Boolean) && (
                    <div className="mb-5">
                      <button type="button" onClick={addImageField} className="text-xs font-bold text-red-brand hover:text-red-hover flex items-center gap-1 transition-colors">+ Add image URL manually</button>
                    </div>
                  )}

                  <div>
                    <label className={lbl}>Sizes (comma separated)</label>
                    <input name="sizesText" value={form.sizesText} onChange={handleChange} placeholder="XS, S, M, L, XL" className={input} />
                  </div>
                </section>

                <div className="flex items-center justify-end gap-4 pt-1">
                  {selectedId && (
                    <button type="button" onClick={handleDelete} className="px-5 py-3 rounded-xl text-sm font-semibold border border-red-brand text-red-brand hover:bg-red-light transition-colors">Delete</button>
                  )}
                  {saved && <span className={`text-sm font-bold ${saved.toLowerCase().includes('fail') || saved.toLowerCase().includes('error') ? 'text-red-brand' : 'text-ink-mid'}`}>{saved}</span>}
                  <button type="submit" disabled={saving} className="btn-red px-8 py-3 rounded-xl text-sm">
                    {saving ? 'Saving...' : selectedId ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <h1 className="font-brand font-extrabold text-3xl text-ink">Orders</h1>
                <p className="text-sm text-ink-muted mt-1">View and manage customer orders</p>
              </div>
              <button onClick={loadOrders} className="btn-outline rounded-xl px-5 py-2.5 text-xs">Refresh</button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 grid md:grid-cols-[1fr_200px_auto] gap-3 items-end">
              <div>
                <label className={lbl}>Search</label>
                <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Order ID, name, email..." className={input} />
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className={`${input} select-field`}>
                  <option value="all">All</option>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={loadOrders} className="btn-red rounded-xl px-5 py-2.5 text-xs">Apply</button>
            </div>

            {ordersLoading && <p className="text-ink-muted">Loading orders...</p>}
            {!ordersLoading && ordersError && <p className="text-red-brand font-semibold">{ordersError}</p>}
            {!ordersLoading && !ordersError && orders.length === 0 && <p className="text-ink-muted">No orders found.</p>}

            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order._id} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-wrap justify-between gap-4 mb-4">
                    <div><p className="text-xs font-bold tracking-wider uppercase text-ink-muted">Order ID</p><p className="font-mono text-sm text-ink">{order._id}</p></div>
                    <div><p className="text-xs font-bold tracking-wider uppercase text-ink-muted">Placed On</p><p className="text-sm text-ink">{new Date(order.createdAt).toLocaleString()}</p></div>
                    <div><p className="text-xs font-bold tracking-wider uppercase text-ink-muted">Total</p><p className="text-sm font-bold text-ink">{formatMoney(order.total, order.currency)}</p></div>
                    <div>
                      <p className="text-xs font-bold tracking-wider uppercase text-ink-muted">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <select value={orderDraftStatus[order._id] || order.status} onChange={(e) => setOrderDraftStatus((p) => ({ ...p, [order._id]: e.target.value }))} className="select-field text-sm bg-cream border border-border rounded-lg px-2.5 py-1.5">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => handleUpdateOrderStatus(order._id)} disabled={updatingOrderId === order._id} className="text-xs font-bold px-3 py-2 rounded-lg bg-red-brand text-white disabled:opacity-60">
                          {updatingOrderId === order._id ? '...' : 'Update'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="bg-cream rounded-xl p-4">
                      <p className="text-xs font-bold tracking-wider uppercase text-ink-muted mb-2">Customer</p>
                      <p className="font-semibold text-ink">{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-sm text-ink-mid">{order.customer.email}</p>
                      <p className="text-sm text-ink-mid">{order.customer.phone}</p>
                      <p className="text-sm text-ink-mid mt-1">{order.customer.address}, {order.customer.city}</p>
                      {order.customer.notes && <p className="text-sm text-ink-muted mt-2">Note: {order.customer.notes}</p>}
                    </div>
                    <div className="bg-cream rounded-xl p-4">
                      <p className="text-xs font-bold tracking-wider uppercase text-ink-muted mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={`${order._id}-${idx}`} className="flex justify-between gap-3 text-sm">
                            <p className="text-ink">{item.name} x{item.qty}{item.size ? ` (${item.size})` : ''}</p>
                            <p className="font-semibold text-ink">{formatMoney(item.qty * item.unitPrice, item.currency)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <>
            <div className="mb-8">
              <h1 className="font-brand font-extrabold text-3xl text-ink">Settings</h1>
              <p className="text-sm text-ink-muted mt-1">Manage your admin account</p>
            </div>
            <div className="max-w-lg">
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-brand font-bold text-base text-ink border-b border-border pb-3 mb-5">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className={lbl}>Current Password</label>
                    <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" autoComplete="current-password" required className={input} />
                  </div>
                  <div>
                    <label className={lbl}>New Password</label>
                    <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 8 characters" autoComplete="new-password" required className={input} />
                  </div>
                  <div>
                    <label className={lbl}>Confirm New Password</label>
                    <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" autoComplete="new-password" required className={input} />
                  </div>
                  {pwError && <div className="bg-red-light border border-red-brand/20 rounded-xl px-4 py-3"><p className="text-xs font-bold text-red-brand">{pwError}</p></div>}
                  {pwSuccess && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3"><p className="text-xs font-bold text-green-700">{pwSuccess}</p></div>}
                  <button type="submit" disabled={pwLoading} className="btn-red px-8 py-3 rounded-xl text-sm">
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', className, lbl, required = false }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <input name={name} value={value ?? ''} onChange={onChange} type={type} className={className} required={required} />
    </div>
  );
}

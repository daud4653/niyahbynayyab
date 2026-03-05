import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiRequest } from '../lib/api';

function formatPrice(num, currency = 'PKR') {
  return `${currency} ${num.toLocaleString('en-PK')}`;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentProof, setPaymentProof] = useState(null);
  const paymentProofInputRef = useRef(null);

  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;
  const currency = items[0]?.currency ?? 'PKR';

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined, submit: undefined }));
  }

  function handlePaymentMethodChange(e) {
    setPaymentMethod(e.target.value);
    setErrors((er) => ({ ...er, paymentMethod: undefined, paymentProof: undefined, submit: undefined }));
  }

  function handlePaymentProofChange(e) {
    const file = e.target.files?.[0] || null;
    setPaymentProof(file);
    setErrors((er) => ({ ...er, paymentProof: undefined, submit: undefined }));
  }

  function clearPaymentProof() {
    setPaymentProof(null);
    if (paymentProofInputRef.current) {
      paymentProofInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }

    if (!paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: 'Select a payment method' }));
      return;
    }

    if (!paymentProof) {
      setErrors((prev) => ({ ...prev, paymentProof: 'Upload a payment screenshot' }));
      return;
    }

    setLoading(true);
    try {
      const customer = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes,
      };

      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        size: item.size,
        qty: item.qty,
        unitPrice: item.priceNum,
        currency: item.currency,
      }));

      const payload = new FormData();
      payload.append('paymentMethod', paymentMethod);
      payload.append('paymentProof', paymentProof);
      payload.append('customer', JSON.stringify(customer));
      payload.append('items', JSON.stringify(orderItems));

      const orderResponse = await apiRequest('/orders', {
        method: 'POST',
        body: payload,
      });

      setPlacedOrder(orderResponse);
      clearCart();
      setPlaced(true);
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Order placement failed' }));
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <main className="min-h-screen pt-[88px] bg-cream flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-brand font-extrabold text-3xl text-ink mb-3">Order placed!</h1>
          <p className="text-ink-mid mb-2">
            Thank you, <strong>{form.firstName}</strong>. We received your order.
          </p>
          <p className="text-sm text-ink-muted mb-2">
            Order ID: <span className="font-semibold">{placedOrder?.id}</span>
          </p>
          <p className="text-sm text-ink-muted mb-10">
            Confirmation will be sent to <span className="font-semibold">{form.email}</span>.
          </p>
          <Link to="/" className="btn-red px-8 py-3.5">Back to Shop</Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-[88px] bg-cream flex items-center justify-center px-6">
        <div className="text-center py-20">
          <p className="font-brand font-bold text-2xl text-ink mb-3">Your bag is empty</p>
          <p className="text-ink-muted mb-8">Add items before checking out.</p>
          <Link to="/" className="btn-red">Go Shopping</Link>
        </div>
      </main>
    );
  }

  const inputClass = (field) =>
    `w-full font-body text-sm text-ink bg-cream border rounded-xl px-4 py-3 outline-none transition-all duration-150 focus:border-red-brand focus:ring-2 focus:ring-red-brand/10 placeholder:text-ink-muted ${
      errors[field] ? 'border-red-brand/60 bg-red-light/20' : 'border-border'
    }`;

  return (
    <main className="min-h-screen pt-[88px] bg-cream">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-red-brand transition-colors mb-4 uppercase tracking-widest">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Shop
          </Link>
          <h1 className="font-brand font-extrabold text-4xl text-ink">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-white rounded-3xl p-7 shadow-sm">
              <h2 className="font-brand font-bold text-lg text-ink mb-5">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" field="firstName" form={form} errors={errors} onChange={handleChange} inputClass={inputClass} />
                <Field label="Last Name" field="lastName" form={form} errors={errors} onChange={handleChange} inputClass={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Field label="Email" field="email" type="email" form={form} errors={errors} onChange={handleChange} inputClass={inputClass} />
                <Field label="Phone" field="phone" type="tel" form={form} errors={errors} onChange={handleChange} inputClass={inputClass} placeholder="+92..." />
              </div>
            </section>

            <section className="bg-white rounded-3xl p-7 shadow-sm">
              <h2 className="font-brand font-bold text-lg text-ink mb-5">Shipping Address</h2>
              <div className="space-y-4">
                <Field label="Street Address" field="address" form={form} errors={errors} onChange={handleChange} inputClass={inputClass} />
                <Field label="City" field="city" form={form} errors={errors} onChange={handleChange} inputClass={inputClass} />
                <div>
                  <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">Order Notes <span className="font-normal text-ink-muted">(optional)</span></label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special instructions?"
                    className={`${inputClass('notes')} resize-none`}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-7 shadow-sm">
              <h2 className="font-brand font-bold text-lg text-ink mb-2">Payment</h2>
              <p className="text-sm text-ink-muted mb-5">
                Choose a transfer method and upload a screenshot as proof of payment.
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-cream/60">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={handlePaymentMethodChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-ink">Bank account transfer</p>
                    <p className="text-xs text-ink-muted mt-1">Transfer via your bank app and upload the receipt screenshot.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-cream/60">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet_transfer"
                    checked={paymentMethod === 'wallet_transfer'}
                    onChange={handlePaymentMethodChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-ink">JazzCash / Easypaisa transfer</p>
                    <p className="text-xs text-ink-muted mt-1">Send payment via wallet transfer and upload the screenshot.</p>
                  </div>
                </label>

                {errors.paymentMethod && <p className="text-[11px] text-red-brand font-semibold">{errors.paymentMethod}</p>}

                <div className="pt-2">
                  <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">Payment proof screenshot</label>
                  <input
                    ref={paymentProofInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofChange}
                    className="hidden"
                    id="payment-proof-input"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="payment-proof-input"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white hover:bg-cream cursor-pointer text-sm text-ink"
                    >
                      Upload Screenshot
                    </label>
                    {paymentProof && (
                      <button
                        type="button"
                        onClick={clearPaymentProof}
                        className="px-3 py-2 rounded-xl text-xs font-semibold border border-red-brand/30 text-red-brand hover:bg-red-light"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {paymentProof && (
                    <p className="text-xs text-ink-muted mt-1">
                      Selected: <span className="font-semibold text-ink">{paymentProof.name}</span>
                    </p>
                  )}
                  {errors.paymentProof && <p className="text-[11px] text-red-brand mt-1 font-semibold">{errors.paymentProof}</p>}
                </div>
              </div>
            </section>

            {errors.submit && <p className="text-sm font-semibold text-red-brand">{errors.submit}</p>}

            <button type="submit" disabled={loading} className="btn-red w-full py-4 text-base rounded-2xl">
              {loading ? 'Placing Order...' : `Place Order - ${formatPrice(total, currency)}`}
            </button>
          </form>

          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-brand font-bold text-lg text-ink mb-5">Order Summary</h2>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.cartId} className="flex gap-3.5">
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-ink-muted text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-brand font-bold text-sm text-ink leading-tight">{item.name}</p>
                      {item.size && <p className="text-xs text-ink-muted mt-0.5">Size: {item.size}</p>}
                      <p className="font-brand font-bold text-sm text-ink mt-2">{formatPrice(item.priceNum * item.qty, item.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border mt-5 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-semibold text-ink">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-ink'}`}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping, currency)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border mt-4 pt-4 flex justify-between">
                <span className="font-brand font-bold text-base text-ink">Total</span>
                <span className="font-brand font-bold text-xl text-ink">{formatPrice(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, field, form, errors, onChange, inputClass, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">{label}</label>
      <input name={field} type={type} value={form[field]} onChange={onChange} placeholder={placeholder || label} className={inputClass(field)} />
      {errors[field] && <p className="text-[11px] text-red-brand mt-1 font-semibold">{errors[field]}</p>}
    </div>
  );
}

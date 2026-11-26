import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axiosInstance from '../../utils/axiosInstance';
import './PlanCheckout.css';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const IS_TEST_KEY = typeof RAZORPAY_KEY === 'string' && RAZORPAY_KEY.startsWith('rzp_test_');

// Same rules as the backend (PayerDetails.java)
const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;
const PHONE_REGEX = /^(\+91)?[6-9]\d{9}$/;

const UPI_HANDLES = ['@okaxis', '@okhdfcbank', '@oksbi', '@ybl', '@paytm', '@upi'];

const METHODS = [
  { id: 'upi', label: 'UPI', icon: 'bi-phone', hint: 'GPay, PhonePe, Paytm…' },
  { id: 'card', label: 'Card', icon: 'bi-credit-card-2-front', hint: 'Debit / Credit' },
  { id: 'netbanking', label: 'Net Banking', icon: 'bi-bank', hint: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: 'bi-wallet2', hint: 'Paytm, Mobikwik…' },
];

const METHOD_LABELS = Object.fromEntries(METHODS.map((m) => [m.id, m.label]));

const cleanPhone = (value) => (value || '').replace(/[\s-]/g, '');

const themedSwal = (options) => {
  const isDark = document.body.classList.contains('dark-mode');
  return Swal.fire({
    background: isDark ? '#1f2433' : '#fff',
    color: isDark ? '#f8f9fa' : '#212529',
    confirmButtonColor: '#6366f1',
    ...options,
  });
};

const copyToast = () => {
  const isDark = document.body.classList.contains('dark-mode');
  Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: isDark ? '#1f2433' : '#fff',
    color: isDark ? '#f8f9fa' : '#212529',
  }).fire({ icon: 'success', title: 'Token copied to clipboard' });
};

/**
 * Shared checkout for ADMIN and PROVIDER registration tokens.
 *
 * Step 1: the buyer enters name, email, mobile and payment method (with UPI ID for UPI).
 * Step 2: they pick a plan, which creates a Razorpay order; the payer details are stored with it.
 * Step 3: Razorpay opens prefilled with those details; on success the backend verifies the
 *         signature and returns the registration token.
 */
const PlanCheckout = ({
  role,
  variant = 'admin',
  badge,
  title,
  subtitle,
  plans,
  emailLabel,
  allowedDomains,
  checkoutName,
  checkoutDescription,
  confirmEndpoint,
  adminId,
  requireAdmin = false,
}) => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [result, setResult] = useState(null);
  const formik = useFormik({
    initialValues: { name: '', email: '', phone: '', method: 'upi', upiId: '' },
    validationSchema: Yup.object({
      name: Yup.string().trim().min(2, 'Enter your full name').max(100, 'Name is too long').required('Name is required'),
      email: Yup.string()
        .trim()
        .email('Invalid email address')
        .required('Email is required')
        .test('trusted-domain', `Use a trusted provider (${allowedDomains.slice(0, 3).join(', ')}…)`, (value) => {
          const domain = value?.split('@')[1]?.toLowerCase();
          return !!domain && allowedDomains.includes(domain);
        }),
      phone: Yup.string()
        .required('Mobile number is required')
        .test('phone', 'Enter a valid 10-digit Indian mobile number', (value) => PHONE_REGEX.test(cleanPhone(value))),
      method: Yup.string().oneOf(METHODS.map((m) => m.id)).required(),
      upiId: Yup.string()
        .trim()
        // Optional: saved with the payment record. Razorpay no longer accepts a typed UPI ID
        // (NPCI retired "UPI Collect" on 28 Feb 2026); the payer scans a QR code or uses a UPI app.
        .test('upi-format', 'Format: yourname@bank', (value) => !value || UPI_REGEX.test(value.trim())),
    }),
    onSubmit: () => {},
  });

  const { values, errors, touched } = formik;
  const detailsValid = formik.dirty && Object.keys(errors).length === 0;
  const fieldInvalid = (name) => touched[name] && errors[name];
  const upiValid = values.method === 'upi' && UPI_REGEX.test(values.upiId.trim());

  const applyHandle = (handle) => {
    const user = values.upiId.split('@')[0] || values.email.split('@')[0] || '';
    formik.setFieldValue('upiId', `${user}${handle}`);
    formik.setFieldTouched('upiId', true, false);
  };

  const touchAll = () =>
    formik.setTouched({ name: true, email: true, phone: true, method: true, upiId: true });

  const recordFailure = (orderId, error) => {
    axiosInstance
      .post('/payment/failed', null, {
        params: {
          orderId,
          paymentId: error?.metadata?.payment_id,
          reason: error?.description || error?.reason,
        },
      })
      .catch(() => { /* best effort; the order simply stays in CREATED state */ });
  };

  const handleBuy = async (plan) => {
    touchAll();
    const formErrors = await formik.validateForm();
    if (Object.keys(formErrors).length > 0) {
      themedSwal({ icon: 'warning', title: 'Check your details', text: Object.values(formErrors)[0] });
      return;
    }
    if (requireAdmin && !adminId) {
      themedSwal({ icon: 'error', title: 'Please log in again', text: 'Your admin session was not found.' });
      return;
    }
    if (!RAZORPAY_KEY || !window.Razorpay) {
      themedSwal({
        icon: 'error',
        title: 'Payments unavailable',
        text: !RAZORPAY_KEY
          ? 'VITE_RAZORPAY_KEY_ID is not configured in the frontend .env file.'
          : 'Could not load the Razorpay checkout. Check your internet connection and reload.',
      });
      return;
    }

    const email = values.email.trim();
    const name = values.name.trim();
    const phone = cleanPhone(values.phone);
    const upiId = values.method === 'upi' ? values.upiId.trim().toLowerCase() : '';

    setLoadingPlan(plan.tokenType);
    try {
      const { data } = await axiosInstance.post('/payment/create-order', null, {
        params: {
          email,
          role,
          tokenType: plan.tokenType,
          adminId: adminId || undefined,
          payerName: name,
          payerPhone: phone,
          upiId: upiId || undefined,
          preferredMethod: values.method,
        },
      });
      const { amount, orderId, currency } = data;

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY,
        amount: String(amount),
        currency,
        name: checkoutName,
        description: `${checkoutDescription} – ${plan.name}`,
        order_id: orderId,
        // Documented prefill keys are name, email, contact and method ("method" only works when
        // contact and email are also prefilled). Razorpay has no prefill for a UPI ID.
        prefill: {
          name,
          email,
          contact: phone.startsWith('+') ? phone : `+91${phone}`,
          method: values.method,
        },
        notes: { plan: plan.tokenType, ...(upiId ? { upiId } : {}) },
        // Show the method chosen on our page first; the other methods stay available below it
        config: {
          display: {
            blocks: {
              preferred: {
                name: `Pay using ${METHOD_LABELS[values.method]}`,
                instruments: [{ method: values.method }],
              },
            },
            sequence: ['block.preferred'],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: variant === 'provider' ? '#14b8a6' : '#6366f1' },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
        handler: async (response) => {
          try {
            const confirmRes = await axiosInstance.post(confirmEndpoint, null, {
              params: {
                orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                tokenType: plan.tokenType,
                ...(role === 'PROVIDER' ? { providerEmail: email } : { email }),
              },
            });
            setResult({
              token: confirmRes.data.tokenValue,
              plan,
              email,
              method: values.method,
              upiId,
              paymentId: response.razorpay_payment_id,
            });
            setTimeout(() => document.getElementById('checkout-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
          } catch (error) {
            themedSwal({
              icon: 'error',
              title: 'Confirmation failed',
              text: error?.response?.data?.message || 'Payment confirmation failed. Contact support with your payment ID.',
              footer: `Payment ID: ${response.razorpay_payment_id}`,
            });
          } finally {
            setLoadingPlan(null);
          }
        },
      });

      rzp.on('payment.failed', (resp) => {
        recordFailure(orderId, resp?.error);
        themedSwal({
          icon: 'error',
          title: 'Payment failed',
          text: resp?.error?.description || 'The payment did not go through. You can try again.',
        });
      });
      rzp.open();
    } catch (error) {
      setLoadingPlan(null);
      themedSwal({ icon: 'error', title: 'Could not start payment', text: error?.response?.data?.message || 'Order creation failed.' });
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(result.token);
      copyToast();
    } catch {
      themedSwal({ icon: 'info', title: 'Copy manually', text: result.token });
    }
  };

  const step = result ? 3 : detailsValid ? 2 : 1;

  return (
    <div className={`plan-checkout plan-checkout--${variant}`}>
      <div className="pc-bg" aria-hidden="true">
        <span className="pc-blob pc-blob--1" />
        <span className="pc-blob pc-blob--2" />
        <span className="pc-blob pc-blob--3" />
      </div>

      <div className="container pc-inner">
        {/* ---------- Hero ---------- */}
        <header className="pc-hero">
          <span className="pc-badge"><i className="bi bi-shield-lock-fill" /> {badge}</span>
          <h1 className="pc-title">{title}</h1>
          <p className="pc-subtitle">{subtitle}</p>

          <ol className="pc-steps" aria-label="Checkout progress">
            {['Your details', 'Choose a plan', 'Get your token'].map((label, i) => (
              <li key={label} className={`pc-step ${step > i + 1 ? 'is-done' : ''} ${step === i + 1 ? 'is-active' : ''}`}>
                <span className="pc-step-dot">{step > i + 1 ? <i className="bi bi-check-lg" /> : i + 1}</span>
                <span className="pc-step-label">{label}</span>
              </li>
            ))}
          </ol>
        </header>

        {/* ---------- Step 1: details ---------- */}
        <Motion.section
          className="pc-card pc-details"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="pc-section-title"><i className="bi bi-person-vcard" /> Payer details</h2>

          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="pc-label" htmlFor="pc-name">Full name</label>
                <div className={`pc-input ${fieldInvalid('name') ? 'is-invalid' : ''}`}>
                  <i className="bi bi-person" />
                  <input id="pc-name" name="name" autoComplete="name" placeholder="Your full name"
                    value={values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
                {fieldInvalid('name') && <div className="pc-error">{errors.name}</div>}
              </div>

              <div className="col-md-6">
                <label className="pc-label" htmlFor="pc-phone">Mobile number</label>
                <div className={`pc-input ${fieldInvalid('phone') ? 'is-invalid' : ''}`}>
                  <i className="bi bi-telephone" />
                  <input id="pc-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210"
                    value={values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
                {fieldInvalid('phone') && <div className="pc-error">{errors.phone}</div>}
              </div>

              <div className="col-12">
                <label className="pc-label" htmlFor="pc-email">{emailLabel}</label>
                <div className={`pc-input ${fieldInvalid('email') ? 'is-invalid' : ''}`}>
                  <i className="bi bi-envelope" />
                  <input id="pc-email" name="email" type="email" autoComplete="email" placeholder="name@gmail.com"
                    value={values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
                {fieldInvalid('email')
                  ? <div className="pc-error">{errors.email}</div>
                  : <div className="pc-help">The token only works for registration with this exact email.</div>}
              </div>

              <div className="col-12">
                <span className="pc-label">Payment method</span>
                <div className="pc-methods" role="radiogroup" aria-label="Payment method">
                  {METHODS.map((m) => (
                    <button key={m.id} type="button" role="radio" aria-checked={values.method === m.id}
                      className={`pc-method ${values.method === m.id ? 'is-selected' : ''}`}
                      onClick={() => formik.setFieldValue('method', m.id)}>
                      <i className={`bi ${m.icon}`} />
                      <span className="pc-method-label">{m.label}</span>
                      <span className="pc-method-hint">{m.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {values.method === 'upi' && (
                  <Motion.div
                    key="upi"
                    className="col-12"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="pc-upi">
                      <div className="pc-upi-how">
                        <i className="bi bi-qr-code-scan" />
                        <div>
                          <strong>How UPI payment works</strong>
                          <span>
                            On a <b>phone</b>, Razorpay opens your UPI app (GPay, PhonePe, Paytm…) directly.
                            On a <b>computer</b>, it shows a QR code – scan it with any UPI app and approve.
                          </span>
                        </div>
                      </div>
                      <label className="pc-label" htmlFor="pc-upi">
                        Your UPI ID <span className="pc-optional">(optional – saved with your payment receipt)</span>
                      </label>
                      <div className={`pc-input ${fieldInvalid('upiId') ? 'is-invalid' : ''} ${upiValid ? 'is-valid' : ''}`}>
                        <i className="bi bi-at" />
                        <input id="pc-upi" name="upiId" autoComplete="off" autoCapitalize="none" spellCheck="false"
                          placeholder="yourname@okaxis" value={values.upiId}
                          onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {upiValid && <i className="bi bi-patch-check-fill pc-valid-icon" />}
                      </div>
                      {fieldInvalid('upiId') && <div className="pc-error">{errors.upiId}</div>}
                      <div className="pc-chips">
                        {UPI_HANDLES.map((h) => (
                          <button key={h} type="button" className="pc-chip" onClick={() => applyHandle(h)}>{h}</button>
                        ))}
                      </div>
                      {IS_TEST_KEY && (
                        <div className="pc-test-hint">
                          <i className="bi bi-info-circle" /> <b>Test mode:</b> UPI QR codes can&apos;t be paid with a real
                          app. To test, choose <b>Net Banking</b> in the Razorpay window, pick any bank and click
                          <i> Success</i>, or use a{' '}
                          <a href="https://razorpay.com/docs/payments/payments/test-card-details/" target="_blank" rel="noreferrer">
                            Razorpay test card
                          </a>.
                        </div>
                      )}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Motion.section>

        {/* ---------- Step 2: plans ---------- */}
        <div className="row g-4 justify-content-center pc-plans">
          {plans.map((plan, index) => (
            <div className="col-lg-4 col-md-6" key={plan.tokenType}>
              <Motion.article
                className={`pc-plan ${plan.popular ? 'is-popular' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.1, ease: 'easeOut' }}
              >
                {plan.popular && <span className="pc-ribbon"><i className="bi bi-stars" /> Most popular</span>}
                <div className="pc-plan-icon"><i className={`bi ${plan.icon}`} /></div>
                <h3 className="pc-plan-name">{plan.name}</h3>
                <p className="pc-plan-desc">{plan.description}</p>
                <div className="pc-price">
                  <span className="pc-price-currency">₹</span>
                  <span className="pc-price-amount">{plan.price}</span>
                  <span className="pc-price-period">/ {plan.period}</span>
                </div>
                <ul className="pc-features">
                  {plan.features.map((f) => (
                    <li key={f}><i className="bi bi-check-circle-fill" /> {f}</li>
                  ))}
                </ul>
                <button type="button" className="pc-buy" disabled={loadingPlan !== null} onClick={() => handleBuy(plan)}>
                  {loadingPlan === plan.tokenType ? (
                    <><span className="spinner-border spinner-border-sm" role="status" /> Opening checkout…</>
                  ) : (
                    <><i className={`bi ${values.method === 'upi' ? 'bi-phone' : 'bi-lock-fill'}`} /> Pay ₹{plan.price}{values.method === 'upi' ? ' with UPI' : ''}</>
                  )}
                </button>
              </Motion.article>
            </div>
          ))}
        </div>

        <p className="pc-secure-note">
          <i className="bi bi-shield-check" /> Payments are processed securely by Razorpay. We never see your card or UPI PIN.
        </p>

        {/* ---------- Step 3: token ---------- */}
        <AnimatePresence>
          {result && (
            <Motion.section
              id="checkout-result"
              className="pc-card pc-result"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              <div className="pc-confetti" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ '--i': i }} />)}
              </div>
              <div className="pc-success-icon"><i className="bi bi-check2" /></div>
              <h2>Payment successful!</h2>
              <p className="pc-result-sub">Your {role === 'ADMIN' ? 'admin' : 'provider'} registration token is ready.</p>

              <div className="pc-token" onClick={copyToken} title="Click to copy">
                <code>{result.token}</code>
                <i className="bi bi-clipboard" />
              </div>

              <dl className="pc-summary">
                <div><dt>Plan</dt><dd>{result.plan.name}</dd></div>
                <div><dt>Registered email</dt><dd>{result.email}</dd></div>
                <div><dt>Method</dt><dd>{METHOD_LABELS[result.method]}{result.upiId ? ` · ${result.upiId}` : ''}</dd></div>
                <div><dt>Payment ID</dt><dd className="pc-mono">{result.paymentId}</dd></div>
              </dl>

              <div className="pc-result-actions">
                <button type="button" className="pc-btn-outline" onClick={copyToken}>
                  <i className="bi bi-clipboard-check" /> Copy token
                </button>
                <Link
                  to={`/register?${new URLSearchParams({
                    role,
                    token: result.token,
                    email: result.email,
                  }).toString()}`}
                  className="pc-buy pc-buy--inline"
                >
                  <i className="bi bi-person-plus-fill" /> Continue to registration
                </Link>
              </div>
            </Motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlanCheckout;

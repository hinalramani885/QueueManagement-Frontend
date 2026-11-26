import PlanCheckout from '../components/checkout/PlanCheckout';

// Same plans and prices as the admin-bought provider tokens (PaymentService.createOrder)
const plans = [
  {
    name: 'Basic',
    tokenType: '1_MONTH',
    price: 100,
    period: 'month',
    icon: 'bi-person-badge',
    description: 'Start serving customers at your place.',
    features: ['Valid for 1 month', 'Add your own place and services', 'Serve customers from your queues', 'Real-time queue updates'],
  },
  {
    name: 'Standard',
    tokenType: '1_YEAR',
    price: 500,
    period: 'year',
    icon: 'bi-briefcase',
    popular: true,
    description: 'Best value for regular providers.',
    features: ['Valid for 12 months', 'Save 58% vs. paying monthly', 'Everything in Basic', 'Performance analytics and feedback'],
  },
  {
    name: 'Premium',
    tokenType: 'LIFETIME',
    price: 1000,
    period: 'lifetime',
    icon: 'bi-award',
    description: 'Pay once, serve forever.',
    features: ['Never expires', 'One-time payment, no renewals', 'Everything in Standard'],
  },
];

const TRUSTED_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'protonmail.com', 'zoho.com', 'icloud.com'];

/** Public page: a service provider buys their own registration token; they add their place after signing up. */
const BecomeProviderPage = () => (
  <PlanCheckout
    role="PROVIDER"
    variant="provider"
    badge="Provider access"
    title="Become a provider"
    subtitle="Pick a plan and pay to get your provider registration token instantly. After signing up you add your own business place."
    plans={plans}
    emailLabel="Your email (used for registration)"
    allowedDomains={TRUSTED_DOMAINS}
    checkoutName="QFlow Provider Access"
    checkoutDescription="Provider registration token"
    confirmEndpoint="/payment/confirm-provider"
  />
);

export default BecomeProviderPage;

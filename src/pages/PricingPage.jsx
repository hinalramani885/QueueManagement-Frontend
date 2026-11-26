import PlanCheckout from '../components/checkout/PlanCheckout';

const plans = [
  {
    name: 'Basic Admin',
    tokenType: '1_MONTH',
    price: 100,
    period: 'month',
    icon: 'bi-rocket-takeoff',
    description: 'Try QFlow with one month of full admin access.',
    features: ['Valid for 1 month', 'Full admin dashboard', 'Places, services and queues', 'Provider management and analytics'],
  },
  {
    name: 'Standard Admin',
    tokenType: '1_YEAR',
    price: 500,
    period: 'year',
    icon: 'bi-gem',
    popular: true,
    description: 'Best value for growing businesses.',
    features: ['Valid for 12 months', 'Save 58% vs. paying monthly', 'Everything in Basic Admin', 'Reports, exports and feedback insights'],
  },
  {
    name: 'Enterprise Admin',
    tokenType: 'LIFETIME',
    price: 1000,
    period: 'lifetime',
    icon: 'bi-trophy',
    description: 'Pay once, manage forever.',
    features: ['Never expires', 'One-time payment, no renewals', 'Everything in Standard Admin', 'Best for long-term use'],
  },
];

const TRUSTED_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

const PricingPage = () => (
  <PlanCheckout
    role="ADMIN"
    variant="admin"
    badge="Admin access"
    title="Elevate your control"
    subtitle="Enter your details, pick a plan, pay with UPI, card or net banking, and get your admin registration token instantly."
    plans={plans}
    emailLabel="Admin email (used for registration)"
    allowedDomains={TRUSTED_DOMAINS}
    checkoutName="QFlow Admin Access"
    checkoutDescription="Admin registration token"
    confirmEndpoint="/payment/confirm"
  />
);

export default PricingPage;

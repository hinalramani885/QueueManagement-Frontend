import { useSelector } from 'react-redux';
import PlanCheckout from '../components/checkout/PlanCheckout';

const plans = [
  {
    name: 'Basic',
    tokenType: '1_MONTH',
    price: 100,
    period: 'month',
    icon: 'bi-person-badge',
    description: 'Perfect for new providers.',
    features: ['Valid for 1 month', 'Serve customers from assigned queues', 'Real-time queue updates'],
  },
  {
    name: 'Standard',
    tokenType: '1_YEAR',
    price: 500,
    period: 'year',
    icon: 'bi-briefcase',
    popular: true,
    description: 'Great value for committed providers.',
    features: ['Valid for 12 months', 'Save 58% vs. paying monthly', 'Everything in Basic', 'Performance analytics and feedback'],
  },
  {
    name: 'Premium',
    tokenType: 'LIFETIME',
    price: 1000,
    period: 'lifetime',
    icon: 'bi-award',
    description: 'Full access for established providers.',
    features: ['Never expires', 'One-time payment, no renewals', 'Everything in Standard'],
  },
];

const TRUSTED_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com', 'zoho.com', 'icloud.com', 'yourcompany.com'];

const ProviderPricingPage = () => {
  const { id: adminId } = useSelector((state) => state.auth || {});

  return (
    <PlanCheckout
      role="PROVIDER"
      variant="provider"
      badge="Provider tokens"
      title="Add a provider to your team"
      subtitle="Enter the payer details and the provider's email, choose a plan, and get a provider registration token right away."
      plans={plans}
      emailLabel="Provider's email (used for registration)"
      allowedDomains={TRUSTED_DOMAINS}
      checkoutName="QFlow Provider Token"
      checkoutDescription="Provider registration token"
      confirmEndpoint="/payment/confirm-provider"
      adminId={adminId}
      requireAdmin
    />
  );
};

export default ProviderPricingPage;

export const pricingPlans = [
  {
    name: "Starter",
    description:
      "Perfect for small teams or startups taking their first step toward streamlined HR management.  HR management.",
    priceMonthly: 2,
    highlight: false,
    features: [
      { name: "Onboarding", available: true },
      { name: "Employee database management", available: true },
      { name: "Time-off management (Leave)", available: false },
      { name: "Basic shift management", available: false },
      { name: "Document management", available: false },
      { name: "Module-based reports", available: false },
    ],
  },
  {
    name: "Professional",
    description:
      "Designed for growing businesses, the Professional package offers enhanced HR capabilities to streamline operations.",
    priceMonthly: 25,
    highlight: true,
    features: [
      { name: "Onboarding", available: true },
      { name: "Employee database management", available: true },
      { name: "Time-off management (Leave)", available: true },
      { name: "Basic shift management", available: true },
      { name: "Document management", available: false },
      { name: "Module-based reports", available: false },
    ],
  },
  {
    name: "Enterprise",
    description:
      "Built for large organizations with complex HR needs, the Enterprise package offers a fully customizable and scalable solution.",
    priceMonthly: 50,
    highlight: false,
    features: [
      { name: "Onboarding", available: true },
      { name: "Employee database management", available: true },
      { name: "Time-off management (Leave)", available: true },
      { name: "Basic shift management", available: true },
      { name: "Document management", available: true },
      { name: "Module-based reports", available: true },
    ],
  },
];

import PaymentFullDetails from "@/features/subscription/payments/payment-history/components/PaymentFullDetails";

export const metadata = {
  title: "Payment & Subscription Details | Revinr OMS",
  description: "Full SSLCOMMERZ payment receipt and subscription plan breakdown.",
};

export default async function PaymentDetailsPage({ params }) {
  const resolvedParams = await params;
  return <PaymentFullDetails identifier={resolvedParams?.id} />;
}

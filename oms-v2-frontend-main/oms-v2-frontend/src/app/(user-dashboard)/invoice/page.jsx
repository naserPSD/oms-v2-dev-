import React from "react";

const InvoicePage = () => {
  // Invoice data (from the provided JSON)
  const invoice = {
    id: 1,
    invoice_number: "INV-2026-001",
    user: {
      id: 12,
      name: "John Doe",
      email: "john@example.com",
      phone: "+880123456789",
      avatar: "https://example.com/avatar.jpg",
    },
    subscription_id: 5,
    subscription_name: "Pro Plan",
    base_amount: 50.0,
    per_user_amount: 10.0,
    user_count: 3,
    subtotal: 80.0,
    tax_amount: 8.0,
    discount_amount: 5.0,
    total_amount: 83.0,
    currency: "BDT",
    status: "draft",
    payment_status: "unpaid",
    billing_period_start: "2026-04-01T00:00:00Z",
    billing_period_end: "2026-04-30T23:59:59Z",
    coupon_id: 2,
    coupon_code: "NEWYEAR-10",
    due_date: "2026-05-05T00:00:00Z",
    paid_at: null,
    pdf_url: "https://example.com/invoice.pdf",
    invoice_items: [
      {
        title: "Base Subscription",
        description: "Monthly subscription fee",
        quantity: 1,
        unit_price: 50.0,
        total: 50.0,
      },
      {
        title: "Additional Users",
        description: "3 users x $10",
        quantity: 3,
        unit_price: 10.0,
        total: 30.0,
      },
    ],
    stripe_invoice_id: "in_123456789",
    stripe_payment_intent_id: "pi_987654321",
    created_at: "2026-04-01T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    }).format(amount);
  };

  // Status badge color classes
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "unpaid":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#080d16] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Invoice Card */}
        <div className="rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-[#111827] transition-colors duration-300">
          {/* Header */}
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  Invoice
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  #{invoice.invoice_number}
                </p>
              </div>
              <div className="flex gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(invoice.status)}`}
                >
                  {invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadgeClass(invoice.payment_status)}`}
                >
                  {invoice.payment_status.charAt(0).toUpperCase() +
                    invoice.payment_status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* From and To Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">
                  FROM
                </h3>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#080d16]">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Revinr. IT
                  </p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    House 37, Road 3, Sector 9
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uttara Dhaka 1230, Bangladesh
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    info@revinr.com
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +8801715864162
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">
                  BILL TO
                </h3>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#080d16]">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {invoice.user.name}
                  </p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    {invoice.user.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoice.user.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#080d16]">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Invoice Date
                </p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {formatDate(invoice.created_at)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#080d16]">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Due Date
                </p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {formatDate(invoice.due_date)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#080d16]">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Billing Period
                </p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {formatDate(invoice.billing_period_start)} -{" "}
                  {formatDate(invoice.billing_period_end)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#080d16]">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Subscription
                </p>
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {invoice.subscription_name}
                </p>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Item
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Description
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Qty
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice?.invoice_items?.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-gray-900 dark:text-white">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="flex justify-end">
              <div className="w-full md:w-80">
                <div className="space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-[#080d16]">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(invoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax (
                      {((invoice.tax_amount / invoice.subtotal) * 100).toFixed(
                        0,
                      )}
                      %)
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(invoice.tax_amount)}
                    </span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        Discount ({invoice.coupon_code})
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatCurrency(invoice.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info & Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Payment Information
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Stripe Invoice ID: {invoice.stripe_invoice_id}</p>
                    <p>Payment Intent ID: {invoice.stripe_payment_intent_id}</p>
                    {invoice.paid_at && (
                      <p>Paid At: {formatDate(invoice.paid_at)}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm">
                    Download PDF
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    Invoice created on {formatDate(invoice.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

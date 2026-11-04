// utils/formatters.js

const baseFormat = (
  value,
  {
    locale = "en-US",
    currency = "USD", // null দিলে শুধু number আসবে
    style = "currency",
    withDecimal, // optional
    minimumFractionDigits,
    maximumFractionDigits,
  } = {}
) => {
  if (value === null || value === undefined || isNaN(value)) return "-";

  let styleType = currency ? style : "decimal";

  // Default rule:
  // যদি currency থাকে → no decimal
  // যদি currency না থাকে → decimal free choice
  const minDigits =
    withDecimal === true
      ? minimumFractionDigits ?? 2
      : withDecimal === false
      ? 0
      : currency
      ? 0
      : 0;

  const maxDigits =
    withDecimal === true
      ? maximumFractionDigits ?? 2
      : withDecimal === false
      ? 0
      : currency
      ? 0
      : 0;

  return new Intl.NumberFormat(locale, {
    style: styleType,
    currency: currency || undefined,
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(value);
};

// Generic
export const formatCurrency = (value, options) => baseFormat(value, options);

// Wrappers
export const formatUSD = (value, options = {}) =>
  baseFormat(value, { locale: "en-US", currency: "USD", ...options });

export const formatINR = (value, options = {}) =>
  baseFormat(value, { locale: "en-IN", currency: "INR", ...options });

export const formatBDT = (value, options = {}) =>
  baseFormat(value, { locale: "en-BD", currency: "BDT", ...options });

// Non-currency helpers
export const formatNumber = (value, options = {}) =>
  baseFormat(value, { style: "decimal", currency: null, ...options });

export const formatPercent = (value, options = {}) =>
  baseFormat(value, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  });

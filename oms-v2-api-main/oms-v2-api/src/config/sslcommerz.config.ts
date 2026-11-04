import { registerAs } from '@nestjs/config';

export type SslcommerzMode = 'sandbox' | 'live';

export default registerAs('sslcommerz', () => {
  const mode = (process.env.PAYMENT_MODE || 'sandbox').toLowerCase();
  const isLive = mode === 'live';

  return {
    mode: isLive ? ('live' as const) : ('sandbox' as const),
    storeId: isLive
      ? process.env.SSLCOMMERZ_LIVE_STORE_ID || ''
      : process.env.SSLCOMMERZ_SANDBOX_STORE_ID || 'testbox',
    storePassword: isLive
      ? process.env.SSLCOMMERZ_LIVE_STORE_PASSWORD || ''
      : process.env.SSLCOMMERZ_SANDBOX_STORE_PASSWORD || 'qwerty',
    initUrl: isLive
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
    validationUrl: isLive
      ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
    transactionQueryUrl: isLive
      ? 'https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php',
  };
});


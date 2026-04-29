import paypal from "@paypal/checkout-server-sdk";

// môi trường sandbox
const environment = new paypal.core.SandboxEnvironment(
  "AYFgpW9uAQB07RC9hoe19di3t0sktkMP2gb9LqoirEVVlY8eznqvqZwMfImTeXHrWQhzlC2E-8n0sgPB",
  "EBgGxhg3HDF3kjCUFl-jODQeqFdpRRtDdQLJtcEyUGpZVyAN6Xi-kK9ZWbEItDQ3nbEqgF7Ib6exYU6k"
);

// tạo client
const client = new paypal.core.PayPalHttpClient(environment);

// export chuẩn ES module
export default client;
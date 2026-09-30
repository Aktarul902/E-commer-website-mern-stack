let cashfreePromise = null;

export const loadCashfree = () => {
  if (cashfreePromise) {
    return cashfreePromise;
  }

  cashfreePromise = new Promise(
    (resolve, reject) => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://sdk.cashfree.com/js/v3/cashfree.js";

      script.async = true;

      script.onload = () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          reject(
            new Error(
              "Cashfree SDK failed to load"
            )
          );
        }
      };

      script.onerror = () => {
        reject(
          new Error(
            "Unable to load Cashfree SDK"
          )
        );
      };

      document.body.appendChild(script);
    }
  );

  return cashfreePromise;
};

// ============================================================
// OPEN CASHFREE CHECKOUT
// ============================================================

export const openCashfreeCheckout = async (
  paymentSessionId,
  environment,
  checkoutMode
) => {
  const Cashfree =
    await loadCashfree();

  const cashfree = Cashfree({
    mode:
      environment ||
      import.meta.env.VITE_CASHFREE_ENV ||
      "sandbox",
  });

  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: checkoutMode === "redirect" ? "_self" : "_modal",
  });
};
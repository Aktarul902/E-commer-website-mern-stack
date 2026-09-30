import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useCart } from "../../context/cartcontex.jsx";
import {
  clearCashfreeTrackingToken,
  getCashfreeTrackingToken,
  verifyCashfreePayment,
} from "../../lib/cashfreeapi.js";

export default function CashfreeReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const clearCartRef = useRef(clearCart);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");
  const orderId = searchParams.get("orderId");

  clearCartRef.current = clearCart;

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!orderId) {
        setStatus("failed");
        setError("The order reference is missing from this payment return.");
        return;
      }

      setStatus("checking");
      setError("");

      try {
        const trackingToken = getCashfreeTrackingToken(orderId);
        const result = await verifyCashfreePayment(orderId, trackingToken);

        if (!active) return;

        if (result.paymentStatus === "PAID") {
          await clearCartRef.current();
          clearCashfreeTrackingToken(orderId);
          navigate(`/order-success/${encodeURIComponent(orderId)}`, {
            replace: true,
            state: { order: result.order },
          });
          return;
        }

        setStatus(result.paymentStatus === "FAILED" ? "failed" : "pending");
      } catch (verificationError) {
        if (!active) return;
        setStatus("failed");
        setError(verificationError.message || "Payment could not be verified.");
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [attempt, navigate, orderId]);

  const isChecking = status === "checking";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm">
        {isChecking ? (
          <LoaderCircle size={38} className="mx-auto animate-spin text-gray-700" />
        ) : (
          <CircleAlert
            size={38}
            className={`mx-auto ${status === "pending" ? "text-amber-500" : "text-red-500"}`}
          />
        )}

        <h1 className="mt-5 text-xl font-bold text-gray-950">
          {isChecking
            ? "Verifying your payment"
            : status === "pending"
              ? "Payment is processing"
              : "Payment not confirmed"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {isChecking
            ? "Please wait while we confirm the Cashfree transaction."
            : status === "pending"
              ? "Cashfree has not confirmed this payment yet. Check again in a moment."
              : error || "Your order remains unpaid. You can return to checkout and try again."}
        </p>
        {orderId && (
          <p className="mt-4 text-xs text-gray-400">Order {orderId}</p>
        )}

        {!isChecking && (
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAttempt((current) => current + 1)}
              className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Check payment status
            </button>
            <Link
              to="/checkout"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Return to checkout
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
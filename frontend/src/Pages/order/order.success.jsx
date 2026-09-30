import {
  Link,
  useLocation,
  useParams,
} from "react-router";

const OrderSuccess = () => {
  const { orderId } =
    useParams();

  const location =
    useLocation();

  const order =
    location.state?.order;

  const displayOrderId =
    orderId
      ? decodeURIComponent(orderId)
      : order?.orderId;

  const isGuest =
    order?.orderType === "guest";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          Order Placed Successfully!
        </h1>

        <p className="mt-3 text-gray-600">
          Thank you for shopping with
          Printzenz.
        </p>

        <div className="mt-8 rounded-2xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Order ID
          </p>

          <p className="mt-1 text-xl font-bold">
            {displayOrderId}
          </p>
        </div>

        {isGuest ? (
          <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-left text-sm text-yellow-900">
            <p className="font-semibold">
              Guest Order
            </p>

            <p className="mt-1">
              This order will not appear in
              My Orders. Please save your Order
              ID and use the Track Order page to
              check your order.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-left text-sm text-green-900">
            Your order is linked to your
            account and will appear in My
            Orders.
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/track-order?orderId=${encodeURIComponent(
              displayOrderId || ""
            )}`}
            className="rounded-xl bg-black px-6 py-3 font-semibold text-white"
          >
            Track Order
          </Link>

          {!isGuest && (
            <Link
              to="/myaccount/orders"
              className="rounded-xl border px-6 py-3 font-semibold"
            >
              My Orders
            </Link>
          )}

          <Link
            to="/shop"
            className="rounded-xl border px-6 py-3 font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
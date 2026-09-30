const QIKINK_BASE_URL =
  process.env.QIKINK_BASE_URL || "https://api.qikink.com";

const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID;
const QIKINK_CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;

if (!QIKINK_CLIENT_ID) {
  console.warn("⚠️ QIKINK_CLIENT_ID is missing");
}

if (!QIKINK_CLIENT_SECRET) {
  console.warn("⚠️ QIKINK_CLIENT_SECRET is missing");
}

export {
  QIKINK_BASE_URL,
  QIKINK_CLIENT_ID,
  QIKINK_CLIENT_SECRET,
};

export default {
  QIKINK_BASE_URL,
  QIKINK_CLIENT_ID,
  QIKINK_CLIENT_SECRET,
};
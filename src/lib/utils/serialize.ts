import { Decimal } from "@prisma/client/runtime/library";

/**
 * Utility function to serialize Prisma Decimal objects to numbers
 * This is needed when passing data from Server Components to Client Components
 */
export function serializeDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "object" && obj.constructor?.name === "Decimal") {
    return Number(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeDecimals(item)) as T;
  }

  if (typeof obj === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDecimals(value);
    }
    return serialized;
  }

  return obj;
}

/**
 * Helper function specifically for User objects with Decimal fields
 */
export function serializeUserWithDecimals(user: any) {
  return {
    ...user,
    totalEarnings: Number(user.totalEarnings || 0),
    pendingBalance: Number(user.pendingBalance || 0),
    products:
      user.products?.map((product: any) => ({
        ...product,
        price: Number(product.price || 0),
        earnings:
          product.earnings?.map((earning: any) => ({
            ...earning,
            amount: Number(earning.amount || 0),
            netAmount: Number(earning.netAmount || 0),
            platformFee: Number(earning.platformFee || 0),
          })) || [],
      })) || [],
    earnings:
      user.earnings?.map((earning: any) => ({
        ...earning,
        amount: Number(earning.amount || 0),
        netAmount: Number(earning.netAmount || 0),
        platformFee: Number(earning.platformFee || 0),
      })) || [],
    payouts:
      user.payouts?.map((payout: any) => ({
        ...payout,
        amount: Number(payout.amount || 0),
      })) || [],
  };
}

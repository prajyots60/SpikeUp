import { OnAuthenticateUser } from "@/actions/auth";
import { getAllProductsFromStripe } from "@/actions/stripe";
import { getAllAssistants } from "@/actions/vapi";
import Header from "@/components/ReusableComponents/LayoutComponents/Header";
import Sidebar from "@/components/ReusableComponents/LayoutComponents/Sidebar";
import { serializeUserWithDecimals } from "@/lib/utils/serialize";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const userExists = await OnAuthenticateUser();

  const stripeProductsResult = await getAllProductsFromStripe();

  const normalizedStripeProducts = (() => {
    const raw = stripeProductsResult?.products;
    if (!raw) return [] as any[];
    if (Array.isArray(raw)) return raw;
    // If an API list object slipped through (object: 'list')
    // attempt to use its data property.

    if (raw && typeof raw === "object" && raw.data && Array.isArray(raw.data)) {
      return raw.data;
    }
    return [] as any[];
  })();
  const assistants = await getAllAssistants();

  if (!userExists.user) {
    redirect("/sign-in");
  }

  // Serialize user data to prevent Decimal issues in client components
  const serializedUser = serializeUserWithDecimals(userExists.user);

  return (
    <div className="flex w-full h-min-screen">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-auto px-4 scrollbar-hide container mx-auto">
        <Header
          user={serializedUser}
          stripeProducts={normalizedStripeProducts}
          assistants={assistants.data || []}
        />
        <div className="flex-1 py-10">{children}</div>
      </div>
    </div>
  );
};

export default Layout;

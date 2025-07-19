import { OnAuthenticateUser } from "@/actions/auth";
import { getAllProductsFromStripe } from "@/actions/stripe";
import Header from "@/components/ReusableComponents/LayoutComponents/Header";
import Sidebar from "@/components/ReusableComponents/LayoutComponents/Sidebar";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const userExists = await OnAuthenticateUser();

  const stripeProducts = await getAllProductsFromStripe();

  if (!userExists.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex w-full h-min-screen">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-auto px-4 scrollbar-hide container mx-auto">
        <Header
          user={userExists.user}
          stripeProducts={stripeProducts.products || []}
        />
        <div className="flex-1 py-10">{children}</div>
      </div>
    </div>
  );
};

export default Layout;

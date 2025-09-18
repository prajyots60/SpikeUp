import { OnAuthenticateUser } from "@/actions/auth";
import { getAllCreatorsEarningsSummary } from "@/actions/payout";
import PageHeader from "@/components/ReusableComponents/PageHeader";
import { redirect } from "next/navigation";
import { Crown, Users, DollarSign } from "lucide-react";
import AdminCreatorsList from "./_components/AdminCreatorsList";

const AdminPage = async () => {
  const currentUser = await OnAuthenticateUser();
  if (!currentUser.user) {
    redirect("/sign-in");
  }

  // Add admin check here - for now, allowing all authenticated users
  // You might want to add an `isAdmin` field to your User model

  const creatorsResult = await getAllCreatorsEarningsSummary();
  const creators = creatorsResult.success ? creatorsResult.creators : [];

  const totalManagedCreators = creators?.length || 0;
  const totalUnpaidEarnings =
    creators?.reduce(
      (sum, creator) => sum + (creator.unpaidEarnings || 0),
      0
    ) || 0;
  const totalEarnings =
    creators?.reduce((sum, creator) => sum + (creator.totalEarnings || 0), 0) ||
    0;

  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        heading="Creator Management"
        leftIcon={<Crown className="w-3 h-3" />}
        mainIcon={<Users className="w-8 h-8" />}
        rightIcon={<DollarSign className="w-3 h-3" />}
        placeholder="Search creators..."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 border border-input rounded-lg bg-background shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Managed Creators
              </p>
              <p className="text-2xl font-bold">{totalManagedCreators}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border border-input rounded-lg bg-background shadow-sm">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border border-input rounded-lg bg-background shadow-sm">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Payouts
              </p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalUnpaidEarnings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Creators List */}
      <AdminCreatorsList creators={creators || []} />
    </div>
  );
};

export default AdminPage;

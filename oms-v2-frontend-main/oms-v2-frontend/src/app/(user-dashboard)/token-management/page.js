import HrDashboard from "@/features/hr-dashboard";
import TokenDashboard from "@/features/token-management/TokenDashboard";

export const metadata = {
  title: "Token Management",
  description: "Token Management Overview.",
};
const TokenManagementDashboardPage = () => {
  return <TokenDashboard />;
};

export default TokenManagementDashboardPage;

import EmailTemplates from "@/features/crm/email-templates/EmailTemplates";

export const metadata = {
  title: "Master Email Templates",
  description: "Manage platform email templates that subscribers can import.",
};

const MasterEmailTemplatesPage = () => {
  return <EmailTemplates mode="master" />;
};

export default MasterEmailTemplatesPage;

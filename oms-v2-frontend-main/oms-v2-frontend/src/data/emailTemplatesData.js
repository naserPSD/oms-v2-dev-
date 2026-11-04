// data/emailTemplatesData.js
export const fakeEmailTemplatesData = {
  statusCode: 200,
  timestamp: "2024-11-23T14:30:15.437Z",
  path: "/api/v1/email-templates/get-all?page=1&limit=10",
  message: "Email templates retrieved successfully",
  data: [
    {
      id: 1,
      name: "Welcome Email Template",
      subject: "Welcome to Our Platform - {{company_name}}",
      description: "Automated welcome email for new users",
      category: "onboarding",
      status: "active",
      isDefault: true,
      variables: ["company_name", "user_name", "start_date"],
      usedCount: 245,
      lastUsed: "2024-11-22T10:30:00.000Z",
      createdAt: "2024-01-15T09:00:00.000Z",
      updatedAt: "2024-11-22T10:35:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Welcome Email</title>
</head>
<body>
    <h1>Welcome to {{company_name}}, {{user_name}}!</h1>
    <p>We're excited to have you on board starting from {{start_date}}.</p>
</body>
</html>`,
    },
    {
      id: 2,
      name: "Password Reset Template",
      subject: "Reset Your Password - {{company_name}}",
      description: "Password reset email with secure link",
      category: "authentication",
      status: "active",
      isDefault: true,
      variables: ["company_name", "reset_link", "expiry_time"],
      usedCount: 89,
      lastUsed: "2024-11-21T14:20:00.000Z",
      createdAt: "2024-02-10T11:15:00.000Z",
      updatedAt: "2024-11-21T14:25:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body>
    <h1>Password Reset Request</h1>
    <p>Click here to reset your password: {{reset_link}}</p>
    <p>This link expires in {{expiry_time}}.</p>
</body>
</html>`,
    },
    {
      id: 3,
      name: "Monthly Newsletter",
      subject: "{{month}} {{year}} Newsletter - {{company_name}}",
      description: "Monthly company newsletter template",
      category: "newsletter",
      status: "active",
      isDefault: false,
      variables: ["company_name", "month", "year", "featured_news"],
      usedCount: 12,
      lastUsed: "2024-11-01T08:00:00.000Z",
      createdAt: "2024-03-05T13:45:00.000Z",
      updatedAt: "2024-11-01T08:05:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Monthly Newsletter</title>
</head>
<body>
    <h1>{{month}} {{year}} Newsletter</h1>
    <p>Here's what's new at {{company_name}}:</p>
    <div>{{featured_news}}</div>
</body>
</html>`,
    },
    {
      id: 4,
      name: "Order Confirmation",
      subject: "Order Confirmed - #{{order_number}}",
      description: "E-commerce order confirmation email",
      category: "ecommerce",
      status: "active",
      isDefault: false,
      variables: [
        "order_number",
        "customer_name",
        "order_date",
        "total_amount",
      ],
      usedCount: 567,
      lastUsed: "2024-11-23T09:15:00.000Z",
      createdAt: "2024-04-20T10:30:00.000Z",
      updatedAt: "2024-11-23T09:20:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Order Confirmation</title>
</head>
<body>
    <h1>Order Confirmed!</h1>
    <p>Dear {{customer_name}}, your order #{{order_number}} has been confirmed.</p>
    <p>Order Date: {{order_date}}</p>
    <p>Total Amount: </p>
</body>
</html>`,
    },
    {
      id: 5,
      name: "Meeting Invitation",
      subject: "Meeting Invitation: {{meeting_topic}}",
      description: "Calendar meeting invitation template",
      category: "calendar",
      status: "inactive",
      isDefault: false,
      variables: ["meeting_topic", "meeting_date", "meeting_time", "location"],
      usedCount: 34,
      lastUsed: "2024-10-15T16:30:00.000Z",
      createdAt: "2024-05-12T14:20:00.000Z",
      updatedAt: "2024-10-20T11:00:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Meeting Invitation</title>
</head>
<body>
    <h1>Meeting Invitation</h1>
    <p>You are invited to attend: {{meeting_topic}}</p>
    <p>Date: {{meeting_date}} at {{meeting_time}}</p>
    <p>Location: {{location}}</p>
</body>
</html>`,
    },
    {
      id: 6,
      name: "Payment Receipt",
      subject: "Payment Receipt - #{{invoice_number}}",
      description: "Payment confirmation and receipt template",
      category: "billing",
      status: "active",
      isDefault: false,
      variables: [
        "invoice_number",
        "customer_name",
        "payment_date",
        "total_amount",
        "payment_method",
      ],
      usedCount: 321,
      lastUsed: "2024-11-22T15:45:00.000Z",
      createdAt: "2024-06-08T09:45:00.000Z",
      updatedAt: "2024-11-22T15:50:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Payment Receipt</title>
</head>
<body>
    <h1>Payment Receipt</h1>
    <p>Invoice #{{invoice_number}}</p>
    <p>Customer: {{customer_name}}</p>
    <p>Amount: </p>
    <p>Payment Method: {{payment_method}}</p>
</body>
</html>`,
    },
    {
      id: 7,
      name: "Account Verification",
      subject: "Verify Your Account - {{company_name}}",
      description: "Email verification for new accounts",
      category: "authentication",
      status: "active",
      isDefault: true,
      variables: ["company_name", "verification_link", "user_name"],
      usedCount: 178,
      lastUsed: "2024-11-23T11:20:00.000Z",
      createdAt: "2024-07-15T08:30:00.000Z",
      updatedAt: "2024-11-23T11:25:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Account Verification</title>
</head>
<body>
    <h1>Verify Your Account</h1>
    <p>Hello {{user_name}}, please verify your account:</p>
    <a href="{{verification_link}}">Verify Account</a>
</body>
</html>`,
    },
    {
      id: 8,
      name: "Holiday Greetings",
      subject: "Happy Holidays from {{company_name}}!",
      description: "Seasonal holiday greeting template",
      category: "marketing",
      status: "draft",
      isDefault: false,
      variables: ["company_name", "year", "holiday_season"],
      usedCount: 0,
      lastUsed: null,
      createdAt: "2024-10-01T10:00:00.000Z",
      updatedAt: "2024-10-01T10:00:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Holiday Greetings</title>
</head>
<body>
    <h1>Happy {{holiday_season}}!</h1>
    <p>Warm wishes from the team at {{company_name}} for {{year}}!</p>
</body>
</html>`,
    },
    {
      id: 9,
      name: "Support Ticket Response",
      subject: "Re: {{ticket_subject}} - Ticket #{{ticket_number}}",
      description: "Standard support ticket response template",
      category: "support",
      status: "active",
      isDefault: false,
      variables: [
        "ticket_subject",
        "ticket_number",
        "customer_name",
        "support_agent",
        "response",
      ],
      usedCount: 432,
      lastUsed: "2024-11-23T13:10:00.000Z",
      createdAt: "2024-08-22T16:15:00.000Z",
      updatedAt: "2024-11-23T13:15:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Support Response</title>
</head>
<body>
    <h1>Support Ticket #{{ticket_number}}</h1>
    <p>Dear {{customer_name}},</p>
    <p>Regarding: {{ticket_subject}}</p>
    <div>{{response}}</div>
    <p>Best regards,<br>{{support_agent}}</p>
</body>
</html>`,
    },
    {
      id: 10,
      name: "Product Update Announcement",
      subject: "New Update Available - {{product_name}} v{{version}}",
      description: "Product feature update announcement",
      category: "product",
      status: "active",
      isDefault: false,
      variables: ["product_name", "version", "release_date", "new_features"],
      usedCount: 23,
      lastUsed: "2024-11-20T12:00:00.000Z",
      createdAt: "2024-09-10T11:30:00.000Z",
      updatedAt: "2024-11-20T12:05:00.000Z",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Product Update</title>
</head>
<body>
    <h1>{{product_name}} v{{version}} Released!</h1>
    <p>Released on: {{release_date}}</p>
    <h2>New Features:</h2>
    <div>{{new_features}}</div>
</body>
</html>`,
    },
  ],
  pagination: {
    page: 1,
    total: 25,
    limit: 10,
    lastPage: 3,
    resultRows: 10,
  },
};

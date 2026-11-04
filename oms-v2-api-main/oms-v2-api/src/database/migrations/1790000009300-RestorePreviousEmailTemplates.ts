import { MigrationInterface, QueryRunner } from 'typeorm';

type SeedTemplate = {
  name: string;
  subject: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  isDefault: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  content: string;
};

const PREVIOUS_TEMPLATES: SeedTemplate[] = [
  {
    name: 'Welcome Email Template',
    subject: 'Welcome to Our Platform - {{company_name}}',
    description: 'Automated welcome email for new users',
    category: 'onboarding',
    status: 'active',
    isDefault: true,
    variables: ['company_name', 'user_name', 'start_date'],
    createdAt: '2024-01-15 09:00:00',
    updatedAt: '2024-11-22 10:35:00',
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
    name: 'Password Reset Template',
    subject: 'Reset Your Password - {{company_name}}',
    description: 'Password reset email with secure link',
    category: 'authentication',
    status: 'active',
    isDefault: true,
    variables: ['company_name', 'reset_link', 'expiry_time'],
    createdAt: '2024-02-10 11:15:00',
    updatedAt: '2024-11-21 14:25:00',
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
    name: 'Monthly Newsletter',
    subject: '{{month}} {{year}} Newsletter - {{company_name}}',
    description: 'Monthly company newsletter template',
    category: 'newsletter',
    status: 'active',
    isDefault: false,
    variables: ['company_name', 'month', 'year', 'featured_news'],
    createdAt: '2024-03-05 13:45:00',
    updatedAt: '2024-11-01 08:05:00',
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
    name: 'Order Confirmation',
    subject: 'Order Confirmed - #{{order_number}}',
    description: 'E-commerce order confirmation email',
    category: 'ecommerce',
    status: 'active',
    isDefault: false,
    variables: ['order_number', 'customer_name', 'order_date', 'total_amount'],
    createdAt: '2024-04-20 10:30:00',
    updatedAt: '2024-11-23 09:20:00',
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
    name: 'Meeting Invitation',
    subject: 'Meeting Invitation: {{meeting_topic}}',
    description: 'Calendar meeting invitation template',
    category: 'calendar',
    status: 'inactive',
    isDefault: false,
    variables: ['meeting_topic', 'meeting_date', 'meeting_time', 'location'],
    createdAt: '2024-05-12 14:20:00',
    updatedAt: '2024-10-20 11:00:00',
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
    name: 'Payment Receipt',
    subject: 'Payment Receipt - #{{invoice_number}}',
    description: 'Payment confirmation and receipt template',
    category: 'billing',
    status: 'active',
    isDefault: false,
    variables: [
      'invoice_number',
      'customer_name',
      'payment_date',
      'total_amount',
      'payment_method',
    ],
    createdAt: '2024-06-08 09:45:00',
    updatedAt: '2024-11-22 15:50:00',
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
    name: 'Account Verification',
    subject: 'Verify Your Account - {{company_name}}',
    description: 'Email verification for new accounts',
    category: 'authentication',
    status: 'active',
    isDefault: true,
    variables: ['company_name', 'verification_link', 'user_name'],
    createdAt: '2024-07-15 08:30:00',
    updatedAt: '2024-11-23 11:25:00',
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
    name: 'Holiday Greetings',
    subject: 'Happy Holidays from {{company_name}}!',
    description: 'Seasonal holiday greeting template',
    category: 'marketing',
    status: 'draft',
    isDefault: false,
    variables: ['company_name', 'year', 'holiday_season'],
    createdAt: '2024-10-01 10:00:00',
    updatedAt: '2024-10-01 10:00:00',
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
    name: 'Support Ticket Response',
    subject: 'Re: {{ticket_subject}} - Ticket #{{ticket_number}}',
    description: 'Standard support ticket response template',
    category: 'support',
    status: 'active',
    isDefault: false,
    variables: [
      'ticket_subject',
      'ticket_number',
      'customer_name',
      'support_agent',
      'response',
    ],
    createdAt: '2024-08-22 16:15:00',
    updatedAt: '2024-11-23 13:15:00',
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
    name: 'Product Update Announcement',
    subject: 'New Update Available - {{product_name}} v{{version}}',
    description: 'Product feature update announcement',
    category: 'product',
    status: 'active',
    isDefault: false,
    variables: ['product_name', 'version', 'release_date', 'new_features'],
    createdAt: '2024-09-10 11:30:00',
    updatedAt: '2024-11-20 12:05:00',
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
];

/**
 * Restores the previous catalog as master templates only.
 * A company sees a template after they import it.
 */
export class RestorePreviousEmailTemplates1790000009300
  implements MigrationInterface
{
  name = 'RestorePreviousEmailTemplates1790000009300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const template of PREVIOUS_TEMPLATES) {
      const existing = (await queryRunner.query(
        `SELECT id FROM email_templates
         WHERE scope = 'master' AND name = ? AND deleted_at IS NULL
         LIMIT 1`,
        [template.name],
      )) as Array<{ id: number }>;

      if (!existing[0]?.id) {
        await queryRunner.query(
          `INSERT INTO email_templates (
            app_id, scope, available_for_subscriber, source_template_id,
            name, subject, description, category, status, is_default,
            content, variables, created_at, updated_at
          ) VALUES (
            NULL, 'master', 1, NULL,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?
          )`,
          [
            template.name,
            template.subject,
            template.description,
            template.category,
            template.status,
            template.isDefault ? 1 : 0,
            template.content,
            JSON.stringify(template.variables),
            template.createdAt,
            template.updatedAt,
          ],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = PREVIOUS_TEMPLATES.map((template) => template.name);
    const placeholders = names.map(() => '?').join(', ');
    await queryRunner.query(
      `DELETE FROM email_templates
       WHERE scope = 'company' AND name IN (${placeholders}) AND source_template_id IS NOT NULL`,
      names,
    );
    await queryRunner.query(
      `DELETE FROM email_templates
       WHERE scope = 'master' AND name IN (${placeholders})`,
      names,
    );
  }
}

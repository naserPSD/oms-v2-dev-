import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
import * as inlineCss from 'inline-css';

@Injectable()
export class TemplateRendererService {
  private resolveTemplateDir(): string {
    const candidates = [
      join(process.cwd(), 'src', 'views', 'emails'),
      join(process.cwd(), 'dist', 'views', 'emails'),
      join(__dirname, '..', 'views', 'emails'),
      join(__dirname, '..', '..', 'views', 'emails'),
      join(__dirname, '..', '..', '..', 'src', 'views', 'emails'),
    ];
    for (const dir of candidates) {
      if (existsSync(dir)) {
        return dir;
      }
    }
    return candidates[0];
  }

  async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const templateDir = this.resolveTemplateDir();

    // 1. Load all necessary templates safely
    const templatePath = join(templateDir, `${templateName}.hbs`);
    const layoutPath = join(templateDir, 'layouts', 'base.hbs');
    const headerPath = join(templateDir, 'partials', 'header.hbs');
    const footerPath = join(templateDir, 'partials', 'footer.hbs');

    let templateContent = '';
    try {
      templateContent = readFileSync(templatePath, 'utf8');
    } catch {
      if (templateName === 'meeting-invitation') {
        templateContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <h2 style="color: #4F46E5; margin-top: 0;">Meeting Invitation: {{meetingTitle}}</h2>
  <p>Hello {{name}},</p>
  <p>You have been invited to an upcoming meeting by <strong>{{hostName}}</strong>.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 6px 0; font-weight: bold; width: 120px;">Meeting:</td><td>{{meetingTitle}}</td></tr>
    <tr><td style="padding: 6px 0; font-weight: bold;">Date:</td><td>{{meetingDate}}</td></tr>
    <tr><td style="padding: 6px 0; font-weight: bold;">Time:</td><td>{{meetingTime}}</td></tr>
    <tr><td style="padding: 6px 0; font-weight: bold;">Type:</td><td>{{meetingType}}</td></tr>
    {{#if roomName}}<tr><td style="padding: 6px 0; font-weight: bold;">Room:</td><td>{{roomName}}</td></tr>{{/if}}
    {{#if location}}<tr><td style="padding: 6px 0; font-weight: bold;">Location:</td><td>{{location}}</td></tr>{{/if}}
  </table>
  {{#if meetUrl}}
  <div style="margin: 20px 0;">
    <a href="{{#if joinMeetUrl}}{{joinMeetUrl}}{{else}}{{meetUrl}}{{/if}}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Google Meet</a>
  </div>
  {{/if}}
  <div style="margin: 20px 0;">
    <a href="{{#if joinDashboardUrl}}{{joinDashboardUrl}}{{else}}{{meetingLink}}{{/if}}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Workspace</a>
  </div>
  <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">{{emailClosingNote}}<br/>{{supportTeamName}}</p>
</div>`;
      } else if (templateName === 'email-verify') {
        templateContent = `
<p style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
  Hi {{name}},
</p>
<p style="margin: 0 0 24px 0; color: #374151; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
  Thank you for signing up! Please click the button below to verify your email address and continue your account setup:
</p>
{{#if verificationUrl}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0; border-collapse: collapse;">
  <tr>
    <td align="left" style="font-family: Arial, Helvetica, sans-serif;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td align="center" bgcolor="#22c55e" style="border-radius: 6px; background-color: #22c55e;">
            <a href="{{verificationUrl}}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: Arial, Helvetica, sans-serif; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; background-color: #22c55e; border: 1px solid #22c55e;">
              Verify Email &amp; Get Started
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<p style="margin: 0 0 24px 0; color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
  If the button above doesn't work, copy and paste this link into your browser:<br />
  <a href="{{verificationUrl}}" target="_blank" style="color: #2563eb; word-break: break-all;">{{verificationUrl}}</a>
</p>
{{/if}}
<p style="margin: 0 0 16px 0; color: #374151; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
  This verification link is valid for the next <strong style="color: #1f2937;">{{ expiredAt }} minutes</strong>.
</p>
<p style="margin: 0 0 24px 0; color: #374151; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
  If you did not create an account, no further action is required.
</p>`;
      } else {
        templateContent = `<p>{{name}},</p><p>${templateName}</p>`;
      }
    }

    let layoutContent = '{{{body}}}';
    try {
      layoutContent = readFileSync(layoutPath, 'utf8');
    } catch {}

    let headerContent = '';
    try {
      headerContent = readFileSync(headerPath, 'utf8');
    } catch {}

    let footerContent = '';
    try {
      footerContent = readFileSync(footerPath, 'utf8');
    } catch {}

    // 3. Register partials
    Handlebars.registerPartial('header', headerContent);
    Handlebars.registerPartial('footer', footerContent);

    // 4. Compile the main template first
    const template = Handlebars.compile(templateContent);
    const body = template(context);

    // 5. Compile the layout with the rendered body
    const layout = Handlebars.compile(layoutContent);
    const html = layout({
      ...context,
      body: body,
    });

    // 6. Inline CSS (optional)
    try {
      return await inlineCss(html, {
        url: ' ',
        preserveMediaQueries: true,
        removeStyleTags: false,
      });
    } catch {
      return html;
    }
  }
}

// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from './handlebars-adapter';
import { join } from 'path';
import { TemplateRendererService } from './template-renderer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConfig } from '@module/db-configs/entities/db-config.entity';
// import {
//   HandlebarsAdapter,
//   TemplateAdapter,
// } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

// Custom adapter class to debug template resolution
class DebugHandlebarsAdapter extends HandlebarsAdapter {
  async compile(mail: any, callback: any, mailerOptions: any): Promise<any> {
    console.log('Compiling template with options:', {
      template: mail.data.template,
      context: mail.data.context,
    });
    return super.compile(mail, callback, mailerOptions);
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([DbConfig]), // ✅ Make sure User is here
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('MAIL_HOST');
        const port = configService.get<number>('MAIL_PORT');
        const user = configService.get<string>('MAIL_USER');
        const pass = configService.get<string>('MAIL_PASS');
        const fromName =
          configService.get<string>('MAIL_FROM_NAME') || 'HR Team';
        const fromEmail = configService.get<string>('MAIL_FROM_EMAIL');

        return {
          transport: {
            host,
            port,
            secure: false, // Mailtrap 2525 is non-TLS
            auth: { user, pass },
          },
          defaults: {
            from: `"${fromName}" <${fromEmail}>`,
          },
          template: {
            dir: join(__dirname, '..', 'views', 'emails'), // templates folder
            adapter: new DebugHandlebarsAdapter(undefined, {
              inlineCssEnabled: true,
            }),
            options: {
              strict: true,
              layoutsDir: join(
                __dirname,
                '..',
                '..',
                'views',
                'emails',
                'layouts',
              ),
              partialsDir: join(
                __dirname,
                '..',
                '..',
                'views',
                'emails',
                'partials',
              ),
            },
          },
        };
      },
    }),
  ],
  // transport: configService.get('mail.transport'),
  // defaults: configService.get('mail.defaults'),
  // template: {
  //   // dir: join(process.cwd(), 'dist', 'views', 'emails'),
  //   dir: join(__dirname, '..', 'views', 'emails'),
  //   adapter: new DebugHandlebarsAdapter(undefined, {
  //     inlineCssEnabled: false,
  //   }),
  //   // adapter: new HandlebarsAdapter(undefined, {
  //   //   inlineCssEnabled: true,
  //   //   inlineCssOptions: {
  //   //     url: '',
  //   //     preserveMediaQueries: true,
  //   //   } as any,
  //   // }),
  //   // adapter: new HandlebarsAdapter(),
  //   options: {
  //     strict: true,
  //     // layoutsDir: join(process.cwd(), 'dist', 'views', 'layouts'),
  //     // partials: join(process.cwd(), 'dist', 'views', 'partials'),
  //     // Add these configuration options
  //     layoutsDir: join(
  //       __dirname,
  //       '..',
  //       '..',
  //       'views',
  //       'emails',
  //       'layouts',
  //     ),
  //     partialsDir: join(
  //       __dirname,
  //       '..',
  //       '..',
  //       'views',
  //       'emails',
  //       'partials',
  //     ),
  //   },
  // },
  //       };
  //     },
  //   }),
  // ],
  providers: [MailService, TemplateRendererService],
  exports: [MailService, MailerModule, TemplateRendererService],
})
export class MailModule {}

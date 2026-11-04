import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '../../mail/handlebars-adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Register partials
        // Handlebars.registerPartial(
        //   'header',
        //   readFileSync(
        //     join(process.cwd(), 'dist', 'views', 'partials', 'header.hbs'),
        //     'utf8',
        //   ),
        // );
        // Handlebars.registerPartial(
        //   'footer',
        //   readFileSync(
        //     join(process.cwd(), 'dist', 'views', 'partials', 'footer.hbs'),
        //     'utf8',
        //   ),
        // );

        // // Register a helper for layouts
        // Handlebars.registerHelper('extend', function (name, context) {
        //   const block = (this.blocks = this.blocks || {});
        //   block[name] = block[name] || [];
        //   block[name].push(context.fn(this));
        // });

        // Handlebars.registerHelper('block', function (name) {
        //   const block = this.blocks && this.blocks[name];
        //   return block ? block.join('\n') : '';
        // });

        return {
          transport: configService.get('mail.transport'),
          defaults: configService.get('mail.defaults'),
          // template: {
          //   dir: join(process.cwd(), 'dist', 'views', 'emails'), // Path to your email templates
          //   adapter: new HandlebarsAdapter(),
          //   options: {
          //     strict: true,
          //   },
          // },
          template: {
            dir: join(process.cwd(), 'dist', 'views', 'emails'),
            adapter: new HandlebarsAdapter(undefined, {
              inlineCssEnabled: true,
              inlineCssOptions: {
                url: '',
                preserveMediaQueries: true,
              } as any,
            }),
            options: {
              strict: true,
              partials: {
                dir: join(process.cwd(), 'dist', 'views', 'partials'),
                options: {
                  strict: true,
                },
              },
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

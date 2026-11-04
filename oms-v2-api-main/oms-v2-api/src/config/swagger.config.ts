import { AppConstants } from '@common/constants/constants';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

export function configSwagger(app: INestApplication): void {
  // Enable Basic Auth in production mode
  if (process.env.NODE_ENV === 'production') {
    app.use(
      ['/api/docs', '/api/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER as string]: process.env
            .SWAGGER_PASSWORD as string,
        },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle(AppConstants.app.name)
    .setDescription(AppConstants.app.description)
    .setVersion(AppConstants.app.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access_token',
    )
    // .addTag('Auth', 'Operations related to Auth')
    // .addTag('Status', 'Operations related to Status')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerEndPoint = process.env.SWAGGER_API_END_POINT;
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true, // Enable the filter feature
      showRequestDuration: true,
      defaultModelsExpandDepth: -1, // Minimize models by default
      defaultModelExpandDepth: -1, // Minimize model details by default
      docExpansion: 'none', // Minimize APIs under tags by default
    },
    // customCssUrl:
    //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui.min.css',
    // customJs: [
    //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui-bundle.js',
    //   'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui-standalone-preset.js',
    // ],
  });
}

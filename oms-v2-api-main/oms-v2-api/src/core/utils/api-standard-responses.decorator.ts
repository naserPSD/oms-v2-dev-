import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiStandardResponses(
  description = 'Success',
  statusCode = 200,
  type?: Type<unknown>,
  isArray = false,
) {
  const decorators = [
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  ];

  if (statusCode === 200) {
    decorators.unshift(
      type
        ? ApiResponse({ status: 200, description, type, isArray })
        : ApiResponse({ status: 200, description }),
    );
  }

  if (statusCode === 201) {
    decorators.unshift(
      type
        ? ApiResponse({ status: 201, description: 'Created', type, isArray })
        : ApiResponse({ status: 201, description: 'Created' }),
    );
  }

  return applyDecorators(...decorators);
}

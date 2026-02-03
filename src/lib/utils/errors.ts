export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: object
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createErrorResponse(error: unknown) {
  if (isAppError(error)) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      },
    };
  }

  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: null,
    },
    meta: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
    },
  };
}

export function createSuccessResponse<T>(data: T) {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
    },
  };
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleAsyncError = async <T>(
  promise: Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    return await promise
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw new AppError(
      error instanceof Error ? error.message : errorMessage,
      'ASYNC_ERROR'
    )
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      status: 'error'
    }
  }

  console.error('Unexpected error:', error)
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    status: 'error'
  }
}
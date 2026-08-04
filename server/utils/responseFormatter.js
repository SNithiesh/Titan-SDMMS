/**
 * Standard API response format for all endpoints
 * Every response follows the same structure so the frontend can
 * always expect { status, data, message, timestamp }
 */

export function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

export function errorResponse(res, message, statusCode = 500, code = 'INTERNAL_ERROR') {
  return res.status(statusCode).json({
    status: 'error',
    code,
    message,
    timestamp: new Date().toISOString()
  });
}

export function validationErrorResponse(res, errors) {
  return res.status(400).json({
    status: 'error',
    code: 'VALIDATION_FAILED',
    errors,
    timestamp: new Date().toISOString()
  });
}

/**
 * EquiFlow - Chuyển ngữ mã lỗi máy chủ sang tiếng Anh chuyên ngành thân thiện
 */
export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  HORSE_TRAINING_LOCKED: 'This horse is under a medical training lock issued by a veterinarian.',
  HORSE_NOT_FOUND: 'The requested horse profile could not be found.',
  INVALID_CREDENTIALS: 'The email address or password provided is incorrect.',
  OTP_EXPIRED: 'The verification code has expired. Please request a new OTP.',
  OTP_INVALID: 'The verification code entered is invalid.',
  STALL_OCCUPIED: 'This stall is currently assigned to another horse.',
  NETWORK_ERROR: 'Unable to reach the server. Please check your internet connection.',
  UNKNOWN_ERROR: 'An unexpected system error occurred. Please try again later.',
};

export function getErrorMessage(code?: string, fallback?: string): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  return fallback || ERROR_MESSAGES.UNKNOWN_ERROR;
}

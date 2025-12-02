/**
 * アプリケーションエラーの基底クラス
 */
export abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * エラーをJSON形式に変換
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      name: this.name,
      ...(this.cause && { cause: this.cause.message }),
    }
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400

  constructor(
    message: string,
    public readonly field?: string,
    cause?: Error
  ) {
    super(message, cause)
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends AppError {
  readonly code = 'AUTHENTICATION_ERROR'
  readonly statusCode = 401

  constructor(message: string = '認証に失敗しました', cause?: Error) {
    super(message, cause)
  }
}

/**
 * 認可エラー（権限不足）
 */
export class AuthorizationError extends AppError {
  readonly code = 'AUTHORIZATION_ERROR'
  readonly statusCode = 403

  constructor(message: string = 'この操作を実行する権限がありません', cause?: Error) {
    super(message, cause)
  }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404

  constructor(
    resource: string,
    identifier?: string | number,
    cause?: Error
  ) {
    const message = identifier
      ? `${resource} (ID: ${identifier}) が見つかりません`
      : `${resource} が見つかりません`
    super(message, cause)
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR'
  readonly statusCode = 500

  constructor(message: string, cause?: Error) {
    super(message, cause)
  }
}

/**
 * 外部サービスエラー
 */
export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR'
  readonly statusCode = 502

  constructor(
    service: string,
    message: string,
    cause?: Error
  ) {
    super(`${service}: ${message}`, cause)
  }
}

/**
 * ビジネスロジックエラー
 */
export class BusinessLogicError extends AppError {
  readonly code = 'BUSINESS_LOGIC_ERROR'
  readonly statusCode = 400

  constructor(message: string, cause?: Error) {
    super(message, cause)
  }
}

/**
 * 競合エラー（リソースの状態が競合している）
 */
export class ConflictError extends AppError {
  readonly code = 'CONFLICT'
  readonly statusCode = 409

  constructor(message: string, cause?: Error) {
    super(message, cause)
  }
}


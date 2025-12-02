import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, DatabaseError, BusinessLogicError, ConflictError } from '@/domain/common/errors'
import { Result } from '@/domain/common/result'

/**
 * エラーハンドラー
 * Result型からエラーを抽出し、適切な形式に変換
 */
export class ErrorHandler {
  /**
   * Result型からエラーを抽出して、ユーザーフレンドリーなメッセージに変換
   */
  static handleResult<T>(result: Result<T>): { data?: T; error?: string } {
    if (result.success) {
      return { data: result.data }
    }

    return {
      error: this.getUserFriendlyMessage(result.error),
    }
  }

  /**
   * エラータイプに応じたユーザーフレンドリーなメッセージを取得
   */
  static getUserFriendlyMessage(error: AppError | Error): string {
    if (error instanceof ValidationError) {
      return error.message
    }

    if (error instanceof AuthenticationError) {
      return error.message
    }

    if (error instanceof AuthorizationError) {
      return error.message
    }

    if (error instanceof NotFoundError) {
      return error.message
    }

    if (error instanceof BusinessLogicError) {
      return error.message
    }

    if (error instanceof ConflictError) {
      return error.message
    }

    if (error instanceof DatabaseError) {
      // データベースエラーは詳細を隠す
      console.error('Database error:', error.cause || error)
      return 'データの処理中にエラーが発生しました。しばらく時間をおいて再度お試しください。'
    }

    // その他のエラー
    console.error('Unexpected error:', error)
    return error instanceof Error ? error.message : '予期しないエラーが発生しました'
  }

  /**
   * エラーのHTTPステータスコードを取得
   */
  static getStatusCode(error: AppError | Error): number {
    if (error instanceof AppError) {
      return error.statusCode
    }
    return 500
  }

  /**
   * エラーコードを取得
   */
  static getErrorCode(error: AppError | Error): string {
    if (error instanceof AppError) {
      return error.code
    }
    return 'UNKNOWN_ERROR'
  }
}


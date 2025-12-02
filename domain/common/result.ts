/**
 * Result型
 * 成功または失敗を表す型
 */
export type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * 成功を表す型
 */
export interface Success<T> {
  readonly success: true
  readonly data: T
}

/**
 * 失敗を表す型
 */
export interface Failure<E> {
  readonly success: false
  readonly error: E
}

/**
 * Result型のヘルパー関数
 */
export const Result = {
  /**
   * 成功を表すResultを作成
   */
  success: <T>(data: T): Success<T> => ({
    success: true,
    data,
  }),

  /**
   * 失敗を表すResultを作成
   */
  failure: <E>(error: E): Failure<E> => ({
    success: false,
    error,
  }),

  /**
   * Resultが成功かどうかを判定
   */
  isSuccess: <T, E>(result: Result<T, E>): result is Success<T> => {
    return result.success === true
  },

  /**
   * Resultが失敗かどうかを判定
   */
  isFailure: <T, E>(result: Result<T, E>): result is Failure<E> => {
    return result.success === false
  },
}


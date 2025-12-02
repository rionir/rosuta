/**
 * ユーザーの氏名を結合して表示用の文字列を返す
 * @param user ユーザーオブジェクト
 * @param options オプション（スペースなしで結合する場合は { noSpace: true }）
 */
export function formatUserName(
  user: {
    last_name: string
    first_name: string
  } | null,
  options?: { noSpace?: boolean }
): string {
  const separator = options?.noSpace ? '' : ' '
  return user 
    ? `${user.last_name}${separator}${user.first_name}`.trim()
    : "不明"
}

/**
 * ユーザーの氏名のイニシャルを返す（表示用）
 */
export function getUserInitial(user: {
  last_name: string
  first_name: string
}): string {
  return user.last_name[0] || 'U'
}


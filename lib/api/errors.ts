import { HTTPError, isHTTPError, isTimeoutError } from "ky"

type ApiErrorOptions = {
  cause?: unknown
  details?: unknown
  isNetworkError?: boolean
  isTimeout?: boolean
  response?: Response
  status?: number
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Запрос содержит ошибки. Проверьте введённые данные.",
  401: "Сессия недоступна. Попробуйте обновить страницу.",
  403: "У вас нет прав для этого действия.",
  404: "Запрошенные данные не найдены.",
  409: "Данные уже изменились. Обновите страницу и повторите попытку.",
  422: "Сервер не смог обработать данные. Проверьте поля формы.",
  429: "Слишком много запросов. Повторите попытку чуть позже.",
  500: "Сервер временно недоступен. Попробуйте позже.",
  502: "Промежуточный сервер вернул ошибку. Повторите попытку позже.",
  503: "Сервис временно недоступен. Повторите попытку позже.",
  504: "Сервер не ответил вовремя. Повторите попытку позже.",
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function firstString(...values: unknown[]) {
  return values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  )
}

async function parseErrorPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  try {
    if (contentType.includes("application/json")) {
      return await response.clone().json()
    }

    const text = await response.clone().text()
    return text.trim().length > 0 ? text : undefined
  } catch {
    return undefined
  }
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload.trim() || undefined
  }

  if (!isRecord(payload)) {
    return undefined
  }

  const nestedError = isRecord(payload.error) ? payload.error : undefined
  const nestedDetail = isRecord(payload.detail) ? payload.detail : undefined

  return firstString(
    payload.message,
    payload.error,
    payload.detail,
    payload.title,
    nestedError?.message,
    nestedError?.detail,
    nestedDetail?.message,
  )
}

export class ApiError extends Error {
  cause?: unknown
  details?: unknown
  isNetworkError: boolean
  isTimeout: boolean
  response?: Response
  status?: number

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message)
    this.name = "ApiError"
    this.cause = options.cause
    this.details = options.details
    this.isNetworkError = options.isNetworkError ?? false
    this.isTimeout = options.isTimeout ?? false
    this.response = options.response
    this.status = options.status
  }
}

export async function normalizeApiError(error: unknown): Promise<ApiError> {
  if (error instanceof ApiError) {
    return error
  }

  if (isTimeoutError(error)) {
    return new ApiError("Сервер не ответил вовремя. Повторите попытку позже.", {
      cause: error,
      isTimeout: true,
      isNetworkError: true,
    })
  }

  if (isHTTPError(error)) {
    const status = error.response.status
    const payload = await parseErrorPayload(error.response)
    const message =
      extractErrorMessage(payload) ??
      STATUS_MESSAGES[status] ??
      `Запрос завершился с ошибкой (${status}).`

    return new ApiError(message, {
      cause: error,
      details: payload,
      response: error.response,
      status,
    })
  }

  if (error instanceof HTTPError) {
    return new ApiError(`Запрос завершился с ошибкой (${error.response.status}).`, {
      cause: error,
      response: error.response,
      status: error.response.status,
    })
  }

  if (error instanceof TypeError) {
    return new ApiError("Не удалось подключиться к серверу. Проверьте соединение и повторите попытку.", {
      cause: error,
      isNetworkError: true,
    })
  }

  if (error instanceof Error) {
    return new ApiError(error.message || "Произошла непредвиденная ошибка.", {
      cause: error,
    })
  }

  return new ApiError("Произошла непредвиденная ошибка.", { cause: error })
}

export function getErrorMessage(
  error: unknown,
  fallback = "Произошла непредвиденная ошибка.",
) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export function shouldRetryRequest(failureCount: number, error: unknown) {
  if (failureCount >= 1) {
    return false
  }

  if (error instanceof ApiError && error.status) {
    if (error.status < 500 && error.status !== 408 && error.status !== 429) {
      return false
    }
  }

  return true
}

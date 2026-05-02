import { z } from "zod"

/**
 * Base abstract mapper class with Zod validation support
 * Provides strict type parsing from backend responses
 */
export abstract class BaseMapper<TDomain, TResponse, TBackend = unknown> {
  /**
   * Zod schema for validating backend response
   */
  protected abstract readonly backendSchema: z.ZodType<TBackend>

  /**
   * Convert validated backend data to frontend domain model
   */
  protected abstract parseToDomain(data: TBackend): TDomain

  /**
   * Convert frontend domain model to backend request format
   */
  abstract toResponse(domain: TResponse): Record<string, unknown>

  /**
   * Convert backend response to frontend domain model with validation
   */
  toDomain(backend: unknown): TDomain {
    const parsed = this.backendSchema.parse(backend)
    return this.parseToDomain(parsed)
  }

  /**
   * Convert multiple backend responses to frontend domain models
   */
  toDomainMany(backends: unknown[]): TDomain[] {
    return backends.map((item) => this.toDomain(item))
  }

  /**
   * Convert frontend domain models to backend request format
   */
  toResponseMany(domains: TResponse[]): Record<string, unknown>[] {
    return domains.map((domain) => this.toResponse(domain))
  }
}

import { z } from "zod"

import type { EmailMonitoringConfig, PlatformGroup } from "@/lib/types/complaint.type"

// Zod schemas for strict backend validation
const VkGroupBackendSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  url: z.string().optional().default(""),
  is_monitoring: z.union([z.boolean(), z.number()]).optional().default(false),
  userId: z.number().nullish(),
  user_id: z.number().nullish(),
  is_deleted: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

const EmailMonitoringBackendSchema = z.object({
  id: z.number(),
  name: z.string(),
  imap_server: z.string(),
  imap_port: z.number(),
  email: z.string(),
  password: z.string(),
  folder: z.string().optional(),
  use_ssl: z.boolean().optional(),
  check_interval: z.number().optional(),
  is_active: z.union([z.boolean(), z.number()]).optional(),
  is_monitoring: z.union([z.boolean(), z.number()]).optional(),
  is_running: z.union([z.boolean(), z.number()]).optional(),
  user_id: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Types inferred from schemas
type VkGroupBackend = z.infer<typeof VkGroupBackendSchema>
type EmailMonitoringBackend = z.infer<typeof EmailMonitoringBackendSchema>

/**
 * Base mapper for source entities with Zod validation
 */
abstract class SourceBaseMapper<TBackend> {
  protected abstract readonly backendSchema: z.ZodType<TBackend>

  protected abstract parseToDomain(data: TBackend): PlatformGroup

  toDomain(backend: unknown): PlatformGroup {
    const parsed = this.backendSchema.parse(backend)
    return this.parseToDomain(parsed)
  }

  listToDomain(backends: unknown[]): PlatformGroup[] {
    return backends.map((item) => this.toDomain(item))
  }

  toDomainSafe(backend: unknown): PlatformGroup | null {
    const result = this.backendSchema.safeParse(backend)
    if (result.success) {
      return this.parseToDomain(result.data)
    }
    return null
  }

  listToDomainSafe(backends: unknown[]): PlatformGroup[] {
    return backends
      .map((item) => this.toDomainSafe(item))
      .filter((item): item is PlatformGroup => item !== null)
  }
}

/**
 * VK Group Mapper with Zod validation
 */
class VkGroupMapper extends SourceBaseMapper<VkGroupBackend> {
  protected readonly backendSchema = VkGroupBackendSchema

  protected parseToDomain(data: VkGroupBackend): PlatformGroup {
    return {
      id: data.id.toString(),
      name: data.name,
      enabled: data.is_monitoring === true || data.is_monitoring === 1,
      platform: "vk",
      userId: data.userId ?? data.user_id ?? 0,
    }
  }

  toResponse(data: { url: string; name: string }): Record<string, unknown> {
    return {
      url: data.url,
      name: data.name,
    }
  }
}

/**
 * Email Monitoring Mapper with Zod validation
 */
class EmailMonitoringMapper extends SourceBaseMapper<EmailMonitoringBackend> {
  protected readonly backendSchema = EmailMonitoringBackendSchema

  protected parseToDomain(data: EmailMonitoringBackend): PlatformGroup {
    const enabled =
      data.is_running === true ||
      data.is_running === 1 ||
      data.is_monitoring === true ||
      data.is_monitoring === 1 ||
      data.is_active === true ||
      data.is_active === 1

    return {
      id: data.id.toString(),
      name: data.name,
      enabled,
      platform: "email",
      userId: data.user_id,
    }
  }

  toResponse(frontend: EmailMonitoringConfig): Record<string, unknown> {
    return {
      name: frontend.name,
      imap_server: frontend.imap_server,
      imap_port: frontend.imap_port,
      email: frontend.email,
      password: frontend.password,
      folder: frontend.folder,
      use_ssl: frontend.use_ssl,
      check_interval: frontend.check_interval,
    }
  }
}

// Singleton instances
const vkGroupMapper = new VkGroupMapper()
const emailMonitoringMapper = new EmailMonitoringMapper()

/**
 * Unified SourceMapper providing access to all source mappers
 */
export class SourceMapper {
  // VK Group methods
  static vkGroupToDomain(backend: unknown): PlatformGroup {
    return vkGroupMapper.toDomain(backend)
  }

  static vkGroupToDomainMany(backends: unknown[]): PlatformGroup[] {
    return vkGroupMapper.listToDomainSafe(backends)
  }

  static vkGroupToResponse(data: { url: string; name: string }): Record<string, unknown> {
    return vkGroupMapper.toResponse(data)
  }

  // Email Monitoring methods
  static emailMonitoringToDomain(backend: unknown): PlatformGroup {
    return emailMonitoringMapper.toDomain(backend)
  }

  static emailMonitoringToDomainMany(backends: unknown[]): PlatformGroup[] {
    return emailMonitoringMapper.listToDomain(backends)
  }

  static emailConfigToResponse(frontend: EmailMonitoringConfig): Record<string, unknown> {
    return emailMonitoringMapper.toResponse(frontend)
  }
}

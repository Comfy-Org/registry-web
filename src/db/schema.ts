import { z } from 'zod'

// Define the schema for our main entities using Zod for type safety

export const NodeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    license: z.string().optional(),
    repository: z.string().optional(),
    tags: z.array(z.string()).default([]),
    latest_version: z.string().optional(),
    total_downloads: z.number().default(0),
    rating: z.number().min(0).max(5).optional(),
    rating_count: z.number().default(0),
    publisher_id: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    deprecated: z.boolean().default(false),
    icon: z.string().optional(),
})

export const PublisherSchema = z.object({
    id: z.string(),
    name: z.string(),
    display_name: z.string(),
    description: z.string().optional(),
    website: z.string().optional(),
    github_organization_name: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    logo: z.string().optional(),
    member_count: z.number().default(0),
    node_count: z.number().default(0),
})

export const NodeVersionSchema = z.object({
    id: z.string(),
    node_id: z.string(),
    version: z.string(),
    changelog: z.string().optional(),
    dependencies: z.record(z.string(), z.any()).optional(),
    download_url: z.string().optional(),
    comfyui_versions: z.array(z.string()).default([]),
    created_at: z.string(),
    updated_at: z.string(),
    deprecated: z.boolean().default(false),
    downloads: z.number().default(0),
})

export const AccessTokenSchema = z.object({
    id: z.string(),
    publisher_id: z.string(),
    display_name: z.string(),
    scopes: z.array(z.string()).default([]),
    created_at: z.string(),
    last_used_at: z.string().optional(),
    expires_at: z.string().optional(),
    is_active: z.boolean().default(true),
})

export const AuditLogSchema = z.object({
    id: z.string(),
    user_id: z.string().optional(),
    publisher_id: z.string().optional(),
    action: z.string(),
    entity_type: z.string(),
    entity_id: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    created_at: z.string(),
    ip_address: z.string().optional(),
})

export const UserActivitySchema = z.object({
    id: z.string(),
    user_id: z.string(),
    action_type: z.enum(['view', 'download', 'rate', 'favorite', 'install']),
    node_id: z.string().optional(),
    publisher_id: z.string().optional(),
    created_at: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
})

// Type exports
export type Node = z.infer<typeof NodeSchema>
export type Publisher = z.infer<typeof PublisherSchema>
export type NodeVersion = z.infer<typeof NodeVersionSchema>
export type AccessToken = z.infer<typeof AccessTokenSchema>
export type AuditLog = z.infer<typeof AuditLogSchema>
export type UserActivity = z.infer<typeof UserActivitySchema>

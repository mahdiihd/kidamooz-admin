export type AuditEntityType = 'story' | 'category' | 'catalog';
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'reorder'
  | 'rebuild_version';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityTitle: string;
  actorEmail: string;
  timestamp: string;
  details?: string;
}

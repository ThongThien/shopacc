export interface AuditLog {
  id: number;
  userId: number | null;
  username: string | null;
  action: string;
  metadata: string;
  ipAddress: string;
  createdAt: string;
}

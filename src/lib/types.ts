export type PipelineStageId =
  | 'new_lead'
  | 'contacted'
  | 'qualified'
  | 'visit'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  metaEvent: string | null;
  tiktokEvent: string | null;
  color: string;
  accentHex: string;
  description: string;
  isTerminal?: boolean;
}

export interface Vendor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'vendor';
  avatarUrl?: string;
  isActive: boolean;
}

export interface Lead {
  id: string;
  metaLeadId?: string | number;
  tiktokLeadId?: string;
  source: 'meta' | 'tiktok' | 'manual' | 'website';
  
  // Contact
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  
  // Pipeline & assignment
  stage: PipelineStageId;
  assignedTo?: string; // Vendor ID
  assignedVendor?: Vendor;
  
  // Real estate qualification
  lotInterest?: string;
  budgetRange?: string;
  notes?: string;
  dealValue?: number;
  currency: string;
  
  // Ad Attribution
  campaignName?: string;
  campaignId?: string;
  adsetName?: string;
  adName?: string;
  formName?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  stageUpdatedAt?: string;
}

export interface CapiEventLog {
  id: string;
  leadId?: string;
  platform: 'meta' | 'tiktok';
  eventName: string;
  eventId: string;
  actionSource: string;
  status: 'sent' | 'failed' | 'simulated';
  statusCode?: number;
  fbtraceId?: string;
  payloadSanitized: Record<string, unknown>;
  responseMessage?: string;
  sentAt: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

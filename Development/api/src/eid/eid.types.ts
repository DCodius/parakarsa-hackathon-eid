/** The e.id gateway wraps every response in { status, message, data }. */
export interface Envelope<T> {
  status?: boolean;
  message?: string;
  data?: T | null;
}

export interface EidToken {
  token_type?: string;
  token: string;
  expired_date?: string;
}

export interface EidProfile {
  email?: string;
  profile?: {
    address?: string;
    avatar?: string;
    countryphonecode?: string;
    fullname?: string;
    phonenumber?: string;
    /** 0 unverified · 1 basic (email+phone) · 2 moderate (+ formal ID). */
    tier?: number;
  };
}

export interface EidApp {
  app_name?: string;
  icon_url?: string;
  callback_url?: string;
  scopes?: string[];
}

/** Body the gateway POSTs to default_verify_url mid-issuance. */
export interface VerifyRequest {
  private_code?: string;
  email?: string;
  identifier_no?: string;
}

/** Body the gateway POSTs to default_webhook_url when a run finishes. */
export interface IssuanceWebhook {
  issuance_id?: string;
  record_id?: string;
  status?: 'started' | 'processing' | 'finished' | 'failed';
  kyc_status?: 'pending' | 'approved' | 'rejected';
  credential_status?: 'pending' | 'issued' | 'failed';
  credential_id?: string | null;
  started_at?: string;
  finished_at?: string;
  error_message?: string | null;
}

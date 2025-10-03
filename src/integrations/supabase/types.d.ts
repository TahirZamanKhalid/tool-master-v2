// Temporary stub for Lovable Cloud types until schema is generated.
// This unblocks TypeScript builds by providing a minimal Database type.
// It will be replaced automatically when the backend syncs.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, { Row: any; Insert: any; Update: any }>;
    Views: Record<string, { Row: any }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
};

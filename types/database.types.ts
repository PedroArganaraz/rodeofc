// Placeholder types — regenerate once the Supabase project ref is available:
//   npx supabase gen types typescript --project-id <ref> > types/database.types.ts
// Or paste the SQL schema and these will be written by hand to match it.
// Table names are kebab-case (e.g. "miembros-equipo"), so access them as
// supabase.from("miembros-equipo") and index the Tables map with the
// same string literal.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

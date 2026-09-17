export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      admin_users: {
        Row: { active: boolean; created_at: string; created_by: string | null; display_name: string; email: string; user_id: string };
        Insert: { active?: boolean; created_at?: string; created_by?: string | null; display_name: string; email: string; user_id: string };
        Update: { active?: boolean; created_at?: string; created_by?: string | null; display_name?: string; email?: string; user_id?: string };
        Relationships: [];
      };
      inventory_adjustments: {
        Row: { changed_at: string; changed_by: string; id: number; new_stock: number; previous_stock: number; sku: string };
        Insert: { changed_at?: string; changed_by: string; id?: never; new_stock: number; previous_stock: number; sku: string };
        Update: { changed_at?: string; changed_by?: string; id?: never; new_stock?: number; previous_stock?: number; sku?: string };
        Relationships: [{ foreignKeyName: "inventory_adjustments_sku_fkey"; columns: ["sku"]; isOneToOne: false; referencedRelation: "inventory_items"; referencedColumns: ["sku"] }];
      };
      inventory_items: {
        Row: { active: boolean; detail: string; name: string; price_cents: number; service_slug: string; sku: string; stock_quantity: number; updated_at: string; updated_by: string | null };
        Insert: { active?: boolean; detail: string; name: string; price_cents: number; service_slug: string; sku: string; stock_quantity?: number; updated_at?: string; updated_by?: string | null };
        Update: { active?: boolean; detail?: string; name?: string; price_cents?: number; service_slug?: string; sku?: string; stock_quantity?: number; updated_at?: string; updated_by?: string | null };
        Relationships: [];
      };
      stock_reservations: {
        Row: { completed_at: string | null; created_at: string; expires_at: string; id: string; quantity: number; released_at: string | null; sku: string; status: string; stripe_checkout_session_id: string | null };
        Insert: { completed_at?: string | null; created_at?: string; expires_at?: string; id?: string; quantity?: number; released_at?: string | null; sku: string; status?: string; stripe_checkout_session_id?: string | null };
        Update: { completed_at?: string | null; created_at?: string; expires_at?: string; id?: string; quantity?: number; released_at?: string | null; sku?: string; status?: string; stripe_checkout_session_id?: string | null };
        Relationships: [{ foreignKeyName: "stock_reservations_sku_fkey"; columns: ["sku"]; isOneToOne: false; referencedRelation: "inventory_items"; referencedColumns: ["sku"] }];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      attach_checkout_to_reservation: { Args: { p_checkout_session_id: string; p_reservation_id: string }; Returns: boolean };
      complete_inventory_reservation: { Args: { p_reservation_id: string }; Returns: boolean };
      release_expired_inventory: { Args: never; Returns: number };
      release_inventory_reservation: { Args: { p_reservation_id: string }; Returns: boolean };
      reserve_inventory: { Args: { p_quantity?: number; p_sku: string }; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"];
export type InventoryAdjustment = Database["public"]["Tables"]["inventory_adjustments"]["Row"];
export type PublicInventoryItem = Pick<InventoryItem, "sku" | "service_slug" | "name" | "detail" | "price_cents" | "stock_quantity" | "active">;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      sources: {
        Row: {
          id: number;
          name: string;
          listing_url: string;
          parser_strategy: Json;
          is_active: boolean;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          name: string;
          listing_url: string;
          parser_strategy?: Json;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          name?: string;
          listing_url?: string;
          parser_strategy?: Json;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: number;
          source_id: number;
          original_url: string;
          canonical_url: string;
          slug: string;
          title: string;
          image_url: string;
          image_alt: string | null;
          author: string | null;
          category: string | null;
          region: string | null;
          published_at: string;
          raw_text: string;
          read_time_minutes: number | null;
          scraped_at: string;
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          source_id: number;
          original_url: string;
          canonical_url: string;
          slug: string;
          title: string;
          image_url: string;
          image_alt?: string | null;
          author?: string | null;
          category?: string | null;
          region?: string | null;
          published_at: string;
          raw_text: string;
          read_time_minutes?: number | null;
          scraped_at?: string;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          source_id?: number;
          original_url?: string;
          canonical_url?: string;
          slug?: string;
          title?: string;
          image_url?: string;
          image_alt?: string | null;
          author?: string | null;
          category?: string | null;
          region?: string | null;
          published_at?: string;
          raw_text?: string;
          read_time_minutes?: number | null;
          scraped_at?: string;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      article_analyses: {
        Row: {
          id: number;
          article_id: number;
          summary: string;
          sentiment_score: number;
          sentiment_label: "positive" | "neutral" | "negative";
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          bias_score: number;
          bias_label: "left" | "center" | "right" | "mixed" | "unclear";
          confidence: number;
          framing_notes: string;
          loaded_terms: string[];
          disclaimer: string;
          model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          article_id: number;
          summary: string;
          sentiment_score: number;
          sentiment_label: "positive" | "neutral" | "negative";
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          bias_score?: never;
          bias_label: "left" | "center" | "right" | "mixed" | "unclear";
          confidence: number;
          framing_notes: string;
          loaded_terms?: string[];
          disclaimer: string;
          model: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          article_id?: number;
          summary?: string;
          sentiment_score?: number;
          sentiment_label?: "positive" | "neutral" | "negative";
          left_percentage?: number;
          center_percentage?: number;
          right_percentage?: number;
          bias_score?: never;
          bias_label?: "left" | "center" | "right" | "mixed" | "unclear";
          confidence?: number;
          framing_notes?: string;
          loaded_terms?: string[];
          disclaimer?: string;
          model?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_analyses_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: true;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      logs: {
        Row: {
          id: number;
          level: "debug" | "info" | "warn" | "error";
          event_type: string;
          message: string;
          source_id: number | null;
          article_id: number | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          level: "debug" | "info" | "warn" | "error";
          event_type: string;
          message: string;
          source_id?: number | null;
          article_id?: number | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: never;
          level?: "debug" | "info" | "warn" | "error";
          event_type?: string;
          message?: string;
          source_id?: number | null;
          article_id?: number | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "logs_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "logs_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      oxylabs_schedules: {
        Row: {
          id: number;
          source_id: number;
          oxylabs_schedule_id: string;
          state: "active" | "inactive" | "error";
          last_synced_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          source_id: number;
          oxylabs_schedule_id: string;
          state?: "active" | "inactive" | "error";
          last_synced_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          source_id?: number;
          oxylabs_schedule_id?: string;
          state?: "active" | "inactive" | "error";
          last_synced_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oxylabs_schedules_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: true;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      oxylabs_schedule_runs: {
        Row: {
          id: number;
          schedule_id: number;
          oxylabs_run_id: string;
          oxylabs_job_id: string;
          result_status: "pending" | "done" | "faulted";
          processing_status: "pending" | "processing" | "processed" | "failed";
          summary: Json;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          schedule_id: number;
          oxylabs_run_id: string;
          oxylabs_job_id: string;
          result_status?: "pending" | "done" | "faulted";
          processing_status?: "pending" | "processing" | "processed" | "failed";
          summary?: Json;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          schedule_id?: number;
          oxylabs_run_id?: string;
          oxylabs_job_id?: string;
          result_status?: "pending" | "done" | "faulted";
          processing_status?: "pending" | "processing" | "processed" | "failed";
          summary?: Json;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oxylabs_schedule_runs_schedule_id_fkey";
            columns: ["schedule_id"];
            isOneToOne: false;
            referencedRelation: "oxylabs_schedules";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][PublicTableName]["Row"];

export type TablesInsert<
  PublicTableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][PublicTableName]["Insert"];

export type TablesUpdate<
  PublicTableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][PublicTableName]["Update"];

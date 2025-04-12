export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      server_info: {
        Row: {
          id: number;
          ip: string;
          version: string;
          status: string;
          players: string;
          uptime: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          ip: string;
          version: string;
          status: string;
          players: string;
          uptime: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          ip?: string;
          version?: string;
          status?: string;
          players?: string;
          uptime?: string;
          updated_at?: string;
        };
      };
      info_sections: {
        Row: {
          id: number;
          title: string;
          content: string;
          icon: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          content: string;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      server_rules: {
        Row: {
          id: number;
          title: string;
          description: string;
          display_order: number;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          display_order?: number;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          display_order?: number;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: 'admin' | 'moderator' | 'user';
          is_super_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          role?: 'admin' | 'moderator' | 'user';
          is_super_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          role?: 'admin' | 'moderator' | 'user';
          is_super_admin?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
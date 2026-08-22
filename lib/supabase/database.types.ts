export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      empresas: {
        Row: {
          categoria_solucao: string
          criado_em: string
          desc_solucao: string | null
          email: string
          estagio: string
          id: string
          nome_empresa: string
          porte_alvo: string
          regioes_atendidas: string
          responsavel: string
          telefone: string
          uf: string
        }
        Insert: {
          categoria_solucao: string
          criado_em?: string
          desc_solucao?: string | null
          email: string
          estagio: string
          id?: string
          nome_empresa: string
          porte_alvo: string
          regioes_atendidas: string
          responsavel: string
          telefone: string
          uf: string
        }
        Update: {
          categoria_solucao?: string
          criado_em?: string
          desc_solucao?: string | null
          email?: string
          estagio?: string
          id?: string
          nome_empresa?: string
          porte_alvo?: string
          regioes_atendidas?: string
          responsavel?: string
          telefone?: string
          uf?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          criado_em: string
          empresa_id: string
          id: string
          produtor_id: string
          score: number
          status: string
        }
        Insert: {
          criado_em?: string
          empresa_id: string
          id?: string
          produtor_id: string
          score: number
          status?: string
        }
        Update: {
          criado_em?: string
          empresa_id?: string
          id?: string
          produtor_id?: string
          score?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "produtores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_produtor_id_fkey"
            columns: ["produtor_id"]
            isOneToOne: false
            referencedRelation: "produtores_publico"
            referencedColumns: ["id"]
          },
        ]
      }
      produtores: {
        Row: {
          atividade: string
          categoria_desafio: string
          criado_em: string
          desc_desafio: string | null
          email: string
          id: string
          municipio: string
          nome: string
          porte: string
          telefone: string
          uf: string
          urgencia: string
        }
        Insert: {
          atividade: string
          categoria_desafio: string
          criado_em?: string
          desc_desafio?: string | null
          email: string
          id?: string
          municipio: string
          nome: string
          porte: string
          telefone: string
          uf: string
          urgencia: string
        }
        Update: {
          atividade?: string
          categoria_desafio?: string
          criado_em?: string
          desc_desafio?: string | null
          email?: string
          id?: string
          municipio?: string
          nome?: string
          porte?: string
          telefone?: string
          uf?: string
          urgencia?: string
        }
        Relationships: []
      }
    }
    Views: {
      empresas_publico: {
        Row: {
          categoria_solucao: string | null
          criado_em: string | null
          desc_solucao: string | null
          estagio: string | null
          id: string | null
          porte_alvo: string | null
          regioes_atendidas: string | null
          uf: string | null
        }
        Insert: {
          categoria_solucao?: string | null
          criado_em?: string | null
          desc_solucao?: string | null
          estagio?: string | null
          id?: string | null
          porte_alvo?: string | null
          regioes_atendidas?: string | null
          uf?: string | null
        }
        Update: {
          categoria_solucao?: string | null
          criado_em?: string | null
          desc_solucao?: string | null
          estagio?: string | null
          id?: string | null
          porte_alvo?: string | null
          regioes_atendidas?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      produtores_publico: {
        Row: {
          atividade: string | null
          categoria_desafio: string | null
          criado_em: string | null
          desc_desafio: string | null
          id: string | null
          municipio: string | null
          porte: string | null
          uf: string | null
          urgencia: string | null
        }
        Insert: {
          atividade?: string | null
          categoria_desafio?: string | null
          criado_em?: string | null
          desc_desafio?: string | null
          id?: string | null
          municipio?: string | null
          porte?: string | null
          uf?: string | null
          urgencia?: string | null
        }
        Update: {
          atividade?: string | null
          categoria_desafio?: string | null
          criado_em?: string | null
          desc_desafio?: string | null
          id?: string | null
          municipio?: string | null
          porte?: string | null
          uf?: string | null
          urgencia?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


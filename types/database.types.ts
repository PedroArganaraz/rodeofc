export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      asistencia: {
        Row: {
          estado: string
          fecha: string
          id: string
          jugadora_id: string
        }
        Insert: {
          estado: string
          fecha: string
          id?: string
          jugadora_id: string
        }
        Update: {
          estado?: string
          fecha?: string
          id?: string
          jugadora_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_jugadora_id_fkey"
            columns: ["jugadora_id"]
            isOneToOne: false
            referencedRelation: "jugadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      ejercicios: {
        Row: {
          categoria: string
          created_at: string
          equipo_id: string
          id: string
          titulo: string
        }
        Insert: {
          categoria: string
          created_at?: string
          equipo_id: string
          id?: string
          titulo: string
        }
        Update: {
          categoria?: string
          created_at?: string
          equipo_id?: string
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ejercicios_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      entrenamientos: {
        Row: {
          created_at: string
          equipo_id: string
          id: string
          titulo: string
        }
        Insert: {
          created_at?: string
          equipo_id: string
          id?: string
          titulo: string
        }
        Update: {
          created_at?: string
          equipo_id?: string
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "entrenamientos_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      "entrenamientos-ejercicios": {
        Row: {
          ejercicio_id: string
          entrenamiento_id: string
          id: string
          orden: number
        }
        Insert: {
          ejercicio_id: string
          entrenamiento_id: string
          id?: string
          orden: number
        }
        Update: {
          ejercicio_id?: string
          entrenamiento_id?: string
          id?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "entrenamientos-ejercicios_ejercicio_id_fkey"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrenamientos-ejercicios_entrenamiento_id_fkey"
            columns: ["entrenamiento_id"]
            isOneToOne: false
            referencedRelation: "entrenamientos"
            referencedColumns: ["id"]
          },
        ]
      }
      equipos: {
        Row: {
          created_at: string
          escudo_url: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          escudo_url?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          escudo_url?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      formaciones: {
        Row: {
          created_at: string
          equipo_id: string
          esquema: string
          id: string
          nombre: string | null
        }
        Insert: {
          created_at?: string
          equipo_id: string
          esquema: string
          id?: string
          nombre?: string | null
        }
        Update: {
          created_at?: string
          equipo_id?: string
          esquema?: string
          id?: string
          nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formaciones_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      "formaciones-jugadoras": {
        Row: {
          formacion_id: string
          id: string
          jugadora_id: string
          orden_suplente: number | null
          posicion_x: number | null
          posicion_y: number | null
          titular: boolean
        }
        Insert: {
          formacion_id: string
          id?: string
          jugadora_id: string
          orden_suplente?: number | null
          posicion_x?: number | null
          posicion_y?: number | null
          titular?: boolean
        }
        Update: {
          formacion_id?: string
          id?: string
          jugadora_id?: string
          orden_suplente?: number | null
          posicion_x?: number | null
          posicion_y?: number | null
          titular?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "formaciones-jugadoras_formacion_id_fkey"
            columns: ["formacion_id"]
            isOneToOne: false
            referencedRelation: "formaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formaciones-jugadoras_jugadora_id_fkey"
            columns: ["jugadora_id"]
            isOneToOne: false
            referencedRelation: "jugadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      jugadoras: {
        Row: {
          apellido: string
          created_at: string
          dorsal: number | null
          equipo_id: string
          id: string
          nombre: string
          posicion: string | null
        }
        Insert: {
          apellido: string
          created_at?: string
          dorsal?: number | null
          equipo_id: string
          id?: string
          nombre: string
          posicion?: string | null
        }
        Update: {
          apellido?: string
          created_at?: string
          dorsal?: number | null
          equipo_id?: string
          id?: string
          nombre?: string
          posicion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jugadoras_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      "miembros-equipo": {
        Row: {
          created_at: string
          equipo_id: string
          id: string
          rol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipo_id: string
          id?: string
          rol: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipo_id?: string
          id?: string
          rol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembros-equipo_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      "participacion-partidos": {
        Row: {
          convocada: boolean
          id: string
          jugadora_id: string
          jugo: boolean
          minutos_jugados: number
          partido_id: string
        }
        Insert: {
          convocada?: boolean
          id?: string
          jugadora_id: string
          jugo?: boolean
          minutos_jugados?: number
          partido_id: string
        }
        Update: {
          convocada?: boolean
          id?: string
          jugadora_id?: string
          jugo?: boolean
          minutos_jugados?: number
          partido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participacion-partidos_jugadora_id_fkey"
            columns: ["jugadora_id"]
            isOneToOne: false
            referencedRelation: "jugadoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participacion-partidos_partido_id_fkey"
            columns: ["partido_id"]
            isOneToOne: false
            referencedRelation: "partidos"
            referencedColumns: ["id"]
          },
        ]
      }
      partidos: {
        Row: {
          cancha: string | null
          equipo_id: string
          estado: string
          fecha: string
          hora: string | null
          id: string
          rival_id: string | null
          torneo_id: string | null
        }
        Insert: {
          cancha?: string | null
          equipo_id: string
          estado?: string
          fecha: string
          hora?: string | null
          id?: string
          rival_id?: string | null
          torneo_id?: string | null
        }
        Update: {
          cancha?: string | null
          equipo_id?: string
          estado?: string
          fecha?: string
          hora?: string | null
          id?: string
          rival_id?: string | null
          torneo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partidos_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidos_rival_id_fkey"
            columns: ["rival_id"]
            isOneToOne: false
            referencedRelation: "rivales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidos_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "torneos"
            referencedColumns: ["id"]
          },
        ]
      }
      "pasos-ejercicio": {
        Row: {
          descripcion: string
          ejercicio_id: string
          id: string
          orden: number
        }
        Insert: {
          descripcion: string
          ejercicio_id: string
          id?: string
          orden: number
        }
        Update: {
          descripcion?: string
          ejercicio_id?: string
          id?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "pasos-ejercicio_ejercicio_id_fkey"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      "resultados-partidos": {
        Row: {
          goles_contra: number
          goles_favor: number
          id: string
          partido_id: string
        }
        Insert: {
          goles_contra?: number
          goles_favor?: number
          id?: string
          partido_id: string
        }
        Update: {
          goles_contra?: number
          goles_favor?: number
          id?: string
          partido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resultados-partidos_partido_id_fkey"
            columns: ["partido_id"]
            isOneToOne: true
            referencedRelation: "partidos"
            referencedColumns: ["id"]
          },
        ]
      }
      rivales: {
        Row: {
          categoria: string
          equipo_id: string
          escudo_url: string | null
          id: string
          nombre: string
          notas: string | null
        }
        Insert: {
          categoria: string
          equipo_id: string
          escudo_url?: string | null
          id?: string
          nombre: string
          notas?: string | null
        }
        Update: {
          categoria?: string
          equipo_id?: string
          escudo_url?: string | null
          id?: string
          nombre?: string
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rivales_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      torneos: {
        Row: {
          anio: number
          division: string
          equipo_id: string
          id: string
          periodo: string
        }
        Insert: {
          anio: number
          division: string
          equipo_id: string
          id?: string
          periodo: string
        }
        Update: {
          anio?: number
          division?: string
          equipo_id?: string
          id?: string
          periodo?: string
        }
        Relationships: [
          {
            foreignKeyName: "torneos_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_miembro: { Args: { equipo: string }; Returns: boolean }
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
  public: {
    Enums: {},
  },
} as const


export type Database = {
  public: {
    Tables: {
      accesses: {
        Row: {
          id: number;
          created_at: string | null;
          name: string | null;
          description: string | null;
          status: string | null;
          logo: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string | null;
          name?: string | null;
          description?: string | null;
          status?: string | null;
          logo?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string | null;
          name?: string | null;
          description?: string | null;
          status?: string | null;
          logo?: string | null;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: number;
          created_at: string | null;
          title: string | null;
          description: string | null;
          video_url: string | null;
          stage_id: number | null;
          order_key: number;
          duration_minutes: number;
        };
        Insert: {
          id?: number;
          created_at?: string | null;
          title?: string | null;
          description?: string | null;
          video_url?: string | null;
          stage_id?: number | null;
          order_key?: number;
          duration_minutes?: number;
        };
        Update: {
          id?: number;
          created_at?: string | null;
          title?: string | null;
          description?: string | null;
          video_url?: string | null;
          stage_id?: number | null;
          order_key?: number;
          duration_minutes?: number;
        };
        Relationships: [
          {
            foreignKeyName: "courses_stage_id_fkey";
            columns: ["stage_id"];
            referencedRelation: "stages";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          file_url: string | null;
          data_created: string | null;
          is_mandatory: boolean;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          file_url?: string | null;
          data_created?: string | null;
          is_mandatory?: boolean;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          file_url?: string | null;
          data_created?: string | null;
          is_mandatory?: boolean;
        };
        Relationships: [];
      };
      onboardees: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          avatar: string | null;
          start_date: string | null;
          progress: number | null;
          current_task: string | null;
          deadline: string | null;
          status: string | null;
          total_tasks: number | null;
          completed_tasks: number | null;
          pending_questions: number | null;
          department: string | null;
          last_activity: string | null;
          next_meeting: string | null;
          created_at: string | null;
          buddy_id: string | null;
          role: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar?: string | null;
          start_date?: string | null;
          progress?: number | null;
          current_task?: string | null;
          deadline?: string | null;
          status?: string | null;
          total_tasks?: number | null;
          completed_tasks?: number | null;
          pending_questions?: number | null;
          department?: string | null;
          last_activity?: string | null;
          next_meeting?: string | null;
          created_at?: string | null;
          buddy_id?: string | null;
          role?: string;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar?: string | null;
          start_date?: string | null;
          progress?: number | null;
          current_task?: string | null;
          deadline?: string | null;
          status?: string | null;
          total_tasks?: number | null;
          completed_tasks?: number | null;
          pending_questions?: number | null;
          department?: string | null;
          last_activity?: string | null;
          next_meeting?: string | null;
          buddy_id?: string | null;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboardees_buddy_id_fkey";
            columns: ["buddy_id"];
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "onboardees_id_fkey";
            columns: ["id"];
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          }
        ];
      };
      onboardee_access_permissions: {
        Row: {
          id: number;
          onboardee_id: string;
          access_id: number;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          onboardee_id: string;
          access_id: number;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          onboardee_id?: string;
          access_id?: number;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "onboardee_access_permissions_onboardee_id_fkey";
            columns: ["onboardee_id"];
            referencedRelation: "onboardees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "onboardee_access_permissions_access_id_fkey";
            columns: ["access_id"];
            referencedRelation: "accesses";
            referencedColumns: ["id"];
          }
        ];
      };
      onboardee_progress: {
        Row: {
          id: number;
          onboardee_id: string;
          task_id: number | null;
          course_id: number | null;
          document_id: number | null;
          access_id: number | null;
          completed_at: string;
        };
        Insert: {
          id?: number;
          onboardee_id: string;
          task_id?: number | null;
          course_id?: number | null;
          document_id?: number | null;
          access_id?: number | null;
          completed_at?: string;
        };
        Update: {
          onboardee_id?: string;
          task_id?: number | null;
          course_id?: number | null;
          document_id?: number | null;
          access_id?: number | null;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboardee_progress_onboardee_id_fkey";
            columns: ["onboardee_id"];
            referencedRelation: "onboardees";
            referencedColumns: ["id"];
          }
        ];
      };
      stages: {
        Row: {
          id: number;
          title: string;
          subtitle: string | null;
          description: string | null;
          period: string | null;
          start_date: string | null;
          stage_order: number;
        };
        Insert: {
          id?: number;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          period?: string | null;
          start_date?: string | null;
          stage_order: number;
        };
        Update: {
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          period?: string | null;
          start_date?: string | null;
          stage_order?: number;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: number;
          title: string;
          type: string | null;
          stage_id: number | null;
        };
        Insert: {
          id?: number;
          title: string;
          type?: string | null;
          stage_id?: number | null;
        };
        Update: {
          title?: string;
          type?: string | null;
          stage_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_stage_id_fkey";
            columns: ["stage_id"];
            referencedRelation: "stages";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};

  };
};

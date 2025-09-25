-- Create clients table with i18n support
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL,
  name_i18n JSONB NOT NULL DEFAULT '{"nl": "", "en": "", "tr": ""}'::jsonb,
  contact_name TEXT,
  contact_email TEXT,
  billing_email TEXT,
  address_json JSONB,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table with i18n support
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL,
  client_id UUID NOT NULL,
  name_i18n JSONB NOT NULL DEFAULT '{"nl": "", "en": "", "tr": ""}'::jsonb,
  description_i18n JSONB DEFAULT '{"nl": "", "en": "", "tr": ""}'::jsonb,
  code TEXT,
  hourly_rate INTEGER, -- in cents, overrides contractor default if set
  po_number TEXT,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Create project view preferences (per-user project language)
CREATE TABLE public.project_view_prefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  locale public.locale NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id)
);

-- Create time entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL,
  project_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  hours DECIMAL(5,2) NOT NULL, -- total hours (can be calculated or manually entered)
  description TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable RLS on all new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_view_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "Contractors can manage their clients" ON public.clients
FOR ALL USING (contractor_id = auth.uid());

-- RLS policies for projects  
CREATE POLICY "Contractors can manage their projects" ON public.projects
FOR ALL USING (contractor_id = auth.uid());

-- RLS policies for project view preferences
CREATE POLICY "Users can manage their project view prefs" ON public.project_view_prefs
FOR ALL USING (user_id = auth.uid());

-- RLS policies for time entries
CREATE POLICY "Contractors can manage their time entries" ON public.time_entries
FOR ALL USING (contractor_id = auth.uid());

-- Add update triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_view_prefs_updated_at
  BEFORE UPDATE ON public.project_view_prefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_clients_contractor_id ON public.clients(contractor_id);
CREATE INDEX idx_projects_contractor_id ON public.projects(contractor_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_time_entries_contractor_id ON public.time_entries(contractor_id);
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(date);
CREATE INDEX idx_project_view_prefs_user_project ON public.project_view_prefs(user_id, project_id);
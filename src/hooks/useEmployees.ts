import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Employee {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  department: string | null;
  hire_date: string | null;
  status: string;
  resume_url: string | null;
  resume_name: string | null;
  notes: string | null;
  created_at: string;
}

export const useEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setEmployees(data as Employee[]);
      setLoading(false);
    };
    load();
    const ch = supabase
      .channel("employees-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "employees" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const addEmployee = async (e: Partial<Employee>) => {
    if (!user) return;
    const { error } = await supabase.from("employees").insert({
      owner_id: user.id,
      name: e.name!,
      email: e.email,
      phone: e.phone,
      role: e.role,
      department: e.department,
      hire_date: e.hire_date,
      status: e.status ?? "ativo",
      notes: e.notes,
    });
    if (error) toast.error(error.message);
    else toast.success("Colaborador adicionado!");
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const { error } = await supabase.from("employees").update(updates).eq("id", id);
    if (error) toast.error(error.message);
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Colaborador removido.");
  };

  const uploadResume = async (id: string, file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/${id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("employee-resumes")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error("Erro no upload: " + error.message);
      return;
    }
    await supabase.from("employees").update({
      resume_url: path,
      resume_name: file.name,
    }).eq("id", id);
    toast.success("Currículo enviado!");
  };

  const getResumeUrl = async (path: string): Promise<string | null> => {
    const { data } = await supabase.storage
      .from("employee-resumes")
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  };

  return { employees, loading, addEmployee, updateEmployee, deleteEmployee, uploadResume, getResumeUrl };
};

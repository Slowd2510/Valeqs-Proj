import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function getServerInfo() {
  const { data, error } = await supabase
    .from('server_info')
    .select('*')
    .order('id')
    .limit(1)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getInfoSections() {
  const { data, error } = await supabase
    .from('info_sections')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data;
}

export async function getServerRules() {
  const { data, error } = await supabase
    .from('server_rules')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function getAdminByEmail(email: string) {
  const { data, error } = await supabase
    .from('Admins')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function verifyAdminSession(adminId: string) {
  const { data, error } = await supabase
    .from('Admins')
    .select('id, is_super_admin')
    .eq('id', adminId)
    .single();
  
  if (error) return false;
  return data?.is_super_admin === true;
}

export default supabase;
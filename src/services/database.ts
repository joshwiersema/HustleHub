import { supabase } from '../lib/supabase';
import { Client, Job, Payment } from '../types';

// ============================================================
// PROFILE
// ============================================================

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId: string, profile: {
  name: string;
  business_name: string;
  hustle_type: string;
  is_onboarded: boolean;
}) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ============================================================
// CLIENTS
// ============================================================

export async function fetchClients(userId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapClientFromDb);
}

export async function insertClient(userId: string, client: Client) {
  const { error } = await supabase.from('clients').insert({
    id: client.id,
    user_id: userId,
    name: client.name,
    phone: client.phone,
    email: client.email,
    address: client.address,
    notes: client.notes,
    created_at: client.createdAt,
  });
  if (error) throw error;
}

export async function updateClient(clientId: string, updates: Partial<Client>) {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { error } = await supabase.from('clients').update(dbUpdates).eq('id', clientId);
  if (error) throw error;
}

export async function deleteClient(clientId: string) {
  const { error } = await supabase.from('clients').delete().eq('id', clientId);
  if (error) throw error;
}

function mapClientFromDb(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// ============================================================
// JOBS
// ============================================================

export async function fetchJobs(userId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapJobFromDb);
}

export async function insertJob(userId: string, job: Job) {
  const { error } = await supabase.from('jobs').insert({
    id: job.id,
    user_id: userId,
    client_id: job.clientId,
    client_name: job.clientName,
    title: job.title,
    date: job.date,
    time: job.time,
    duration: job.duration,
    price: job.price,
    status: job.status,
    recurring: job.recurring,
    recurring_frequency: job.recurringFrequency || null,
    notes: job.notes,
    address: job.address,
    photo_uri: job.photoUri || null,
  });
  if (error) throw error;
}

export async function updateJob(jobId: string, updates: Partial<Job>) {
  const dbUpdates: any = {};
  if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
  if (updates.recurringFrequency !== undefined) dbUpdates.recurring_frequency = updates.recurringFrequency;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.photoUri !== undefined) dbUpdates.photo_uri = updates.photoUri;

  const { error } = await supabase.from('jobs').update(dbUpdates).eq('id', jobId);
  if (error) throw error;
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);
  if (error) throw error;
}

function mapJobFromDb(row: any): Job {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    title: row.title,
    date: row.date,
    time: row.time,
    duration: row.duration,
    price: Number(row.price),
    status: row.status,
    recurring: row.recurring,
    recurringFrequency: row.recurring_frequency || undefined,
    notes: row.notes,
    address: row.address,
    photoUri: row.photo_uri || undefined,
  };
}

// ============================================================
// PAYMENTS
// ============================================================

export async function fetchPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPaymentFromDb);
}

export async function insertPayment(userId: string, payment: Payment) {
  const { error } = await supabase.from('payments').insert({
    id: payment.id,
    user_id: userId,
    job_id: payment.jobId || null,
    client_name: payment.clientName,
    amount: payment.amount,
    method: payment.method,
    date: payment.date,
    notes: payment.notes,
  });
  if (error) throw error;
}

export async function deletePayment(paymentId: string) {
  const { error } = await supabase.from('payments').delete().eq('id', paymentId);
  if (error) throw error;
}

function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    jobId: row.job_id || undefined,
    clientName: row.client_name,
    amount: Number(row.amount),
    method: row.method,
    date: row.date,
    notes: row.notes,
  };
}

// ============================================================
// GAME STATE
// ============================================================

export async function fetchGameState(userId: string) {
  const { data, error } = await supabase
    .from('game_state')
    .select('*')
    .eq('id', userId)
    .single();
  // PGRST116 = "not found" — game_state row doesn't exist yet, which is expected
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertGameState(userId: string, state: {
  xp: number;
  level: number;
  hustle_bucks: number;
  streak: number;
  last_activity_date: string | null;
  earned_badges: string[];
}) {
  const { error } = await supabase
    .from('game_state')
    .upsert({ id: userId, ...state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ============================================================
// SYNC — Pull all data for a user
// ============================================================

export async function syncAllFromCloud(userId: string) {
  const [profile, clients, jobs, payments, gameState] = await Promise.all([
    fetchProfile(userId),
    fetchClients(userId),
    fetchJobs(userId),
    fetchPayments(userId),
    fetchGameState(userId),
  ]);
  return { profile, clients, jobs, payments, gameState };
}

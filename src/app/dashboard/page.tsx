import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export const metadata = { title: 'My claims — SkyOwed' };

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: claims } = await supabase
    .from('claims')
    .select('*')
    .order('created_at', { ascending: false });

  return <DashboardClient claims={claims ?? []} userEmail={user.email ?? ''} />;
}

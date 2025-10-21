// src/pages/BuddyDashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { BuddyOnboardeesTab } from '@/components/buddy/BuddyOnboardeesTab';

export default function BuddyDashboard() {
  const [onboardeeCount, setOnboardeeCount] = useState(0);

  useEffect(() => {
    const fetchOnboardeeCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('onboardees')
          .select('id', { count: 'exact', head: true })
          .eq('buddy_id', user.id);
        setOnboardeeCount(count || 0);
      }
    };
    fetchOnboardeeCount();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel do Buddy</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Meus Onboardees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onboardeeCount}</div>
          <p className="text-xs text-muted-foreground">
            Pessoas que você está acompanhando.
          </p>
        </CardContent>
      </Card>

      <div>
        <BuddyOnboardeesTab />
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleManagement from '@/components/role-management';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RolesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Button>
      </div>

      <RoleManagement />
    </div>
  );
}

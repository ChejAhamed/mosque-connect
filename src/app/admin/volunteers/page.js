import { Suspense } from 'react';
import AdminVolunteersContent from './AdminVolunteersContent';

export default function AdminVolunteersPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
      <AdminVolunteersContent />
    </Suspense>
  );
}
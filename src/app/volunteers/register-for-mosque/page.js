import { Suspense } from 'react';
import RegisterForMosqueContent from './RegisterForMosqueContent';

export default function RegisterForMosquePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading registration form...</p>
          </div>
        </div>
      </div>
    }>
      <RegisterForMosqueContent />
    </Suspense>
  );
}
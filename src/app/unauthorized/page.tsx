import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4 text-center">
      <div className="mb-6 text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16 mx-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-8">
        You don&apos;t have permission to access this page. This area might be restricted to certain user roles.
      </p>
      <div className="space-y-4">
        <Link href="/">
          <Button className="w-full">Return to Home</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Login with Different Account
          </Button>
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalNotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. It may have been moved, renamed, or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
          <Link href="/mosques">
            <Button variant="outline">View Mosques</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

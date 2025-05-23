import Link from 'next/link';
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default function EventPage({ params }) {
  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Event Details</h1>
      <p className="text-gray-600 mb-6">
        This is a placeholder for Event ID: {params.id}
      </p>
      <Link href="/events">
        <Button>Return to Events</Button>
      </Link>
    </div>
  );
}

import { EVENT_IDS } from '@/lib/staticParams';
import EventDetail from './EventDetail';

// Required for static export
export function generateStaticParams() {
  return EVENT_IDS;
}

export default function EventPage({ params }) {
  return <EventDetail params={params} />;
}

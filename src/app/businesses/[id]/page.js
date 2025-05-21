import { BUSINESS_IDS } from '@/lib/staticParams';
import BusinessDetail from './BusinessDetail';

// Required for static export
export function generateStaticParams() {
  return BUSINESS_IDS;
}

export default function BusinessPage({ params }) {
  return <BusinessDetail params={params} />;
}

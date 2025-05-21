import { MOSQUE_IDS } from '@/lib/staticParams';
import MosqueDetail from './MosqueDetail';

// Required for static export
export function generateStaticParams() {
  return MOSQUE_IDS;
}

export default function MosquePage({ params }) {
  // For static export, use mock data instead of fetching from DB
  const mosqueData = {
    _id: params.id,
    name: "Masjid Al-Noor",
    description: "A beautiful mosque serving the local community with daily prayers and educational programs.",
    address: "123 Islamic Way",
    city: "Birmingham",
    state: "West Midlands",
    zipCode: "B1 1AA",
    phone: "0121-555-1234",
    email: "info@masjidalfurqan.org",
    website: "https://www.masjidalfurqan.org",
    imamName: "Imam Abdullah",
    prayerTimes: {
      fajr: "5:30 AM",
      dhuhr: "1:30 PM",
      asr: "5:00 PM",
      maghrib: "8:30 PM",
      isha: "10:00 PM",
      jumuah: "1:30 PM"
    },
    imageUrl: "https://images.unsplash.com/photo-1581859780486-bcb8d8376a23?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    facilityFeatures: ["Prayer Hall", "Wudu Area", "Women's Section", "Parking", "Library", "Community Hall"],
    events: [
      {
        id: "evt-1",
        title: "Quran Study Circle",
        description: "Weekly Quran study and discussion.",
        date: "Every Tuesday",
        time: "7:00 PM - 8:30 PM",
        recurring: true
      },
      {
        id: "evt-2",
        title: "Eid Prayer",
        description: "Eid-ul-Fitr prayer and celebration.",
        date: "April 21, 2023",
        time: "8:00 AM - 10:00 AM",
        recurring: false
      }
    ]
  };

  return <MosqueDetail mosque={mosqueData} />;
}

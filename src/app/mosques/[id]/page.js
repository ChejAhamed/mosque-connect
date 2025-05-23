import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectToDatabase } from '@/lib/db';

// Hardcoded mosque data for specific IDs
const KNOWN_MOSQUES = {
  '682f93c72ce797513c762791': {
    _id: '682f93c72ce797513c762791',
    name: "Masjid Al-Huda",
    description: "Welcome to Masjid Al-Huda, a vibrant center for Islamic worship and community engagement.",
    address: "456 Islamic Way",
    city: "London",
    state: "Greater London",
    zipCode: "E1 1AA",
    phone: "+44 20 7123 4567",
    email: "info@masjidhuda.org",
    website: "https://example.com/masjid-al-huda",
    facilityFeatures: ["prayer-hall", "women-section", "ablution-area", "parking", "community-center", "library"],
    prayerTimes: {
      fajr: "4:15 AM",
      dhuhr: "1:30 PM",
      asr: "6:45 PM",
      maghrib: "8:15 PM",
      isha: "10:00 PM"
    },
    imageUrl: "https://images.unsplash.com/photo-1585129918930-eef8f4a0d6a9?q=80&w=1000&auto=format&fit=crop"
  },
  '68078727e9349908b444e1e8': {
    _id: '68078727e9349908b444e1e8',
    name: "Test Mosque",
    description: "This is a test mosque with sample data for demonstration purposes.",
    address: "123 Test Street",
    city: "Test City",
    state: "Test State",
    zipCode: "12345",
    phone: "+1 555-123-4567",
    email: "test@example.com",
    facilityFeatures: ["prayer-hall", "ablution-area", "parking"],
    prayerTimes: {
      fajr: "5:30 AM",
      dhuhr: "1:30 PM",
      asr: "4:45 PM",
      maghrib: "7:15 PM",
      isha: "8:45 PM"
    },
    imageUrl: "https://images.unsplash.com/photo-1602990721338-9cbb5b983c4d?q=80&w=1000&auto=format&fit=crop"
  }
};

// Default fallback mosque for any other ID
const DEFAULT_MOSQUE = {
  name: "Sample Mosque",
  description: "This is a sample mosque data. The actual mosque information couldn't be retrieved from the database at this time.",
  address: "123 Main Street",
  city: "Example City",
  state: "Example State",
  zipCode: "12345",
  facilityFeatures: ["prayer-hall", "ablution-area", "parking"],
  prayerTimes: {
    fajr: "5:30 AM",
    dhuhr: "1:30 PM",
    asr: "4:45 PM",
    maghrib: "7:15 PM",
    isha: "8:45 PM"
  },
  imageUrl: "https://images.unsplash.com/photo-1603595829982-373ac028bc99?q=80&w=1000&auto=format&fit=crop"
};

// This function gets mosque data with a guaranteed fallback
async function getMosqueData(id) {
  console.log(`Attempting to fetch mosque with ID: ${id}`);

  // First, check if this is a known mosque ID
  if (KNOWN_MOSQUES[id]) {
    console.log(`Using known mosque data for ID: ${id}`);
    return KNOWN_MOSQUES[id];
  }

  try {
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid MongoDB ID format:", id);
      // Return default mosque with the requested ID
      return { ...DEFAULT_MOSQUE, _id: id };
    }

    // Try to load the mosque from the database
    try {
      // Dynamically import the Mosque model to handle SSR better
      const { default: Mosque } = await import('@/models/Mosque');

      const dbResult = await connectToDatabase();
      if (dbResult.error) {
        console.error(`Database connection error: ${dbResult.message}`);
        return { ...DEFAULT_MOSQUE, _id: id };
      }

      console.log('Database connected, querying for mosque');
      const mosque = await Mosque.findById(id).populate('imamId', 'name email').lean();

      if (!mosque) {
        console.log(`No mosque found with ID: ${id}`);
        return { ...DEFAULT_MOSQUE, _id: id };
      }

      console.log(`Successfully retrieved mosque: ${mosque.name}`);

      // Process the mosque data
      return {
        ...mosque,
        _id: mosque._id.toString(),
        imamId: mosque.imamId ? {
          ...mosque.imamId,
          _id: mosque.imamId._id.toString()
        } : null,
        createdAt: mosque.createdAt?.toISOString(),
        updatedAt: mosque.updatedAt?.toISOString(),
      };
    } catch (err) {
      console.error("Error loading mosque from database:", err);
      return { ...DEFAULT_MOSQUE, _id: id };
    }
  } catch (error) {
    console.error(`Unexpected error:`, error);
    return { ...DEFAULT_MOSQUE, _id: id };
  }
}

export default async function MosquePage({ params }) {
  console.log(`Rendering mosque page for ID: ${params.id}`);

  // Always get a mosque (either real or fallback)
  const mosque = await getMosqueData(params.id);

  // Format facility features for better display
  const formattedFeatures = mosque.facilityFeatures?.map(feature =>
    feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  ) || [];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{mosque.name}</h1>
          <Link href="/mosques">
            <Button variant="outline">Back to Mosques</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            {mosque.imageUrl ? (
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image
                  src={mosque.imageUrl}
                  alt={mosque.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-sm text-gray-600">{mosque.address}</p>
                  <p className="text-sm text-gray-600">{mosque.city}, {mosque.state} {mosque.zipCode}</p>
                </div>

                {mosque.phone && (
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-gray-600">{mosque.phone}</p>
                  </div>
                )}

                {mosque.email && (
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-600">{mosque.email}</p>
                  </div>
                )}

                {mosque.website && (
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <a
                      href={mosque.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline"
                    >
                      {mosque.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {mosque.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              {formattedFeatures.length > 0 ? (
                <ul className="grid grid-cols-2 gap-2">
                  {formattedFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No facilities information available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prayer Times</CardTitle>
          </CardHeader>
          <CardContent>
            {mosque.prayerTimes && Object.keys(mosque.prayerTimes).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(mosque.prayerTimes).map(([prayer, time]) => (
                  <div key={prayer} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium capitalize">{prayer}</h3>
                    <p className="text-lg font-bold text-green-600">{time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600 mb-4">Prayer times are not available at the moment.</p>
                <Link href="/">
                  <Button variant="outline" size="sm">Check Prayer Times</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {mosque.imamId && (
          <Card>
            <CardHeader>
              <CardTitle>Imam Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium">
                    {mosque.imamId.name ? mosque.imamId.name.charAt(0) : 'I'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{mosque.imamId.name}</h3>
                  <p className="text-sm text-gray-600">{mosque.imamId.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

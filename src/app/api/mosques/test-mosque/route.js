import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Mosque from '@/models/Mosque';

export async function GET() {
  try {
    await connectToDatabase();

    // Try to get any existing mosque
    const mosque = await Mosque.findOne().lean();

    if (mosque) {
      console.log(`Found a mosque with ID: ${mosque._id}`);
      return NextResponse.json({
        testMosqueId: mosque._id.toString(),
        mosqueName: mosque.name
      });
    }

    // If no mosques exist, create a test mosque
    const newMosque = new Mosque({
      name: "Test Mosque for Debugging",
      address: "123 Test Street",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      description: "This is a test mosque created for debugging purposes",
      facilityFeatures: ["prayer-hall", "ablution-area", "parking"],
      location: {
        type: "Point",
        coordinates: [40.7128, -74.0060]
      }
    });

    await newMosque.save();
    console.log(`Created a new test mosque with ID: ${newMosque._id}`);

    return NextResponse.json({
      testMosqueId: newMosque._id.toString(),
      mosqueName: newMosque.name,
      newlyCreated: true
    });

  } catch (error) {
    console.error('Error in test-mosque endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get or create test mosque' },
      { status: 500 }
    );
  }
}

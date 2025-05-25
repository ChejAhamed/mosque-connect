import connectDB from '../src/lib/db.js';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle ESM support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use dynamic import for Mosque model
async function getMosqueModel() {
  try {
    if (mongoose.models.Mosque) {
      return mongoose.models.Mosque;
    } else {
      const { Mosque } = await import('../src/models/Mosque.js');
      return Mosque;
    }
  } catch (error) {
    console.error('Error loading Mosque model:', error);
    throw error;
  }
}

// Real mosque data with accurate locations
const mosqueData = [
  {
    name: "East London Mosque",
    description: "One of the largest mosques in London and a key Islamic center.",
    address: "82-92 Whitechapel Rd",
    city: "London",
    state: "Greater London",
    zipCode: "E1 1JQ",
    phone: "+44 20 7650 3000",
    email: "info@eastlondonmosque.org.uk",
    website: "https://www.eastlondonmosque.org.uk/",
    facilityFeatures: ["Prayer Hall", "Library", "Classes", "Events", "Women's Section", "Funeral Services"],
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1588767768106-1b20e51d9d68?q=80&w=1452&auto=format&fit=crop",
    location: {
      type: "Point",
      coordinates: [-0.0631, 51.5162] // lng, lat
    },
    prayerTimes: {
      fajr: "05:15",
      dhuhr: "12:30",
      asr: "15:45",
      maghrib: "18:05",
      isha: "19:45"
    }
  },
  {
    name: "Birmingham Central Mosque",
    description: "A major mosque in the heart of Birmingham serving the community.",
    address: "180 Belgrave Middleway",
    city: "Birmingham",
    state: "West Midlands",
    zipCode: "B12 0XS",
    phone: "+44 121 440 5355",
    email: "enquiries@centralmosque.org.uk",
    website: "https://centralmosque.org.uk/",
    facilityFeatures: ["Prayer Hall", "Community Center", "Parking", "Wudu Facilities", "Function Hall", "Madrassah"],
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=1470&auto=format&fit=crop",
    location: {
      type: "Point",
      coordinates: [-1.8904, 52.4651] // lng, lat
    },
    prayerTimes: {
      fajr: "05:20",
      dhuhr: "12:30",
      asr: "15:40",
      maghrib: "18:00",
      isha: "19:40"
    }
  },
  {
    name: "Manchester Central Mosque",
    description: "A vibrant mosque serving Manchester's Muslim community.",
    address: "20 Upper Park Rd",
    city: "Manchester",
    state: "Greater Manchester",
    zipCode: "M14 5RU",
    phone: "+44 161 225 1863",
    email: "info@manchestermosque.org",
    website: "https://www.manchestermosque.org/",
    facilityFeatures: ["Prayer Hall", "Gardens", "Meeting Rooms", "Islamic School", "Community Services", "Charity Programs"],
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1564116296675-d7ac2ddd2a54?q=80&w=1374&auto=format&fit=crop",
    location: {
      type: "Point",
      coordinates: [-2.2252, 53.4563] // lng, lat
    },
    prayerTimes: {
      fajr: "05:10",
      dhuhr: "12:25",
      asr: "15:35",
      maghrib: "17:55",
      isha: "19:35"
    }
  },
  {
    name: "Leeds Grand Mosque",
    description: "A beautiful mosque providing spiritual guidance to the Leeds community.",
    address: "9 Woodsley Rd",
    city: "Leeds",
    state: "West Yorkshire",
    zipCode: "LS3 1DT",
    phone: "+44 113 345 4660",
    email: "info@leedsgrandmosque.com",
    website: "https://www.leedsgrandmosque.com/",
    facilityFeatures: ["Prayer Hall", "Library", "Conference Room", "Educational Programs", "Youth Activities"],
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1612908208754-d64d8335a8ec?w=500&auto=format&fit=crop",
    location: {
      type: "Point",
      coordinates: [-1.5608, 53.8032] // lng, lat
    },
    prayerTimes: {
      fajr: "05:25",
      dhuhr: "12:35",
      asr: "15:50",
      maghrib: "18:10",
      isha: "19:50"
    }
  },
  {
    name: "Glasgow Central Mosque",
    description: "Scotland's largest mosque serving the Muslim community in Glasgow.",
    address: "1 Mosque Ave",
    city: "Glasgow",
    state: "Scotland",
    zipCode: "G5 9TA",
    phone: "+44 141 429 3132",
    email: "info@glasgowcentralmosque.org",
    website: "https://www.glasgowcentralmosque.org/",
    facilityFeatures: ["Prayer Hall", "Library", "Mortuary", "Community Hall", "Islamic School"],
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1569068299729-c15056d2c291?w=500&auto=format&fit=crop",
    location: {
      type: "Point",
      coordinates: [-4.2518, 55.8505] // lng, lat
    },
    prayerTimes: {
      fajr: "05:30",
      dhuhr: "12:40",
      asr: "15:55",
      maghrib: "18:15",
      isha: "19:55"
    }
  },
  {
    name: "Cambridge Mosque",
    description: "Europe's first eco-mosque with stunning architecture and sustainable design.",
    address: "309-313 Mill Rd",
    city: "Cambridge",
    state: "Cambridgeshire",
    zipCode: "CB1 3DF",
    phone: "+44 1223 213767",
    email: "info@cambridgemosque.org",
    website: "https://cambridgemosque.org/",
    facilityFeatures: ["Eco-friendly Design", "Prayer Hall", "Garden", "Cafe", "Educational Center", "Exhibition Space"],
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=500&auto=format&fit=crop",
    location: {
      type: "Point",
      coordinates: [0.1519, 52.1942] // lng, lat
    },
    prayerTimes: {
      fajr: "05:15",
      dhuhr: "12:30",
      asr: "15:45",
      maghrib: "18:05",
      isha: "19:45"
    }
  },
  {
    name: "Cardiff Central Mosque",
    description: "A welcoming mosque serving the Muslim community in Cardiff.",
    address: "Alice St",
    city: "Cardiff",
    state: "Wales",
    zipCode: "CF10 4DQ",
    phone: "+44 29 2034 3035",
    email: "info@cardiffcentralmosque.org.uk",
    website: "http://www.cardiffcentralmosque.org.uk/",
    facilityFeatures: ["Prayer Hall", "Multi-purpose Hall", "Islamic Education", "Marriage Services"],
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=500&auto=format&fit=crop",
    location: {
      type: "Point",
      coordinates: [-3.175, 51.4816] // lng, lat
    },
    prayerTimes: {
      fajr: "05:20",
      dhuhr: "12:35",
      asr: "15:50",
      maghrib: "18:10",
      isha: "19:50"
    }
  }
];

async function seedMosques() {
  console.log('Starting mosque data seeding...');

  try {
    // Connect to database
    const { db, error } = await connectDB();

    if (error) {
      console.error('Failed to connect to database:', error);
      process.exit(1);
    }

    // Get the Mosque model
    const MosqueModel = await getMosqueModel();

    // Check if there are existing mosques
    const existingCount = await MosqueModel.countDocuments();
    console.log(`Found ${existingCount} existing mosques in database`);

    if (existingCount > 0) {
      // Ask if we should continue and overwrite
      console.log('Warning: This will add to existing mosque data.');
      console.log('Proceeding with mosque data seeding...');
    }

    // Insert the mosque data
    const result = await MosqueModel.insertMany(mosqueData);

    console.log(`Successfully seeded ${result.length} mosques to database`);
    console.log('Mosque seeding complete!');

    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding mosques:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedMosques();

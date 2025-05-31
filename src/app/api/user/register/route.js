import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Business from '@/models/Business';
import Mosque from '@/models/Mosque';

export async function POST(request) {
  try {
    const { name, email, password, city, role, businessData, mosqueData } = await request.json();

    console.log('Registration request:', { name, email, role, hasBusinessData: !!businessData, hasMosqueData: !!mosqueData });

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'imam', 'business'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Additional validation for business users
    if (role === 'business') {
      if (!businessData || !businessData.name || !businessData.category || !businessData.contact?.address?.street) {
        return NextResponse.json(
          { error: 'Business name, category, and address are required for business accounts' },
          { status: 400 }
        );
      }
    }

    // Additional validation for imam users
    if (role === 'imam') {
      if (!mosqueData || !mosqueData.name || !mosqueData.contact?.address?.street) {
        return NextResponse.json(
          { error: 'Mosque name and address are required for imam accounts' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      city: city || '',
      role: role
    });

    await user.save();
    console.log('User created:', { id: user._id, email: user.email, role: user.role });

    // If business user, create business profile
    if (role === 'business' && businessData) {
      try {
        const business = new Business({
          name: businessData.name,
          description: businessData.description || '',
          category: businessData.category,
          owner: user._id,
          contact: {
            phone: businessData.contact.phone || '',
            email: email,
            website: businessData.contact.website || '',
            address: {
              street: businessData.contact.address.street,
              city: businessData.contact.address.city || '',
              state: businessData.contact.address.state || '',
              zipCode: businessData.contact.address.zipCode || '',
              country: businessData.contact.address.country || 'United States'
            }
          },
          hours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '09:00', close: '17:00', closed: true }
          },
          socialMedia: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
          },
          settings: {
            acceptsOrders: true,
            deliveryAvailable: false,
            pickupAvailable: true,
            onlinePayments: false
          },
          verification: {
            status: 'pending'
          },
          status: 'active'
        });

        await business.save();
        console.log('Business created:', { id: business._id, name: business.name });
      } catch (businessError) {
        console.error('Error creating business:', businessError);
        // Don't fail the whole registration if business creation fails
      }
    }

    // If imam user, create mosque profile
    if (role === 'imam' && mosqueData) {
      try {
        const mosque = new Mosque({
          name: mosqueData.name,
          description: mosqueData.description || '',
          imam: user._id,
          contact: {
            phone: mosqueData.contact.phone || '',
            email: email,
            website: mosqueData.contact.website || '',
            address: {
              street: mosqueData.contact.address.street,
              city: mosqueData.contact.address.city || '',
              state: mosqueData.contact.address.state || '',
              zipCode: mosqueData.contact.address.zipCode || '',
              country: mosqueData.contact.address.country || 'United States'
            }
          },
          capacity: mosqueData.capacity || null,
          services: mosqueData.services || [],
          status: 'pending',
          facilities: [],
          prayerTimes: {
            fajr: '05:30',
            dhuhr: '12:30',
            asr: '16:00',
            maghrib: '18:30',
            isha: '20:00',
            jumma: '12:30'
          }
        });

        await mosque.save();
        console.log('Mosque created:', { id: mosque._id, name: mosque.name });
      } catch (mosqueError) {
        console.error('Error creating mosque:', mosqueError);
        // Don't fail the whole registration if mosque creation fails
      }
    }

    return NextResponse.json(
      { 
        message: getSuccessMessage(role),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user', details: error.message },
      { status: 500 }
    );
  }
}

function getSuccessMessage(role) {
  switch (role) {
    case 'business':
      return 'Business account and profile registered successfully';
    case 'imam':
      return 'Imam account and mosque registered successfully';
    default:
      return 'User account registered successfully';
  }
}
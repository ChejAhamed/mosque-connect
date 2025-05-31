import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import User from '@/models/User';
import Business from '@/models/Business';
import HalalCertification from '@/models/HalalCertification';
import dbConnect from '@/lib/db';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      ownerName,
      email,
      password,
      phone,
      name,
      description,
      type,
      address,
      city,
      postalCode,
      website,
      requestHalalCertification,
      halalDetails,
      supplierInfo,
    } = body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user account with business role
    const user = await User.create({
      name: ownerName,
      email,
      password: hashedPassword,
      role: 'business',
      phone,
      city,
    });
    console.log('User created:', user, business);
    // Create business profile
    const business = await Business.create({
      name,
      description,
      type,
      address,
      city,
      postalCode,
      phone,
      email,
      website,
      ownerId: user._id,
      isVerified: false,
    });

    // If halal certification is requested, create a certification request
    if (requestHalalCertification) {
      await HalalCertification.create({
        businessId: business._id,
        businessName: name,
        businessType: type,
        address,
        city,
        postcode: postalCode,
        contactName: ownerName,
        contactEmail: email,
        details: halalDetails || '',
        supplierInfo: supplierInfo || '',
        status: 'pending',
        requestDate: new Date(),
      });
    }

    return NextResponse.json({
      message: 'Business registered successfully',
      userId: user._id,
      businessId: business._id,
      halalCertificationRequested: requestHalalCertification,
    }, { status: 201 });
  } catch (error) {
    console.error('Business registration error:', error);
    return NextResponse.json(
      { message: 'Error registering business', error: error.message },
      { status: 500 }
    );
  }
}

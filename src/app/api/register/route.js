import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import UserModel from '@/models/User';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// User registration schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'imam', 'business']).default('user'),
  city: z.string().optional(),
});

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate input data
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, role, city } = result.data;

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create and save new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      // Set volunteerStatus to not_volunteer by default
      volunteerStatus: 'not_volunteer',
      city,
      createdAt: new Date(),
    });

    await newUser.save();

    // Remove password from response
    const user = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      volunteerStatus: newUser.volunteerStatus,
      city: newUser.city,
    };

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

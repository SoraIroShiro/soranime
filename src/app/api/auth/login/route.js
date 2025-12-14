import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Connect to database
    await connectDB();
    
    const { email, password } = await request.json();
    
    // Cari user di database berdasarkan email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Email atau password salah' },
        { status: 401 }
      );
    }
    
    // Periksa apakah password cocok
    const isPasswordMatch = await user.matchPassword(password);
    
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: 'Email atau password salah' },
        { status: 401 }
      );
    }
    
    // Periksa apakah user adalah admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { message: 'Akses ditolak. Hanya admin yang dapat login.' },
        { status: 403 }
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        role: 'admin'  // Add role field for middleware compatibility
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return NextResponse.json({ 
      success: true, 
      token,
      user: { 
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
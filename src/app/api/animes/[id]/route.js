import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Anime from '@/models/Anime';
import { verifyToken } from '@/middleware/auth';

// GET /api/animes/[id] - Public
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    await connectDB();
    const anime = await Anime.findById(resolvedParams.id);
    
    if (!anime) {
      return NextResponse.json({ message: 'Anime tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json(anime);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/animes/[id] - Protected
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    if (!verifyToken(request)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const updateData = await request.json();
    const anime = await Anime.findByIdAndUpdate(resolvedParams.id, updateData, { new: true });
    
    if (!anime) {
      return NextResponse.json({ message: 'Anime tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json(anime);
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal update anime', error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/animes/[id] - Protected
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    if (!verifyToken(request)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const anime = await Anime.findByIdAndDelete(resolvedParams.id);
    
    if (!anime) {
      return NextResponse.json({ message: 'Anime tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Anime berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal hapus anime', error: error.message },
      { status: 400 }
    );
  }
}
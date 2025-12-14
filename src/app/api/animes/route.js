import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Anime from '@/models/Anime';
import { verifyToken } from '@/middleware/auth';

// GET /api/animes - Public (tidak perlu auth)
export async function GET() {
  try {
    await connectDB();
    const animes = await Anime.find({});
    return NextResponse.json(animes);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/animes - Protected (perlu auth)
export async function POST(request) {
  try {
    // Verifikasi token admin
    if (!verifyToken(request)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { title, synopsis, posterImage, genres, rating, status, episodes } = await request.json();

    if (!title || !synopsis || !posterImage) {
      return NextResponse.json(
        { message: 'Judul, sinopsis, dan posterImage tidak boleh kosong' },
        { status: 400 }
      );
    }

    const anime = await Anime.create({
      title,
      synopsis,
      posterImage,
      genres,
      rating,
      status,
      episodes
    });

    return NextResponse.json(anime, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal membuat anime', error: error.message },
      { status: 400 }
    );
  }
}
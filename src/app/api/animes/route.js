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
    
    const requestBody = await request.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { 
      title, 
      synopsis, 
      posterImage, 
      bannerImage, 
      genres, 
      rating, 
      status, 
      studios, 
      streamingEpisodes, 
      episodes 
    } = requestBody;
    
    console.log('Extracted fields:', {
      title: title ? 'present' : 'missing',
      synopsis: synopsis ? 'present' : 'missing',
      posterImage: posterImage ? 'present' : 'missing',
      bannerImage: bannerImage ? 'present' : 'missing',
      genres: genres?.length || 0,
      rating,
      status,
      studios: studios?.length || 0,
      streamingEpisodes: streamingEpisodes?.length || 0,
      episodes: episodes?.length || 0
    });

    if (!title || !synopsis || !posterImage) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { message: 'Judul, sinopsis, dan posterImage tidak boleh kosong' },
        { status: 400 }
      );
    }

    console.log('Creating anime with data:', {
      title,
      synopsis: synopsis?.substring(0, 50) + '...',
      posterImage,
      bannerImage,
      genres,
      rating,
      status,
      studios,
      streamingEpisodes: streamingEpisodes?.length || 0,
      episodes
    });

    const anime = await Anime.create({
      title,
      synopsis,
      posterImage,
      bannerImage,
      genres,
      rating,
      status,
      studios,
      streamingEpisodes,
      episodes
    });

    console.log('Anime created successfully:', anime._id);
    return NextResponse.json(anime, { status: 201 });
  } catch (error) {
    console.error('Error creating anime:', error);
    
    // Handle duplicate title error
    if (error.code === 11000 && error.keyPattern?.title) {
      return NextResponse.json(
        { message: 'Anime dengan judul ini sudah ada. Silakan gunakan judul yang berbeda.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Gagal membuat anime', error: error.message },
      { status: 400 }
    );
  }
}
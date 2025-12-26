import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Anime from '../../../models/Anime';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json([], { status: 200 });
    }
    
    // Search anime by title (case-insensitive)
    const animes = await Anime.find({
      title: { $regex: query, $options: 'i' }
    })
    .select('_id title posterImage genres')
    .limit(8) // Limit results to prevent overwhelming the dropdown
    .lean();
    
    return NextResponse.json(animes, { status: 200 });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
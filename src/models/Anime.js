import mongoose from 'mongoose';

const EpisodeSchema = new mongoose.Schema({
  episodeNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  googleDriveLink: {
    type: String,
    required: true,
  },
});

const StreamingEpisodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: true,
  },
  site: {
    type: String,
    required: true,
  },
});

const AnimeSchema = new mongoose.Schema({
  anilistId: {
    type: Number,
    required: false,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
  },
  title: {
    type: String,
    required: [true, 'Judul tidak boleh kosong'],
  },
  synopsis: {
    type: String,
    required: [true, 'Sinopsis tidak boleh kosong'],
  },
  genres: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 10,
  },
  posterImage: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: String,
    required: false,
  },
  studios: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['Airing', 'Finished'],
    default: 'Airing',
  },
  streamingEpisodes: [StreamingEpisodeSchema],
  episodes: [EpisodeSchema],
}, {
  timestamps: true, // Menambahkan createdAt dan updatedAt
});

// Prevent model re-compilation during development
const Anime = mongoose.models.Anime || mongoose.model('Anime', AnimeSchema);

export default Anime;
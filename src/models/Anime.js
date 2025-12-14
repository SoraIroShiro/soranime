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

const AnimeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul tidak boleh kosong'],
    unique: true,
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
  status: {
    type: String,
    enum: ['Airing', 'Finished'],
    default: 'Airing',
  },
  episodes: [EpisodeSchema],
}, {
  timestamps: true, // Menambahkan createdAt dan updatedAt
});

// Prevent model re-compilation during development
const Anime = mongoose.models.Anime || mongoose.model('Anime', AnimeSchema);

export default Anime;
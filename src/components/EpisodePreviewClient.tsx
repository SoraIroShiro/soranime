"use client";
import EpisodePlayer from "@/components/EpisodePlayer";

interface Episode {
  episodeNumber: number;
  googleDriveLink: string;
  _id: string;
}

export default function EpisodePreviewClient({ episodes }: { episodes: Episode[] }) {
  return <EpisodePlayer episodes={episodes} />;
}

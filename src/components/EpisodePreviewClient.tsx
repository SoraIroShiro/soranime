"use client";
import { useState } from "react";
import EpisodePlayer from "@/components/EpisodePlayer";

interface Episode {
  episodeNumber: number;
  googleDriveLink: string;
  _id: string;
}

export default function EpisodePreviewClient({ episodes }: { episodes: Episode[] }) {
  return <EpisodePlayer episodes={episodes} />;
}

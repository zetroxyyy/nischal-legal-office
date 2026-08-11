"use client";

import StatusBanner from "./StatusBanner";

interface BannerProps {
  ok?: string;
  error?: string;
  status?: string;
}

export default function Banner(props: BannerProps) {
  return <StatusBanner {...props} />;
}

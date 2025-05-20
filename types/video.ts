export interface Video {
  id: string;
  title: string;
  full_title: string;
  description: string;
  youtube_id: string;
  duration: number;
  duration_string: string;
  thumbnail: string;
  tags: string[];
  categories: string[];
  created_at: string;
  updated_at: string;
}

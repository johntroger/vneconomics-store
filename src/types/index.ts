export interface Resource {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  need: string;
  stars: number | null;
  source_url: string;
  repo_id: string;
  requirements: string;
  license: string;
  observed_at: string;
  content: string;
  tags?: string[];
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  prerequisites: string;
  readTime: string;
  steps: {
    title: string;
    description: string;
  }[];
  content?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  count?: number;
}

export interface NeedInfo {
  id: string;
  name: string;
  description: string;
  count?: number;
}

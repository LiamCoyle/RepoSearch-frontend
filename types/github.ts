/**
 * GitHub-related TypeScript types
 */

/**
 * GitHub repository search result
 */
export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  [key: string]: unknown;
}

/**
 * Repository search response
 */
export interface RepositorySearchResponse {
  total_count: number;
  items: Repository[];
  [key: string]: unknown;
}

/**
 * Repository details
 */
export interface RepositoryDetails {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  open_issues_count: number;
  [key: string]: unknown;
}

/**
 * Repository contributor
 */
export interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  [key: string]: unknown;
}

/**
 * Repository issue
 */
export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  [key: string]: unknown;
}

/**
 * Repository commit
 */
export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  } | null;
  html_url: string;
  [key: string]: unknown;
}

/**
 * Contributor statistics
 */
export interface ContributorStats {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  commitCount: number;
  percentage: number;
}

/**
 * Repository languages (bytes of code per language)
 */
export interface RepositoryLanguages {
  [language: string]: number;
}


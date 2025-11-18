/**
 * API client for backend endpoints
 */

import type {
  Repository,
  RepositorySearchResponse,
  RepositoryDetails,
  Contributor,
  Issue,
  Commit,
} from '@/types/github';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Generic API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `API request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      error
    );
  }
}

/**
 * Health check response type
 */
export interface HealthResponse {
  status: string;
  service: string;
}

/**
 * API client functions
 */
export const api = {
  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthResponse> {
    return fetchApi<HealthResponse>('/health');
  },

  /**
   * Search GitHub repositories
   * @param query - Search query string
   */
  async searchRepositories(query: string): Promise<RepositorySearchResponse> {
    if (!query.trim()) {
      throw new ApiError('Query parameter is required', 400);
    }
    return fetchApi<RepositorySearchResponse>(
      `/github/search?query=${encodeURIComponent(query)}`
    );
  },

  /**
   * Get repository details
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   */
  async getRepositoryDetails(
    owner: string,
    repo: string
  ): Promise<RepositoryDetails> {
    if (!owner.trim() || !repo.trim()) {
      throw new ApiError('Owner and repo parameters are required', 400);
    }
    return fetchApi<RepositoryDetails>(
      `/github/get_repository_details?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
    );
  },

  /**
   * Get repository by ID
   * @param id - Repository ID
   */
  async getRepositoryById(id: number): Promise<RepositoryDetails> {
    if (!id) {
      throw new ApiError('Repository ID is required', 400);
    }
    return fetchApi<RepositoryDetails>(
      `/github/get_repository_by_id?id=${id}`
    );
  },

  /**
   * Get repository contributors (paginated)
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   * @param perPage - Number of contributors per page (default: 100)
   * @param page - Page number (default: 1)
   */
  async getRepositoryContributors(
    owner: string,
    repo: string,
    perPage: number = 100,
    page: number = 1
  ): Promise<Contributor[]> {
    if (!owner.trim() || !repo.trim()) {
      throw new ApiError('Owner and repo parameters are required', 400);
    }
    return fetchApi<Contributor[]>(
      `/github/get_repository_contributors?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&per_page=${perPage}&page=${page}`
    );
  },

  /**
   * Get repository issues
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   */
  async getRepositoryIssues(
    owner: string,
    repo: string
  ): Promise<Issue[]> {
    if (!owner.trim() || !repo.trim()) {
      throw new ApiError('Owner and repo parameters are required', 400);
    }
    return fetchApi<Issue[]>(
      `/github/get_repository_issues?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
    );
  },

  /**
   * Get repository commits
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   * @param perPage - Number of commits to fetch (default: 100)
   */
  async getRepositoryCommits(
    owner: string,
    repo: string,
    perPage: number = 100
  ): Promise<Commit[]> {
    if (!owner.trim() || !repo.trim()) {
      throw new ApiError('Owner and repo parameters are required', 400);
    }
    return fetchApi<Commit[]>(
      `/github/get_repository_commits?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&per_page=${perPage}`
    );
  },
};


import type {
	Category,
	Essay,
	FLink,
	FLinkGroup,
	HttpResponse,
	Post,
	Tag,
} from "@/types/cms";

const API_BASE_URL = import.meta.env.CMS_API_URL || "http://localhost:13000";

async function fetchAPI<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;
	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		...options,
	});

	if (!response.ok) {
		throw new Error(
			`API request failed: ${response.status} ${response.statusText}`,
		);
	}

	const data: HttpResponse<T> = await response.json();

	if (data.code !== 200) {
		throw new Error(`API error: ${data.msg}`);
	}

	return data.data;
}

// 文章相关接口
export async function getAllPosts(): Promise<Post[]> {
	return fetchAPI<Post[]>("/api/v1/public/post/list");
}

export async function getPostBySlug(slug: string): Promise<Post> {
	return fetchAPI<Post>(`/api/v1/public/post/slug/${slug}`);
}

export async function getPostListPaginated(
	page = 1,
	pageSize = 10,
): Promise<{ items: Post[]; total: number }> {
	return fetchAPI<any>(
		`/api/v1/public/post/list?page=${page}&pageSize=${pageSize}`,
	);
}

export async function searchPosts(query: string): Promise<Post[]> {
	return fetchAPI<Post[]>(
		`/api/v1/public/post/search?q=${encodeURIComponent(query)}`,
	);
}

export async function getRandomPost(): Promise<Post> {
	return fetchAPI<Post>("/api/v1/public/post/random");
}

// 标签相关接口
export async function getAllTags(): Promise<Tag[]> {
	return fetchAPI<Tag[]>("/api/v1/public/tag/list");
}

// 分类相关接口
export async function getAllCategories(): Promise<Category[]> {
	return fetchAPI<Category[]>("/api/v1/public/category/list");
}

// 友链相关接口
export async function getAllFLinks(): Promise<FLink[]> {
	return fetchAPI<FLink[]>("/api/v1/public/flink/list");
}

export async function getFLinkGroups(): Promise<FLinkGroup[]> {
	return fetchAPI<FLinkGroup[]>("/api/v1/public/flink-group/list");
}

// 说说相关接口
export async function getAllEssays(): Promise<Essay[]> {
	return fetchAPI<Essay[]>("/api/v1/public/essay/list");
}

export async function getEssaysPaginated(
	page = 1,
	pageSize = 10,
): Promise<any> {
	return fetchAPI<any>(
		`/api/v1/public/essay/list?page=${page}&pageSize=${pageSize}`,
	);
}

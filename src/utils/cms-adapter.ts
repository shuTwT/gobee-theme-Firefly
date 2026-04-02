import type { Post } from "@/types/cms";

export type CMSPostAdapter = Post & {
	id: string;
	data: {
		title: string;
		published: Date;
		updated?: Date;
		draft?: boolean;
		description?: string;
		image?: string;
		tags?: string[];
		category?: string | null;
		lang?: string;
		pinned?: boolean;
		author?: string;
		sourceLink?: string;
		licenseName?: string;
		licenseUrl?: string;
		comment?: boolean;
		password?: string;
		passwordHint?: string;
		prevTitle?: string;
		prevSlug?: string;
		nextTitle?: string;
		nextSlug?: string;
	};
	body?: string;
	slug?: string;
	collection?: "posts";
	filePath?: string;
};

export function adaptCMSPostToContentEntry(post: Post): CMSPostAdapter {
	const parseDate = (date: string | number | undefined): Date => {
		if (!date) return new Date();
		if (typeof date === "number") {
			return new Date(date);
		}
		console.log("date",date)
		return new Date(date);
	};

	return {
		...post,
		id: post.slug,
		slug: post.slug,
		collection: "posts",
		body: post.md_content || post.content || "",
		filePath: "",
		data: {
			title: post.title,
			published: parseDate(post.published_at || post.created_at),
			updated: parseDate(
				post.updated_at || post.published_at || post.created_at,
			),
			draft: post.status !== "published",
			description: post.summary,
			image: post.cover,
			tags: post.tags?.map((t) => t.name) || [],
			category: post.categories?.[0]?.name || null,
			lang: "",
			pinned: post.is_pin_to_top,
			author: post.author,
			sourceLink: "",
			licenseName: "",
			licenseUrl: "",
			comment: post.is_allow_comment,
			password: "",
			passwordHint: "",
		},
	} as CMSPostAdapter;
}

export function adaptCMSPostsToContentEntries(posts: Post[]): CMSPostAdapter[] {
	return posts.map(adaptCMSPostToContentEntry);
}

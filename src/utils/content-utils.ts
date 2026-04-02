import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import {
	adaptCMSPostsToContentEntries,
	adaptCMSPostToContentEntry,
	type CMSPostAdapter,
} from "@utils/cms-adapter";
import {
	getAllCategories,
	getAllPosts,
	getAllTags,
	getPostBySlug,
} from "@utils/cms-api";
import { getCategoryUrl } from "@utils/url-utils";

async function getRawSortedPosts() {
	const allBlogPosts = await getAllPosts();

	const filtered = allBlogPosts.filter((post) => {
		if (import.meta.env.PROD) {
			return post.status === "published" && post.is_visible;
		}
		return true;
	});

	const parseDate = (date: string | number | undefined): Date => {
		if (!date) return new Date();
		if (typeof date === "number") {
			return new Date(date);
		}
		return new Date(date);
	};

	const sorted = filtered.sort((a, b) => {
		if (a.is_pin_to_top && !b.is_pin_to_top) return -1;
		if (!a.is_pin_to_top && b.is_pin_to_top) return 1;

		const dateA = parseDate(a.published_at);
		const dateB = parseDate(b.published_at);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts(): Promise<CMSPostAdapter[]> {
	const sorted = await getRawSortedPosts();
	const adapted = adaptCMSPostsToContentEntries(sorted);

	for (let i = 1; i < adapted.length; i++) {
		adapted[i].data.nextSlug = adapted[i - 1].id;
		adapted[i].data.nextTitle = adapted[i - 1].data.title;
	}
	for (let i = 0; i < adapted.length - 1; i++) {
		adapted[i].data.prevSlug = adapted[i + 1].id;
		adapted[i].data.prevTitle = adapted[i + 1].data.title;
	}

	return adapted;
}

export type PostForList = {
	id: string;
	data: CMSPostAdapter["data"];
};

export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();
	const adapted = adaptCMSPostsToContentEntries(sortedFullPosts);

	const sortedPostsList = adapted.map((post) => ({
		id: post.id,
		data: post.data,
	}));

	return sortedPostsList;
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allTags = await getAllTags();
	const allPosts = await getAllPosts();

	const countMap: { [key: string]: number } = {};
	allPosts.forEach((post) => {
		post.tags?.forEach((tag) => {
			if (!countMap[tag.name]) countMap[tag.name] = 0;
			countMap[tag.name]++;
		});
	});

	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allCategories = await getAllCategories();
	const allPosts = await getAllPosts();

	const count: { [key: string]: number } = {};
	allPosts.forEach((post) => {
		if (!post.categories || post.categories.length === 0) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName = post.categories[0].name.trim();
		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return (
			count[b] - count[a] || a.toLowerCase().localeCompare(b.toLowerCase())
		);
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

function tokenizeTitle(title: string): Set<string> {
	const tokens = new Set<string>();
	const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
	for (const { segment, isWordLike } of segmenter.segment(title)) {
		if (!isWordLike) continue;
		tokens.add(segment.toLowerCase());
	}
	return tokens;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 && b.size === 0) return 0;
	let intersection = 0;
	for (const item of a) {
		if (b.has(item)) intersection++;
	}
	const union = a.size + b.size - intersection;
	return union === 0 ? 0 : intersection / union;
}

export async function getRelatedPosts(
	currentPost: CMSPostAdapter,
	maxCount = 5,
): Promise<PostForList[]> {
	const allPosts = await getRawSortedPosts();
	const adapted = adaptCMSPostsToContentEntries(allPosts);

	const candidates = adapted.filter((p) => p.id !== currentPost.id);

	const currentTags = new Set(currentPost.data.tags || []);
	const currentTokens = tokenizeTitle(currentPost.data.title);
	const currentCategory = currentPost.data.category || "";
	const now = Date.now();

	const scored = candidates.map((post) => {
		const postTags = new Set(post.data.tags || []);

		const tagMatchScore = jaccardSimilarity(currentTags, postTags) * 100;

		const postTokens = tokenizeTitle(post.data.title);
		const titleSimilarityScore =
			jaccardSimilarity(currentTokens, postTokens) * 100;

		const daysSincePublished =
			(now - post.data.published.getTime()) / (1000 * 60 * 60 * 24);
		const timeFreshnessScore =
			30 * Math.exp((-Math.LN2 * daysSincePublished) / 180);

		const postCategory = post.data.category || "";
		const categoryBonus =
			currentCategory && postCategory && currentCategory === postCategory
				? 10
				: 0;

		const totalScore =
			tagMatchScore + titleSimilarityScore + timeFreshnessScore + categoryBonus;

		return {
			post,
			totalScore,
			tagMatchScore,
			timeFreshnessScore,
			categoryBonus,
		};
	});

	scored.sort((a, b) => b.totalScore - a.totalScore);

	const withTagMatch = scored.filter((s) => s.tagMatchScore > 0);
	const withoutTagMatch = scored.filter((s) => s.tagMatchScore === 0);

	const result: PostForList[] = [];

	for (const s of withTagMatch) {
		if (result.length >= maxCount) break;
		result.push({ id: s.post.id, data: s.post.data });
	}

	if (result.length < maxCount) {
		withoutTagMatch.sort(
			(a, b) =>
				b.timeFreshnessScore +
				b.categoryBonus -
				(a.timeFreshnessScore + a.categoryBonus),
		);
		for (const s of withoutTagMatch) {
			if (result.length >= maxCount) break;
			result.push({ id: s.post.id, data: s.post.data });
		}
	}

	return result;
}

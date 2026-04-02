export interface HttpResponse<T = any> {
	code: number;
	msg: string;
	data: T;
}

export interface Tag {
	id: number;
	name: string;
	description: string;
	slug: string;
	color: string;
	sort_order: number;
	active: boolean;
	post_count?: number;
	created_at: string;
	updated_at: string;
}

export interface Category {
	id: number;
	name: string;
	description: string;
	slug: string;
	sort_order: number;
	active: boolean;
	post_count?: number;
	created_at: string;
	updated_at: string;
}

export interface Post {
	id: number;
	title: string;
	slug: string;
	summary: string;
	cover: string;
	author: string;
	content: string;
	md_content: string;
	html_content: string;
	content_type: "html" | "markdown";
	status: "draft" | "published" | "archived";
	published_at: string;
	created_at: string;
	updated_at: string;
	is_pin_to_top: boolean;
	is_visible: boolean;
	is_allow_comment: boolean;
	is_visible_after_comment: boolean;
	is_visible_after_pay: boolean;
	is_autogen_summary: boolean;
	view_count: number;
	comment_count: number;
	price: number;
	keywords: string;
	copyright: string;
	tag_ids: number[];
	tags: Tag[];
	category_ids: number[];
	categories: Category[];
}

export interface FLink {
	id: number;
	name: string;
	url: string;
	avatar_url: string;
	description: string;
	cover_url?: string;
	snapshot_url?: string;
	email?: string;
	status: number;
	enable_friend_circle?: boolean;
	friend_circle_rule_id?: number;
	group?: FLinkGroup;
	created_at: string;
	updated_at: string;
}

export interface FLinkGroup {
	id: number;
	name: string;
	description: string;
	sort_order: number;
	active: boolean;
	created_at: string;
	updated_at: string;
	flinks?: FLink[];
}

export interface Essay {
	id: number;
	content: string;
	images: string[];
	created_at: string;
	updated_at: string;
}

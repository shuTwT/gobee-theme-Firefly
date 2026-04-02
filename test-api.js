#!/usr/bin/env node
import { getAllCategories, getAllPosts, getAllTags } from "./src/utils/cms-api";

async function testAPI() {
	console.log("Testing CMS API...");
	console.log("====================");

	try {
		console.log("\n1. Testing getAllPosts...");
		const posts = await getAllPosts();
		console.log(`✓ Found ${posts.length} posts`);
		if (posts.length > 0) {
			console.log(`  First post: ${posts[0].title} (slug: ${posts[0].slug})`);
		}

		console.log("\n2. Testing getAllTags...");
		const tags = await getAllTags();
		console.log(`✓ Found ${tags.length} tags`);
		if (tags.length > 0) {
			console.log(`  Tags: ${tags.map((t) => t.name).join(", ")}`);
		}

		console.log("\n3. Testing getAllCategories...");
		const categories = await getAllCategories();
		console.log(`✓ Found ${categories.length} categories`);
		if (categories.length > 0) {
			console.log(`  Categories: ${categories.map((c) => c.name).join(", ")}`);
		}

		console.log("\n✅ All API tests passed!");
	} catch (error) {
		console.error("\n❌ API test failed:", error);
		process.exit(1);
	}
}

testAPI();

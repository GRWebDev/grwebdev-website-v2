import { glob } from "astro/loaders";
import { collections } from "./content.production";

// Keep the production schemas and content, but give the fixture an ID that
// differs from its slug so getStaticPaths succeeds and getEntry cannot find it.
collections.board.loader = glob({
	pattern: "**/*.md",
	base: "src/content/Board",
	generateId: ({ data }) =>
		data.slug === "missing-board-member" ? "missing-entry" : String(data.slug),
});

collections.sponsors.loader = glob({
	pattern: "**/*.md",
	base: "src/content/Sponsors",
	generateId: ({ data }) =>
		data.slug === "missing-sponsor" ? "missing-entry" : String(data.slug),
});

export { collections };

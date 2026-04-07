const sitemapPlugin = require("@quasibit/eleventy-plugin-sitemap");

module.exports = function(eleventyConfig) {

  // ── Passthrough: assets & existing static pages ──────────────────────────
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("effects.js");
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("nosotros.html");
  eleventyConfig.addPassthroughCopy("contacto.html");
  eleventyConfig.addPassthroughCopy("portafolio.html");
  eleventyConfig.addPassthroughCopy("portfolio");
  eleventyConfig.addPassthroughCopy("components");
  eleventyConfig.addPassthroughCopy("admin");

  // ── Sitemap plugin ────────────────────────────────────────────────────────
  eleventyConfig.addPlugin(sitemapPlugin, {
    sitemap: {
      hostname: "https://bdbagency.com",
    },
  });

  // ── Date filters ──────────────────────────────────────────────────────────
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateObj));
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  // ── Related posts filter ─────────────────────────────────────────────────
  eleventyConfig.addFilter("relatedPosts", (posts, currentUrl, category, limit = 3) => {
    const sameCategory = posts.filter(p => p.data.categoria === category && p.url !== currentUrl);
    if (sameCategory.length > 0) return sameCategory.slice(0, limit);
    // fallback: cualquier otro post
    return posts.filter(p => p.url !== currentUrl).slice(0, limit);
  });

  // ── Editorial split filters (Lune-style heading + body from one markdown field) ─
  eleventyConfig.addFilter("firstSentence", (str) => {
    if (!str) return "";
    const m = String(str).match(/^[\s\S]*?[.!?](?=\s|$)/);
    return m ? m[0].trim() : String(str).trim();
  });
  eleventyConfig.addFilter("afterFirstSentence", (str) => {
    if (!str) return "";
    const s = String(str);
    const m = s.match(/^[\s\S]*?[.!?](?=\s|$)/);
    return m ? s.slice(m[0].length).trim() : "";
  });

  // ── Other projects (exclude current, limit) ─────────────────────────────
  eleventyConfig.addFilter("otherProjects", (projects, currentUrl, limit = 4) => {
    if (!projects) return [];
    return projects.filter(p => p.url !== currentUrl).slice(0, limit);
  });

  // ── Collections ───────────────────────────────────────────────────────────
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByTag("post")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return collectionApi
      .getFilteredByTag("project")
      .sort((a, b) => (b.data.year || 0) - (a.data.year || 0));
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
  };
};

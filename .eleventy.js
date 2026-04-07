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

  // ── Collections ───────────────────────────────────────────────────────────
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByTag("post")
      .sort((a, b) => b.date - a.date);
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

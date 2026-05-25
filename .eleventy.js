module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/entries/img": "img" });

  eleventyConfig.addDateParsing(function (dateValue) {
    if (typeof dateValue === "string" && /^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
      const [dd, mm, yyyy] = dateValue.split("-");
      return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    }
    return dateValue;
  });

  eleventyConfig.addFilter("truncate", function (str, n = 280) {
    if (!str) return "";
    const text = String(str).trim();
    if (text.length <= n) return text;
    return text.slice(0, n).trimEnd() + "…";
  });

  eleventyConfig.addFilter("dateDisplay", function (value) {
    if (!value) return "";
    const [dd, mm, yyyy] = String(value).split("-");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const day = parseInt(dd, 10);
    const monthIdx = parseInt(mm, 10) - 1;
    if (!day || isNaN(monthIdx) || !yyyy) return value;
    return `${day} ${months[monthIdx]} ${yyyy}`;
  });

  eleventyConfig.addFilter("year", function (value) {
    if (!value) return "";
    const parts = String(value).split("-");
    return parts[2] || "";
  });

  eleventyConfig.addFilter("sortByDateDesc", function (arr) {
    const toSortable = (d) => {
      if (!d) return "00000000";
      const [dd, mm, yyyy] = String(d).split("-");
      return `${yyyy || "0000"}${mm || "00"}${dd || "00"}`;
    };
    return [...arr].sort((a, b) => {
      const da = toSortable(a.data.date);
      const db = toSortable(b.data.date);
      return db.localeCompare(da);
    });
  });

  eleventyConfig.addFilter("groupByYear", function (arr) {
    const groups = {};
    for (const item of arr) {
      const y = (item.data.date || "").split("-")[2] || "—";
      if (!groups[y]) groups[y] = [];
      groups[y].push(item);
    }
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({ year, items: groups[year] }));
  });

  eleventyConfig.addCollection("entries", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/entries/**/*.md");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
};

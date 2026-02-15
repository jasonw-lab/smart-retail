import ja from "element-plus/dist/locale/ja.mjs";

export default {
  ...ja,
  name: "ja",
  el: {
    ...ja.el,
    pagination: {
      goto: "ページへ",
      pagesize: "件/ページ",
      total: "全 {total} 件",
      pageClassifier: "ページ",
      page: "ページ",
      prev: "前へ",
      next: "次へ",
      currentPage: "現在のページ",
      prevPages: "前のページ",
      nextPages: "次のページ",
      deprecationWarning: "",
      条: "件",
      "条/页": "件/ページ",
      "共 {total} 条": "全 {total} 件",
      前往: "ページへ",
    },
  },
};

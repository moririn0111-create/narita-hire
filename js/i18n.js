/* =========================================================
   多言語切替ロジック
   ・data-i18n        … 要素の表示テキストを差し替え
   ・data-i18n-ph     … 入力欄の placeholder を差し替え
   ・data-i18n-meta   … <meta description> を差し替え
   ・選んだ言語は localStorage に保存（次回も同じ言語で開く）
   ========================================================= */

(function () {
  "use strict";

  var STORE_KEY = "np_lang";                 // 保存キー
  var SUPPORTED = ["en", "zh-CN", "zh-TW", "ko", "ja"];
  var DEFAULT = "en";                        // 訪日客向けなので既定は英語

  /* ブラウザ言語から最初の言語を推定する */
  function detectLang() {
    var saved = localStorage.getItem(STORE_KEY);
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;

    var nav = (navigator.language || "en").toLowerCase();
    if (nav.indexOf("zh") === 0) {
      // 繁体（台湾・香港）か簡体かを判定
      return (nav.indexOf("tw") !== -1 || nav.indexOf("hk") !== -1 || nav.indexOf("hant") !== -1) ? "zh-TW" : "zh-CN";
    }
    if (nav.indexOf("ko") === 0) return "ko";
    if (nav.indexOf("ja") === 0) return "ja";
    if (nav.indexOf("en") === 0) return "en";
    return DEFAULT;
  }

  /* 指定言語でページ全体を書き換える */
  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT;
    var dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT];

    // 表示テキスト
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    // placeholder
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
    });
    // タイトル
    if (dict["meta.title"]) document.title = dict["meta.title"].replace(/&nbsp;/g, " ");
    // メタディスクリプション
    document.querySelectorAll("[data-i18n-meta]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-meta");
      if (dict[key] != null) el.setAttribute("content", dict[key]);
    });

    document.documentElement.lang = lang;
    localStorage.setItem(STORE_KEY, lang);

    // フォームの「ご希望の言語」を画面言語に合わせて初期選択
    var nativeName = { "en": "English", "zh-CN": "简体中文", "zh-TW": "繁體中文", "ko": "한국어", "ja": "日本語" }[lang];
    var langField = document.querySelector('select[name="language"]');
    if (langField && nativeName) langField.value = nativeName;

    // 他スクリプト（booking.js）が現在の辞書を使えるよう公開
    window.NP_DICT = dict;
    window.NP_LANG = lang;
  }

  /* 初期化 */
  document.addEventListener("DOMContentLoaded", function () {
    var lang = detectLang();
    var selector = document.getElementById("langSelect");
    if (selector) {
      selector.value = lang;
      selector.addEventListener("change", function () { apply(this.value); });
    }
    apply(lang);
  });
})();

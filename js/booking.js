/* =========================================================
   応援登録フォーム＋クラファンリンクの動作
   ・入力チェック（必須・メール形式）
   ・Googleフォームへバックグラウンド送信（隠しiframe方式・ページ遷移なし）
   ・送信後に「登録完了」モーダルを表示
   ・クラファン公開後、CF_URL を設定すると応援ボタンが外部ページへ飛ぶ
   ========================================================= */

/* ---------------------------------------------------------
   ★★★ クラウドファンディングのURL ★★★
   Makuake / CAMPFIRE 等の公開ページが決まったら、その URL をここに貼る。
   空のままなら「応援する」ボタンはページ内のリターン一覧へスクロールします。
   --------------------------------------------------------- */
var CF_URL = "";  // 例: "https://www.makuake.com/project/xxxxxx/"

/* ---------------------------------------------------------
   ★★★ Googleフォーム設定（応援登録の受け取り先） ★★★
   手順は README.md の「Googleフォーム連携の手順」を参照。
   未設定のままでもデモモードで動作確認できます（実送信せず内容を表示）。
   --------------------------------------------------------- */
var GOOGLE_FORM = {
  action: "https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/formResponse",
  entries: {
    name:     "entry.REPLACE_NAME",
    email:    "entry.REPLACE_EMAIL",
    language: "entry.REPLACE_LANGUAGE",
    interest: "entry.REPLACE_INTEREST",
    notes:    "entry.REPLACE_NOTES"
  }
};

(function () {
  "use strict";

  /* --- クラファンリンクの差し込み --- */
  if (CF_URL) {
    document.querySelectorAll(".cf-link").forEach(function (a) {
      a.setAttribute("href", CF_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }

  var form = document.getElementById("bookingForm");
  if (!form) return;

  var submitBtn = document.getElementById("submitBtn");
  var modal = document.getElementById("thanksModal");
  var modalClose = document.getElementById("thanksClose");

  /* 現在の言語の文言を取得（i18n.jsが公開する辞書を利用） */
  function t(key, fallback) {
    return (window.NP_DICT && window.NP_DICT[key]) || fallback;
  }

  /* Googleフォーム未設定（プレースホルダのまま）かどうか判定 */
  function isConfigured() {
    return GOOGLE_FORM.action.indexOf("REPLACE") === -1;
  }

  /* 入力チェック。問題があれば該当欄を赤くして false を返す */
  function validate() {
    var ok = true;
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });

    form.querySelectorAll("[required]").forEach(function (el) {
      if (!String(el.value).trim()) {
        el.classList.add("invalid");
        ok = false;
      }
    });

    var email = form.querySelector('input[name="email"]');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add("invalid");
      ok = false;
    }
    return ok;
  }

  /* 入力内容をオブジェクトにまとめる */
  function collect() {
    var data = {};
    ["name", "email", "language", "interest", "notes"].forEach(function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      data[n] = el ? el.value : "";
    });
    return data;
  }

  /* Googleフォームへ送信（隠しiframe宛にPOST。ページは遷移しない） */
  function sendToGoogle(data) {
    var ghost = document.createElement("form");
    ghost.action = GOOGLE_FORM.action;
    ghost.method = "POST";
    ghost.target = "gform_target";   // index.html の隠しiframe
    ghost.style.display = "none";

    Object.keys(GOOGLE_FORM.entries).forEach(function (key) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = GOOGLE_FORM.entries[key];
      input.value = data[key] != null ? data[key] : "";
      ghost.appendChild(input);
    });

    document.body.appendChild(ghost);
    ghost.submit();
    setTimeout(function () { document.body.removeChild(ghost); }, 1500);
  }

  /* 完了モーダルの開閉 */
  function openModal() { modal.hidden = false; }
  function closeModal() { modal.hidden = true; }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });

  /* 送信処理 */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var data = collect();
    submitBtn.disabled = true;
    submitBtn.textContent = t("form.submitting", "Sending…");

    if (isConfigured()) {
      sendToGoogle(data);
    } else {
      // デモモード：実送信せず内容を確認できるようにする
      console.warn("[NARITA] Googleフォーム未設定のためデモ送信です。README.mdの手順で booking.js の GOOGLE_FORM を設定してください。");
      console.table(data);
    }

    setTimeout(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = t("form.submit", "Notify me");
      form.reset();
      openModal();
    }, 900);
  });
})();

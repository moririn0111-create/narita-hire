/* =========================================================
   予約リクエストフォームの動作
   ・入力チェック（必須・メール形式）
   ・Googleフォームへバックグラウンド送信（隠しiframe方式でページは遷移しない）
   ・送信後に「受付完了」モーダルを表示
   ========================================================= */

/* ---------------------------------------------------------
   ★★★ ここだけ設定すれば本番送信できます ★★★
   設定方法は README.md の「Googleフォーム連携の手順」を参照。
   未設定のままでも、デモモードで動作確認はできます
   （実際には送信されず、入力内容を画面とコンソールに表示）。
   --------------------------------------------------------- */
var GOOGLE_FORM = {
  // Googleフォームの「回答送信先」URL（末尾は /formResponse）
  action: "https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/formResponse",

  // 各入力欄を Googleフォームの entry.XXXXXXXX に対応づける
  entries: {
    name:        "entry.REPLACE_NAME",
    email:       "entry.REPLACE_EMAIL",
    plan:        "entry.REPLACE_PLAN",
    language:    "entry.REPLACE_LANGUAGE",
    date:        "entry.REPLACE_DATE",
    time:        "entry.REPLACE_TIME",
    flight:      "entry.REPLACE_FLIGHT",
    pax:         "entry.REPLACE_PAX",
    pickup:      "entry.REPLACE_PICKUP",
    dropoff:     "entry.REPLACE_DROPOFF",
    luggage:     "entry.REPLACE_LUGGAGE",
    interpreter: "entry.REPLACE_INTERPRETER",
    notes:       "entry.REPLACE_NOTES"
  }
};

(function () {
  "use strict";

  var form = document.getElementById("bookingForm");
  if (!form) return;

  var submitBtn = document.getElementById("submitBtn");
  var modal = document.getElementById("thanksModal");
  var modalClose = document.getElementById("thanksClose");

  /* 現在の言語のエラーメッセージを取得（i18n.jsが公開する辞書を利用） */
  function t(key, fallback) {
    return (window.NP_DICT && window.NP_DICT[key]) || fallback;
  }

  /* Googleフォーム未設定（プレースホルダのまま）かどうか判定 */
  function isConfigured() {
    return GOOGLE_FORM.action.indexOf("REPLACE") === -1;
  }

  /* プランカードの「このプランを選ぶ」→ フォームのプラン欄に反映してスクロール */
  document.querySelectorAll(".plan-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var planValue = this.getAttribute("data-plan");
      var planSelect = form.querySelector('select[name="plan"]');
      if (planSelect) planSelect.value = planValue;
      document.getElementById("book").scrollIntoView({ behavior: "smooth" });
    });
  });

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
    ["name", "email", "plan", "language", "date", "time",
     "flight", "pax", "pickup", "dropoff", "luggage", "notes"].forEach(function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      data[n] = el ? el.value : "";
    });
    var interp = form.querySelector('input[name="interpreter"]');
    data.interpreter = (interp && interp.checked) ? "Yes" : "No";
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
      submitBtn.textContent = t("form.submit", "Send request");
      form.reset();
      openModal();
    }, 900);
  });
})();

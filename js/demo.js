/* =========================================================
   iOS風デモの動作（GO風配車フロー）
   地図 → メニュー/プラン・日時 → 確認 → 決済 → 完了
   依存なしの素のJS。
   ========================================================= */

/* ---------------------------------------------------------
   ★ 決済の外部リンク（任意）
   Stripe/PayPal等の決済ページが決まったらURLを入れる。
   空ならアプリ内のデモ決済画面を表示します。
   --------------------------------------------------------- */
var PAY_URL = "";

(function () {
  "use strict";

  var screenEl = document.querySelector(".screen");
  var stack = ["viewMap"];

  function t(key, fb) { return (window.NP_DICT && window.NP_DICT[key]) || fb; }

  /* 指定ビューを表示（履歴に積む） */
  function show(id, isBack) {
    document.querySelectorAll(".view").forEach(function (v) {
      v.classList.toggle("is-active", v.id === id);
    });
    if (!isBack) {
      if (stack[stack.length - 1] !== id) stack.push(id);
    }
    if (id === "viewConfirm") buildSummary();
    if (id === "viewPay") document.getElementById("dPayAmt").textContent = priceText();
    closeDrawer();
  }

  /* 戻る */
  function goBack() {
    if (stack.length > 1) { stack.pop(); show(stack[stack.length - 1], true); }
    else show("viewMap", true);
  }

  /* 合計金額の計算 */
  function totalYen() {
    var plan = document.querySelector('input[name="dplan"]:checked');
    var sum = plan ? parseInt(plan.getAttribute("data-price"), 10) : 0;
    var interp = document.getElementById("dInterp");
    if (interp && interp.checked) sum += parseInt(interp.getAttribute("data-price"), 10);
    return sum;
  }
  function priceText() { return "¥" + totalYen().toLocaleString("en-US"); }

  /* 確認画面のサマリーを組み立て */
  function buildSummary() {
    var plan = document.querySelector('input[name="dplan"]:checked');
    var date = document.getElementById("dDate").value || "—";
    var time = document.getElementById("dTime").value || "—";
    var pax = document.getElementById("dPax").textContent;
    var interp = document.getElementById("dInterp").checked ? t("demo.yes", "Yes") : t("demo.no", "No");
    var rows = [
      [t("demo.kPlan", "Plan"), plan ? plan.value : "—"],
      [t("demo.kDate", "Date"), date],
      [t("demo.kTime", "Pick-up"), time],
      [t("demo.kPax", "Passengers"), pax],
      [t("demo.interp", "Interpreter"), interp]
    ];
    document.getElementById("dSummary").innerHTML = rows.map(function (r) {
      return '<div><span class="k">' + r[0] + '</span><span class="v">' + r[1] + "</span></div>";
    }).join("");
    document.getElementById("dPrice").textContent = priceText();
  }

  /* メニュー開閉 */
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  function openDrawer() { drawer.classList.add("open"); scrim.classList.add("show"); }
  function closeDrawer() { drawer.classList.remove("open"); scrim.classList.remove("show"); }

  document.getElementById("menuBtn").addEventListener("click", openDrawer);
  document.getElementById("langBtn").addEventListener("click", openDrawer);
  scrim.addEventListener("click", closeDrawer);

  /* クリック委譲：data-go / data-back */
  screenEl.addEventListener("click", function (e) {
    var goEl = e.target.closest("[data-go]");
    if (goEl) { show(goEl.getAttribute("data-go")); return; }
    if (e.target.closest("[data-back]")) { goBack(); return; }
  });

  /* 人数ステッパー */
  document.querySelectorAll("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById("dPax");
      var n = parseInt(el.textContent, 10) + parseInt(this.getAttribute("data-step"), 10);
      el.textContent = Math.min(9, Math.max(1, n));
    });
  });

  /* 決済へ（外部URLがあれば遷移、なければデモ決済画面） */
  function startPay() {
    if (PAY_URL) { window.open(PAY_URL, "_blank", "noopener"); return; }
    show("viewPay");
  }
  document.getElementById("toPay").addEventListener("click", startPay);
  document.getElementById("payApple").addEventListener("click", function () { show("viewDone"); });
  document.getElementById("payNow").addEventListener("click", function () { show("viewDone"); });

  /* やり直し */
  document.getElementById("restart").addEventListener("click", function () {
    stack = ["viewMap"]; show("viewMap", true);
  });

  /* 日付の初期値＝明日 */
  var d = new Date(); d.setDate(d.getDate() + 1);
  document.getElementById("dDate").value = d.toISOString().slice(0, 10);

  /* プラン/オプション変更で金額表示を更新 */
  document.querySelectorAll('input[name="dplan"], #dInterp').forEach(function (el) {
    el.addEventListener("change", function () {
      var p = document.getElementById("dPrice"); if (p) p.textContent = priceText();
    });
  });
})();

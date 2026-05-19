# NARITA PRIVATE CAR — 多言語予約サイト（MVP）

成田空港エリアの訪日外国人向けハイヤー（貸切送迎）予約サイトの最小版です。
GO風のダークデザイン・5言語対応・予約リクエストフォーム（Googleフォーム連携）を実装しています。

---

## フォルダ構成

```
~/narita-hire/
├── index.html              … サイト本体（1ページ完結）
├── css/
│   └── style.css           … デザイン（色・サイズはここを編集）
├── js/
│   ├── translations.js     … 全言語のテキスト（文言修正はここ）
│   ├── i18n.js             … 言語切替の仕組み
│   └── booking.js          … 予約フォームの動作＋Googleフォーム設定
├── img/                    … 画像用（現状は未使用。CSSで描画）
└── README.md               … この説明書
```

---

## 1. まず動かして確認する

`index.html` を **ダブルクリック** するだけでブラウザで開けます（サーバ不要）。
右上の言語メニューで 英 / 簡体 / 繁体 / 韓 / 日 を切り替えられます。

この時点では Googleフォーム未設定なので「**デモモード**」です。
予約フォームを送ると完了画面は出ますが、実際には送信されません
（入力内容はブラウザの「コンソール」に表示されます。確認だけ可能）。

---

## 2. Googleフォーム連携の手順（本番で予約を受け取る）

予約リクエストを Googleスプレッドシートに自動でためる設定です。**プログラム不要**。

### ステップ1：Googleフォームを作る
[forms.google.com](https://forms.google.com) で新規フォームを作成し、
**以下13個の質問**を「記述式（短文）」で、この順番・この名前で追加します。

1. Name
2. Email
3. Plan
4. Language
5. Date
6. Time
7. Flight
8. Pax（人数）
9. Pickup
10. Dropoff
11. Luggage
12. Interpreter
13. Notes（段落式でもOK）

作成後、右上「回答」タブ → 緑のスプレッドシートアイコンで、回答先シートを作成。

### ステップ2：送信先URLと項目IDを調べる
1. フォーム編集画面の右上「︙」→「**事前入力したURLを取得**」
2. 各項目に「1」など適当な値を入れて「リンクを取得」
3. 出てきたURLを見ると `entry.123456789=1` のような部分が13個あります。
   この **数字（entry.xxxxxxxxx）** を上から順にメモします。
4. フォームの通常URL（`/viewform`）の **`/viewform` を `/formResponse` に変えた**ものが送信先URLです。

### ステップ3：booking.js に貼り付ける
`js/booking.js` の冒頭 `GOOGLE_FORM` を、調べた値で置き換えます。

```js
var GOOGLE_FORM = {
  action: "https://docs.google.com/forms/d/e/【あなたのフォームID】/formResponse",
  entries: {
    name:        "entry.111111",   // ← Name のID
    email:       "entry.222222",   // ← Email のID
    plan:        "entry.333333",
    language:    "entry.444444",
    date:        "entry.555555",
    time:        "entry.666666",
    flight:      "entry.777777",
    pax:         "entry.888888",
    pickup:      "entry.999999",
    dropoff:     "entry.101010",
    luggage:     "entry.121212",
    interpreter: "entry.131313",
    notes:       "entry.141414"
  }
};
```

`REPLACE` の文字が1つでも残っていると自動でデモモードになります（誤送信防止）。
すべて置き換えれば本番送信になり、回答はスプレッドシートにたまります。
（任意：Googleフォームの設定で「新しい回答をメール通知」をオンにすると即気づけます）

---

## 3. よくある編集

| やりたいこと | 編集する場所 |
|---|---|
| 料金・プラン名・説明文を変える | `js/translations.js`（5言語ぶん）と `index.html` のプラン金額 |
| 色・余白・フォントを変える | `css/style.css` 上部の `:root` |
| 言語を増やす（例：タイ語） | `js/translations.js` に `"th": { ... }` を追加し、`js/i18n.js` の `SUPPORTED` に `"th"` を足す。`index.html` の言語メニューにも1行追加 |
| ブランド名を変える | `index.html` の `NARITA` / `brand.tag` と `translations.js` の `brand.tag` |

---

## 4. 公開する方法（いずれも無料〜低コスト）

- Cloudflare Pages / Netlify / GitHub Pages にフォルダごとアップロード（最も簡単）
- 自宅Mac mini ＋ Cloudflare Tunnel（slot-data.net と同じ方式）

---

## 5. 重要な法律メモ（A案：自前で許可取得）

- 本MVPは「**予約リクエスト受付**」です。料金は確定見積りであり、その場で課金しません。
- **一般乗用旅客自動車運送事業の許可が下りるまで、実際の有償運送・本決済は行わない**こと。
  許可前の有償送迎は「白タク」として道路運送法違反になります。
- 許可取得後に「本予約確定」「オンライン決済」を有効化する流れが安全です
  （決済の設計案は別途まとめます）。

---

## 今後の拡張（予定）

- 本予約確定フロー＋オンライン決済（Stripe / PayPal / Alipay / WeChat Pay）
- 管理画面（予約一覧・ステータス管理）
- ドライバー用アプリのGPSによる稼働車両のリアルタイム地図
- 復路マッチング（空車回送の削減）
- AI通訳の組み込み

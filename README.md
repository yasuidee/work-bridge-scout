# WORK BRIDGE — 説明できるAIスカウト SaaS（管理画面プロトタイプ）

外国籍・グローバル人材に特化した、企業向け採用データベース SaaS の管理画面プロトタイプです。
単なる検索 DB ではなく、**AI が「なぜ合うか／どこが懸念か／どう刺すか／面談で何を聞くか」を理由つきで先回り提案する** “説明できるスカウト SaaS” を目指しています。

差別化の本質は画面の数ではなく **AI 推薦の説明可能性**。スコアだけでなく理由・懸念・スカウト訴求軸・面談質問を、**決定論的で再現可能なルール**から生成します。

---

## セットアップ・起動

```bash
npm install
npm run dev      # 開発サーバ（http://localhost:3000）
npm run build    # 本番ビルド（型チェックを含む。strict / noUnusedLocals）
npm test         # マッチングエンジンのテスト（tsx）
```

- 技術スタック: **Next.js 14 (App Router) / TypeScript (strict) / Tailwind CSS / Zustand / recharts / lucide-react**
- UI 文言はすべて日本語。デスクトップ管理画面前提（desktop-first）。

---

## 設計の大原則：エンジン先行・画面後行

実装順序は `型契約 → マッチングエンジン → モックデータ → 画面`。UI は常にエンジンとデータの上に乗っています。

```
src/lib/
├─ types.ts            データ契約（§5）。列挙値・在留資格・ランク等の型
├─ constants.ts        列挙値ラベル・既定重み・フィードバックタグを 1 箇所に集約
├─ matching/           ★ 差別化の核（純粋関数・UI から分離・差し替え可能）
│   ├─ scoreCandidate.ts  ハードフィルター / サブスコア / 補正係数 / 集計
│   ├─ explainMatch.ts    説明生成（reasons/concerns/scoutAngles/interviewQuestions）
│   ├─ rank.ts            S/A/B/C のランク閾値
│   ├─ index.ts           公開 API（matchCandidate / matchAll）
│   └─ __tests__/score.test.ts
└─ mock/               候補者40・求人10・ペルソナ5（意図的にマッチング設計）
```

### マッチングの流れ（§6）

1. **ハードフィルター**: 在留資格／日本語／英語／在住／経験年数／必須スキル80%。不合格者は「条件外」へ分離。
2. **サブスコア（各 0..1）**: skill / roleExp / industryExp / japanese / english / workAuth / salaryFit / locationFit / culture。
3. **補正係数 adjust（0.9〜1.1）**: 転職意欲 × 最終ログイン × 返信可能性。「今動かしやすさ」のみを反映（重み付け対象外）。
4. **集計**: `score = round(Σ(sub×weight)/Σweight × adjust × 100)`、閾値で S/A/B/C。
5. **説明生成**: スコア内訳から自然な日本語で 4 種を生成。

---

## 差別禁止のハード制約（§3）

以下の属性は **スコアリング・フィルター・入力欄のいずれにも一切含めていません**:
**国籍・人種・民族・出身国・性別・年齢・宗教・婚姻/家族状況・政治信条。**

- 型 `Candidate` / `Persona` にこれらのフィールドは存在しません。
- 「特定国・地域の市場経験」は *市場知識・実務スキル* として扱います（例: ○「台湾EC市場の実務経験」／×「台湾国籍」）。
- ペルソナ作成ウィザードの必須・除外ステップには、属性を使用しない旨の注意書きを表示します。
- 日本の雇用対策法・職業安定法の趣旨（募集・採用における属性差別の禁止）に沿った設計です。

---

## 擬似 AI ロジックの差し替え点（将来拡張フック）

本プロトタイプは外部 LLM を使わず、決定論的ルールで疑似 AI 推薦を実装しています。実運用時は以下を差し替えます。

| 差し替え対象 | 場所 | 方法 |
|---|---|---|
| **説明文の生成** | `src/lib/matching/explainMatch.ts` | シグネチャ `explainMatch(persona, candidate, breakdown)` を固定。内部のテンプレート生成を LLM 呼び出しに置換すれば、戻り値の 4 配列契約を変えずに UI 無改修で差し替え可能（ファイル冒頭コメント参照）。 |
| **スコアリング** | `src/lib/matching/scoreCandidate.ts` | サブスコアは純粋関数。学習済みモデル / 埋め込み類似度などへ段階的に置換可能。 |
| **重みの自動調整** | `RecommendationFeedback`（理由タグ）→ `useAppStore.feedbacks` | フィードバックは将来の重み自動調整に使える構造で localStorage 保存済み。 |
| **DTO 連携** | `src/lib/types.ts` | `Candidate` / `Persona` は API 連携時にそのまま DTO へ移行できる粒度を維持。 |

> 決定論性: スコアは固定参照日 `SCORING_REFERENCE_DATE`（2026-06-21）を基準に算出し、`Date.now()` を使いません。同一入力なら常に同一結果（テストで担保）。

---

## ゴールデンパス（デモの主役）

```
求人作成 → 採用ペルソナ登録（ウィザード）→ AI 推薦実行
→ 推薦候補が S/A/B 順で並ぶ
→ 各候補に「なぜ合うか／どこが懸念か／どう刺すか／面談で何を聞くか」を表示
→ ターゲットリスト追加 → スカウト文面が AI 訴求軸つきで自動生成
```

主要画面: `/dashboard` `/personas/new` `/ai-recommendations` `/candidates/search` ＋候補者詳細ドロワー。

### 画面の作り込み度（Tier）

- **Tier 0（完全実装）**: ダッシュボード / ペルソナ作成ウィザード / AI推薦 / 候補者検索 / 候補者詳細。
- **Tier 1（機能する）**: 求人 / ターゲットリスト / スカウト履歴・テンプレート / メッセージ / 進捗管理 / ペルソナ版管理。
- **Tier 2（表示スタブ）**: レポート（recharts・数値はダミー明記）/ 権限管理 / 保存検索 / 気になる / 採用決定 / 設定。

---

## モックデータの設計意図（§7）

候補者40名はランダム生成せず、ペルソナごとに S/A/B/不合格 の分布が出るよう手設計しています。説明が映える仕込みケース:

- スキル満点だが要スポンサー（→ 懸念に在留サポート、訴求にスポンサー可）
- 適合度高いが希望年収レンジ超過（→ 懸念に年収、面談質問に交渉余地）
- 海外在住で来日意向あり（→ 訴求にオンボーディング支援、懸念に着任時期）
- 日本語N1・実務豊富だが転職意欲low（→ 返信可能性低、訴求にカジュアル面談）

---

## 品質向上（3段階で追加実装）

- **Stage 1 — 仕上げと一貫性**: `next/font`（Inter + Noto Sans JP）、グローバルトースト通知（`lib/toast.ts` / `Toaster`）、モーダル/ドロワーのアニメーション・Escで閉じる・bodyスクロールロック、フォーカスリング、`prefers-reduced-motion` 配慮。
- **Stage 2 — 説明可能性の可視化**: サブスコア9軸の**レーダーチャート**（`MatchRadar`）、AI推薦の**ソート/ランク絞り込みツールバー**、ペルソナウィザードStep7の**重みライブプレビュー**（重み変更で上位候補がリアルタイムに並び替わる）。
- **Stage 3 — 先進体験**: **⌘K コマンドパレット**（`CommandPalette`／候補者・ペルソナ・ページ横断ジャンプ）、**候補者比較モード**（`CompareTray`／最大3名のサブスコアを横並び比較・最高値を強調）、AI推薦**再実行のスコアリング演出**（スケルトン＋スピナー）。

## ディレクトリ

```
src/
├─ app/                  App Router（各画面）
├─ components/
│   ├─ layout/           AppSidebar / AppHeader / PageContainer
│   ├─ common/           StatCard / StatusBadge / EmptyState / SearchFilterCard / DataTable
│   ├─ ai/               MatchScoreBadge / AiRecommendationCard / MatchReasonPanel / MatchBreakdown / RecommendationFeedback / ScoutComposer
│   ├─ candidates/       CandidateMeta / CandidateDetailDrawer
│   ├─ personas/         PersonaFormWizard / PersonaSummaryCard / PersonaWeightEditor / PersonaVersionSwitcher
│   ├─ messages/         MessageThread
│   ├─ templates/        TemplateEditor
│   └─ reports/          FunnelReport
└─ lib/                  types / constants / matching / mock / store / format / cn
```

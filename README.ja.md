# Nebulon

PixiJS 公式サイトのトップページアニメーション効果を再現したプロジェクト。TypeScript + PixiJS v8 + Vite で構築されています。

[English](./README.en.md) | 日本語 | [中文](./README.md)

## 🌌 プロジェクト概要

Nebulon は PixiJS 公式サイトの象徴的なトップページアニメーションを忠実に再現したものです。空の雲レイヤーと宇宙星雲レイヤーの2つのシーンを組み合わせ、液体 blob マスクを使用して2つのシーン間の滑らかな移行を実現する視覚効果を特徴としています。

## ✨ 機能

- **2層シーン**: 空の雲レイヤー（Clouds）と宇宙星雲レイヤー（Stars）の2つの独立した3D視差シーン
- **液体マスク効果**: 動的な blob スプライトを使用して流体のようなシーン遷移効果を作成
- **擬似3Dレンダリング**: 透視投影を使用して3D空間での雲の飛行をシミュレート
- **スプリング物理**: 2軸スプリング物理シミュレーションを使用した滑らかな追従アニメーション
- **対話型制御**: マウス/タッチ移動でマスク位置を制御、クリックで開閉状態を切り替え

## 📁 プロジェクト構造

```
nebulon/
├── src/
│   ├── core/
│   │   └── Ticker.ts          # アニメーションループマネージャー
│   ├── filters/
│   │   └── SuperFilter.ts     # マスクベースの公開効果フィルター
│   ├── screens/
│   │   ├── Cloud.ts           # 3D配置能力を持つスプライト
│   │   ├── Clouds.ts          # 空の雲レイヤーシーン
│   │   ├── Stars.ts           # 宇宙星雲レイヤーシーン
│   │   ├── MaskyMask.ts       # 液体 blob マスク
│   │   └── MainScreen.ts      # メインシーンコンポジター
│   ├── utils/
│   │   ├── DoubleSpring.ts    # 2Dスプリング物理シミュレーション
│   │   ├── Math2.ts           # 数学ユーティリティ関数
│   │   └── Mini3d.ts          # 擬似3Dレンダリングシステム
│   ├── index.ts               # エクスポートエントリーポイント
│   ├── main.ts                # アプリケーションエントリーポイント
│   └── NebulonApp.ts          # メインアプリケーションクラス
├── public/
│   └── assets/img/            # 画像リソース
├── samples/                   # オリジナル JS サンプル
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🏗️ アーキテクチャ設計

### コアモジュール

#### 1. Ticker（アニメーションループ）
`requestAnimationFrame` ループと `deltaTime` 計算を管理し、異なるフレームレートでもアニメーションが一貫性を保つようにします。

#### 2. Mini3d（擬似3Dシステム）
透視投影公式 `scale = focalLength / (focalLength + z)` を使用して3D座標を2Dに投影し、カメラの回転と移動をサポートします。

#### 3. MaskyMask（液体マスク）
- スプリング物理を使用してターゲット位置に追従する50個の blob スプライトを作成
- 1900×1200 の RenderTexture にレンダリング
- blob は正弦波スケーリングを使用（負の値による反転効果も可能）

#### 4. SuperFilter（公開フィルター）
- マスクテクスチャからサンプリング、強度 `strength = r * a * 5.0` を計算
- 強度に基づいてわずかな変位オフセットを適用
- 下層コンテンツの可視性を制御

### レンダリング階層

```
MainScreen
├── Clouds（下層 - 空のシーン）
├── Stars（中層 - 宇宙シーン、SuperFilterを適用）
└── MaskyMask（renderable=false、テクスチャのみを提供）
```

## 🚀 クイックスタート

### 環境要件

- Node.js >= 18
- pnpm（推奨）または npm

### 依存関係のインストール

```bash
pnpm install
```

### 開発モード

```bash
pnpm dev
```

http://localhost:5173 にアクセスして効果を確認してください。

### 本番ビルド

```bash
pnpm build
```

ビルド成果物は `dist/` ディレクトリにあります。

### ビルド結果のプレビュー

```bash
pnpm preview
```

### オリジナルサンプルの実行

```bash
pnpm sample
```

ブラウザで `samples/index.html` を開いて、オリジナルの JavaScript バージョンの効果を確認してください。

## 🎮 インタラクション

- **マウス/タッチ移動**: 液体マスクの中心位置を制御
- **クリック/タッチ**: マスクの開閉状態を切り替え
- **自動モード**: 60フレームの無操作後、穏やかな自動揺れアニメーションに入ります

## 🔧 技術スタック

- **PixiJS v8**: WebGL/WebGPU 2Dレンダリングエンジン
- **TypeScript**: タイプセーフな開発体験
- **Vite**: 高速な開発ビルドツール

## 📝 オリジナルコードからの移植

このプロジェクトは PixiJS 公式サイトの `nebulon.js` を忠実に移植したものです。主な変更点：

1. **APIアップグレード**: 旧版 PIXI API から v8 の新 API に移行
2. **TypeScript 書き直し**: 完全な型定義を追加
3. **フィルターシステム書き直し**: v8 の `TextureMatrix` と `calculateSpriteMatrix` を使用
4. **シェーダーアップグレード**: GLSL ES 1.0 から GLSL ES 3.0 にアップグレード

## 📄 ライセンス

MIT License

## 🙏 謝辞

- [PixiJS](https://pixijs.com/) - オリジナルアニメーション効果のソース
- オリジナルコードは PixiJS チームによって作成されました
# ai-vtuber

ふぐおが開発しているAI Tuberのプロジェクトです。  
不定期でリポジトリはpublicになったり、privateになったりします。  
私の気分次第なので、ご了承ください。  

## 作ったものの動作紹介動画 (2025年)

### ニコニコ版
[![ニコニコに投稿した動画](https://github.com/user-attachments/assets/f4347090-c1f0-4732-a5c1-1b44659a62d6
)](https://www.nicovideo.jp/watch/sm44894134)

### youtube版
[![YouTubeに投稿した動画](https://github.com/user-attachments/assets/0696b050-3c25-4018-abc0-eb43e8959221)](https://www.youtube.com/watch?v=sDGx7GBClS4)

## さらっとした概要(2024年)

[https://speakerdeck.com/boxfish/yan-jiu-bao-gao-feng-2024nian-ai-tuberhuo-dong-matome](https://speakerdeck.com/boxfish/yan-jiu-bao-gao-feng-2024nian-ai-tuberhuo-dong-matome)

## 現在できること

- コメントの取得(外部のコメント取得プロセスから取ってきます。)
- 音声認識
- webアプリとキーボードを使った発言タイミングのコントロールと話題の管理
- voicevoxを使った音声合成
- 自動で発話を行う
- 会話履歴の保存
- システムプロンプト、入力例、出力例の設定
- 会話履歴の切れ目を自動で設定
- 画面のスクショをとり、AIに提示
- AIが自律的に配信UIの変更、PCの自動操作、雑談話題を振ってくる機能
- 配信外にていつでもどこでもプロンプトエンジニアリングできるwebアプリ

## 今後やること

- 音声認識と配信UI、会話履歴の蓄積に関しては、配信ツールor何かに統合される予定。(責務がAI Tuberにないので)。
- Dockerとかを活用して、動かしやすくしたい。(暗黙的に動かすコマンドが多すぎるし、毎回毎回手作業で動かすのがだるい)
- AIをもっと自発的に動かしていくよ(もっと働いてもらう)。

## アバターなど
AI Tuberなのにアバターを動かす部分はありません。  
現状はこだわっている場合ではないので、アバターはありません。  
アバター付きで動かしたい場合は、VBCableやVtube Studioを使えばある程度それっぼいことはできます。  

## ディレクトリ構成

### ai_vtuber
メインのコード、hono, langchain, prisma, sqliteなどを使用

この図のプログラムの音声再生、コメント取得、音声認識等以外  

![システム図](./docs/system.png)  

### api
cloudflareにデプロイしてるスクショを保存、urlで閲覧するプログラム。
hono, cloudflare R2を使用

### front_end
AI Tuberコントロールアプリ。音声認識もしてる。
vite, react, tailwind css, shadcnを使用

### llm
プロンプトエンジニアリングをするためのアプリ。ゴロゴロしながら、AIちゃんのプロンプトを練りたいと思ってつくったけど、あんまり使ってない
next.js, prisma, postgress, vercel AI sdkを使用。デプロイ先、DBはVercel。

### obs
biimシステム風OBSのUIを作っているやつ。ReactとTailwind CSSで作ってます。

### endpoint.json
サーバーのアドレスとポート番号の指定

### supplement.json
obsのUIに暇なときに流している、プロフィール的なやつ。

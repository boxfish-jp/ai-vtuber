import { exec } from "node:child_process";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const cli = {
	tool: tool(
		({ command }: { command: string }): boolean => {
			console.log("command:", command);
			try {
				exec(command, { encoding: "utf8" });
				return true;
			} catch (error) {
				console.error("Command execution failed:", error);
				return false;
			}
		},
		{
			name: "cli",
			description: `ブラウザで特定のページを開きユーザーにそのページを閲覧させる、エディターを開く、ターミナルを開く,Lazygitを開くといった処理に使用するエージェントです。
command引数にbashコマンドを入れると、そのコマンドを実行されます。
# cliコマンドをする上での背景知識
## vs codeを開き方
\`\`\`bash
code
\`\`\`

## ターミナルを開く
\`\`\`bash
wezterm
\`\`\`

## githubを開く
\`\`\`bash
start https://github.com
\`\`\`

## ai-vtuberリポジトリを開く
\`\`\`bash
start https://github.com/boxfish-jp/ai-vtuber
\`\`\`

## 放送ページを開く
\`\`\`bash
start https://live.nicovideo.jp/watch/user/98746932
\`\`\`

## アニメ管理アプリを開く
\`\`\`bash
start https://annict.com/
\`\`\`

## google検索
検索キーワードが「ラーメン」の場合
\`\`\`bash
start https://www.google.com/search?q=ラーメン
\`\`\`

## ブルーアーカイブを開く
\`\`\`bash
"C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe" --instance Pie64 --cmd launchAppWithBsx --package "com.YostarJP.BlueArchive" --source desktop_shortcut
\`\`\`
`,
			schema: z.object({
				command: z.string(),
			}),
		},
	),
	message: "開けたのだ？",
	action: "CLIを操作し、ユーザーに頼まれていた操作を実行した。",
};

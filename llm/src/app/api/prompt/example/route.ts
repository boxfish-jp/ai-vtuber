import { createData } from "@/lib/createData";
import { getLatestData } from "@/lib/getLatestData";
import { parseExamplePrompt } from "@/lib/parseExamplePrompt";

export async function POST(req: Request) {
	const { version, prompt, publish } = await req.json();
	const oldPromptData = await getLatestData(2);
	const oldPromptVersion = oldPromptData.version;
	if (publish) {
		await createData(oldPromptVersion + 1, 2, { system: prompt });
	} else {
		await createData(version, 2, { system: prompt });
	}
	return new Response("OK", { status: 200 });
}

export async function GET() {
	const promptData = await getLatestData(2);
	const examplePrompt = parseExamplePrompt(promptData);
	return new Response(JSON.stringify(examplePrompt), {
		headers: { "Content-Type": "application/json" },
	});
}

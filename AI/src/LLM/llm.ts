import endpoint from "../../../endpoint.json";

export type chatHistoryType = { human: string; ai: string }[];

const createMessages = (
  chatHistory: chatHistoryType
): { role: string; content: string }[] => {
  const messages: { role: string; content: string }[] = [];
  for (const chat of chatHistory) {
    if (chat.human) {
      messages.push({ role: "user", content: chat.human });
    }
    if (chat.ai) {
      messages.push({ role: "assistant", content: chat.ai });
    }
  }
  return messages;
};

const parseResponse = (response: string): string => {
  const texts = response.split("\n");
  let parsedText = "";
  for (const text of texts) {
    parsedText += text.substring(3, text.length - 1);
  }
  return parsedText.replace(/\n+/g, "").replace(/\\n+/g, " ");
};

export const think = async (chatHistory: chatHistoryType): Promise<string> => {
  const messages = createMessages(chatHistory);
  try {
    console.log(`${endpoint.LLM.url}/api/chat`);
    const response = await fetch(`${endpoint.LLM.url}/api/chat`, {
      method: "POST",
      body: JSON.stringify({ messages }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.text();
    return parseResponse(data);
  } catch (error) {
    throw new Error(`Failed to fetch LLM: ${String(error)}`);
  }
};

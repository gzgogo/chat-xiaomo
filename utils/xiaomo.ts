import { Message, OpenAIModel } from "@/types";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
// import fetchX from "node-fetch";
// import { HttpsProxyAgent } from "https-proxy-agent";
import dotenv from "dotenv";

const env = dotenv.config().parsed || {}; // 环境参数

export const OpenAIStream = async (messages: Message[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const prompt = messages
    .map((message) => {
      return `${message.role}: ${message.content}`;
    })
    .join("\n");

  const res = await fetch("https://api.openai.com/v1/completions", {
    // const res = await fetch("http://47.254.24.29/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.XIAOMO,
      prompt,
      max_tokens: 800,
      temperature: 0.8,
      stop: ["end", "END"],
      stream: true,
    }),
    // agent: new HttpsProxyAgent("http://127.0.0.1:8001"),
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

import axios from "axios";
import HttpsProxyAgent from "https-proxy-agent";
import { OpenAIModel } from "@/types";
import dotenv from "dotenv";

const env = dotenv.config().parsed || {}; // 环境参数
console.log("env:");
console.log(env);

const instance = axios.create({
  // httpsAgent: new HttpsProxyAgent("http://127.0.0.1:8001"),
  // proxy: false,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.OPENAI_API_KEY}`,
  },
});

export async function getTextReply(prompt: string) {
  let reply = "";

  try {
    console.log("🚀🚀🚀 / prompt: ", prompt);

    const data = {
      model: OpenAIModel.XIAOMO,
      prompt,
      max_tokens: 500,
      temperature: 0.8,
      stop: ["end", "END", "ender"],
      // stream: true,
    };

    const response = await instance.post(
      "https://api.openai.com/v1/completions",
      data,
    );

    let choices = response.data.choices || [];
    reply = choices[0].text || "";

    // // <br/>统一换成\n
    // reply.replace("<br/>", "\n");
    // reply.replace("<br />", "\n");

    // // 去掉开头的非字符内容
    // reply = (/^[\s,?!*#.。，？！、]*([\s\S]+)/.exec(reply) || [])[1];

    // const reply = markdownToText(response.data.choices[0].text)
    console.log("🚀🚀🚀 / reply: ", reply);
  } catch (error: any) {
    reply = error.response
      ? `Error(${error.response.status}): ${error.response.statusText}`
      : `Error: ${error || "未知错误"}`;
    console.log(error.response?.data.error.message);
    console.error(error);
  }

  return reply;
}

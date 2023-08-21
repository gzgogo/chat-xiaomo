import { Message } from "@/types";
import { OpenAIStream } from "@/utils/xiaomo";
import { getTextReply } from "@/utils";
import { error } from "console";

// export const config = {
//   runtime: "edge",
// };

const handler = async (req: Request, res: any): Promise<Response> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { messages } = req.body as any;

      const charLimit = 12000;
      let charCount = 0;
      let messagesToSend = [];

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (charCount + message.content.length > charLimit) {
          break;
        }
        charCount += message.content.length;
        messagesToSend.push(message);
      }

      const prefix = "";
      const prompt = messages[messages.length - 1].content;
      const result = await getTextReply(`${prompt} ->`);
      // const prompt = messages
      //   .map((message: Message) => {
      //     return `${getRoleName(message.role)}: ${message.content}`;
      //   })
      //   .join("\n\n");
      // const result = await getTextReply(`${prefix}\n\n${prompt} ->`);
      res.status(200).end(result);
      return resolve(new Response(result));

      // const stream = await OpenAIStream(messagesToSend);
      // return new Response(stream);
    } catch (error) {
      console.error(error);
      res.status(500).end(error);
      reject(new Response("Error", { status: 500 }));
      // return new Response("Error", { status: 500 });
    }
  });
};

function getRoleName(role: string) {
  switch (role) {
    case "assistant":
      return "机器人";
    case "user":
      return "用户";
    default:
      return "用户";
  }
}

export default handler;

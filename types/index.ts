export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo",
  XIAOMO = "davinci:ft-personal:xiaomo-2023-08-16-18-03-10",
}

export interface Message {
  role: Role;
  content: string;
}

export type Role = "assistant" | "user";

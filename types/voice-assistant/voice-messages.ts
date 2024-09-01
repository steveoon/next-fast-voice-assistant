import { z } from "zod";

// 使用Zod定义MessageRole和Message
const MessageRoleSchema = z.enum(["system", "user", "assistant"]);

const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string(),
});

// 导出类型
export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type Message = z.infer<typeof MessageSchema>;

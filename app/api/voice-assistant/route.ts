import { NextRequest, NextResponse } from "next/server";
import { VoiceAssistant } from "@/app/lib/voice-assistant";
import { VoiceAssistantConfig } from "@/types";

// 创建一个默认的assistant实例
const defaultAssistant = new VoiceAssistant();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.audio || typeof data.audio !== "string") {
      return NextResponse.json(
        { error: "Invalid audio data" },
        { status: 400 }
      );
    }

    let audioBuffer = Buffer.from(data.audio, "base64");

    // 确保 audioBuffer 的长度是 4 的倍数
    if (audioBuffer.length % 4 !== 0) {
      const padding = 4 - (audioBuffer.length % 4);
      audioBuffer = Buffer.concat([audioBuffer, Buffer.alloc(padding)]);
    }

    // 检查是否有自定义配置
    let assistant = defaultAssistant;
    if (data.config && typeof data.config === "object") {
      const config: Partial<VoiceAssistantConfig> = {
        language: data.config.language,
        sttModel: data.config.sttModel,
        llmModel: data.config.llmModel,
        ttsVoiceId: data.config.ttsVoiceId,
      };
      assistant = new VoiceAssistant(config);
    }

    const response = await assistant.processAudio(audioBuffer);
    return new NextResponse(response, {
      headers: {
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const message = searchParams.get("message") || "你好，今天过得怎么样？";

    // 检查是否有自定义配置
    let assistant = defaultAssistant;
    const config: Partial<VoiceAssistantConfig> = {};
    if (searchParams.get("language"))
      config.language = searchParams.get("language")!;
    if (searchParams.get("sttModel"))
      config.sttModel = searchParams.get("sttModel")!;
    if (searchParams.get("llmModel"))
      config.llmModel = searchParams.get("llmModel")!;
    if (searchParams.get("ttsVoiceId"))
      config.ttsVoiceId = searchParams.get("ttsVoiceId")!;

    if (Object.keys(config).length > 0) {
      assistant = new VoiceAssistant(config);
    }

    const greeting = await assistant.say(message);
    return new NextResponse(greeting, {
      headers: {
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    console.error("Error generating greeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

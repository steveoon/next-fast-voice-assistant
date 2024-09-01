import { createClient } from "@deepgram/sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import axios from "axios";
import { NonRealTimeVAD } from "@ricky0123/vad";
import { Message } from "@/types";

// 初始化服务
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
const cerebras = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });
let vad: NonRealTimeVAD;

// 异步初始化VAD
(async () => {
  vad = await NonRealTimeVAD.new();
})();

export class VoiceAssistant {
  private chatContext: Message[] = [
    {
      role: "system",
      content:
        "You are a voice assistant. Pretend we're having a human conversation, no special formatting or headings, just natural speech.",
    },
  ];

  async processAudio(audioBuffer: Buffer): Promise<Buffer> {
    // VAD 检测
    const audioFloat32 = new Float32Array(audioBuffer.buffer);
    const sampleRate = 16000; // 假设音频采样率为 16kHz，如果不是，请调整
    let speechDetected = false;

    for await (const { audio, start, end } of vad.run(
      audioFloat32,
      sampleRate
    )) {
      speechDetected = true;
      // 我们只需要知道是否检测到语音，所以这里不需要处理每个语音段
      break;
    }

    if (!speechDetected) return Buffer.from("");

    // STT 转录
    const transcription = await this.transcribe(audioBuffer);

    // LLM 处理
    const response = await this.generateResponse(transcription);

    // TTS 合成
    return await this.synthesizeSpeech(response);
  }

  private async transcribe(audioBuffer: Buffer): Promise<string> {
    const response = await deepgram.transcription.preRecorded(
      { buffer: audioBuffer },
      { punctuate: true }
    );
    return response.results.channels[0].alternatives[0].transcript;
  }

  private async generateResponse(input: string): Promise<string> {
    this.chatContext.push({ role: "user", content: input });
    const completion = await cerebras.chat.completions.create({
      messages: this.chatContext.map((message) => ({
        role: message.role as "system" | "user" | "assistant",
        content: message.content,
      })),
      model: "llama3.1-8b",
    });
    const response = completion.choices[0].message.content ?? "";
    this.chatContext.push({ role: "assistant", content: response });
    return response;
  }

  private async synthesizeSpeech(text: string): Promise<Buffer> {
    const response = await axios.post(
      "https://api.cartesia.ai/tts/bytes",
      {
        transcript: text,
        model_id: "sonic-english",
        voice: { mode: "id", id: "a0e99841-438c-4a64-b679-ae501e7d6091" },
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 44100,
        },
      },
      {
        headers: {
          "Cartesia-Version": "2024-06-10",
          "X-API-Key": process.env.CARTESIA_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );
    return Buffer.from(response.data);
  }

  async say(message: string): Promise<Buffer> {
    return await this.synthesizeSpeech(message);
  }
}

export const assistant = new VoiceAssistant();

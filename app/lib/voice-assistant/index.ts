import { createClient } from "@deepgram/sdk";
import axios from "axios";
import { NonRealTimeVAD } from "@ricky0123/vad/dist/index.node";
import { Message, VoiceAssistantConfig } from "@/types";
import { generateText } from "ai";
import { getGroq } from "../llm-provider";

export class VoiceAssistant {
  private deepgram: any;
  private groq: any;
  private vad: NonRealTimeVAD | null = null;
  private config: VoiceAssistantConfig;
  private chatContext: Message[] = [
    {
      role: "system",
      content:
        "You are a voice assistant. Pretend we're having a human conversation, no special formatting or headings, just natural speech.",
    },
  ];

  constructor(config: Partial<VoiceAssistantConfig> = {}) {
    this.config = {
      language: "zh",
      sttModel: "nova-2",
      llmModel: "llama-3.1-8b-instant",
      ttsVoiceId: "0b904166-a29f-4d2e-bb20-41ca302f98e9",
      ...config,
    };
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
    this.groq = getGroq();
    this.initVAD();
  }

  private async initVAD() {
    if (typeof window === "undefined") {
      const { NonRealTimeVAD } = await import("@ricky0123/vad/dist/index.node");
      this.vad = await NonRealTimeVAD.new();
    }
  }

  async processAudio(audioBuffer: Buffer): Promise<ArrayBuffer> {
    if (!this.vad) {
      throw new Error("VAD not initialized");
    }

    const audioFloat32 = new Float32Array(
      audioBuffer.buffer,
      audioBuffer.byteOffset,
      audioBuffer.byteLength / 4
    );
    const sampleRate = 16000;

    let speechDetected = false;
    for await (const { audio, start, end } of this.vad.run(
      audioFloat32,
      sampleRate
    )) {
      speechDetected = true;
      break;
    }

    if (!speechDetected) return new ArrayBuffer(0);

    const transcription = await this.transcribe(audioBuffer);
    const response = await this.generateResponse(transcription);
    return await this.synthesizeSpeech(response);
  }

  private async transcribe(audioBuffer: Buffer): Promise<string> {
    try {
      const options = {
        model: this.config.sttModel,
        smart_format: true,
        language: this.config.language,
        mimetype: "audio/wav",
      };

      const { result } = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        options
      );
      return result?.results?.channels[0]?.alternatives[0]?.transcript || "";
    } catch (err) {
      console.error("Transcription failed:", err);
      throw err;
    }
  }

  private async generateResponse(input: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.groq(this.config.llmModel),
        system: this.chatContext[0].content,
        prompt: input,
        temperature: 0.9,
        maxTokens: 700,
      });
      return text;
    } catch (err) {
      console.error("Response generation failed:", err);
      throw err;
    }
  }

  private async synthesizeSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await axios.post(
        "https://api.cartesia.ai/tts/bytes",
        {
          transcript: text,
          model_id: "sonic-multilingual",
          voice: { mode: "id", id: this.config.ttsVoiceId },
          __experimental_controls: {
            speed: "slow",
            emotion: ["positivity:high", "curiosity"],
          },
          output_format: {
            container: "raw",
            encoding: "pcm_f32le",
            sample_rate: 44100,
          },
          language: this.config.language,
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
      return response.data;
    } catch (err) {
      console.error("Speech synthesis failed:", err);
      throw err;
    }
  }

  async say(message: string): Promise<ArrayBuffer> {
    return await this.synthesizeSpeech(message);
  }
}

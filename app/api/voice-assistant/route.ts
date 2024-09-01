import { NextRequest, NextResponse } from "next/server";
import { assistant } from "@/app/lib";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const audioBuffer = Buffer.from(data.audio, "base64");
  const response = await assistant.processAudio(audioBuffer);
  return NextResponse.json({ audio: response.toString("base64") });
}

export async function GET() {
  const greeting = await assistant.say("Hi there, how are you doing today?");
  return NextResponse.json({ audio: greeting.toString("base64") });
}

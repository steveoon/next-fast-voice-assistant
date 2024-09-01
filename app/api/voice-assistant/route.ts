import { NextRequest, NextResponse } from "next/server";
import { assistant } from "@/app/lib";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.audio || typeof data.audio !== "string") {
      return NextResponse.json(
        { error: "Invalid audio data" },
        { status: 400 }
      );
    }
    const audioBuffer = Buffer.from(data.audio, "base64");
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

export async function GET() {
  try {
    const greeting = await assistant.say("你好，今天过得怎么样？");
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

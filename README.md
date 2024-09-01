# NEXT FAST VOICE ASSISTANT API

## 项目简介

这个项目是[fast-voice-assistant](https://github.com/dsa/fast-voice-assistant.git)的 Typescript 版本。

**特点: 就一个字, 快!🚀, 建议使用 WebRTC 传输音频流, 这样延迟更低。**

实现并集成了 OpenAPI, 一个高度可定制的 AI 语音助手，集成了最先进的语音识别（STT）、自然语言处理（NLP）和语音合成（TTS）技术。它提供了一个简单而强大的接口，可以轻松地将语音交互功能集成到各种应用程序中。

## 部署

一键部署到 Vercel, 点击下面的按钮即可

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FsteveoOn%2Fnext-fast-voice-assistant.git&env=DEEPGRAM_API_KEY,CEREBRAS_API_KEY,CARTESIA_API_KEY&envDescription=API%20keys%20for%20Deepgram%2C%20Cerebras%2C%20and%20Cartesia&envLink=https%3A%2F%2Fdocs.cartesia.ai%2F%23%2Fgetting-started%2Fsetting-up-api-keys&project-name=next-fast-voice-assistant&repo-name=next-fast-voice-assistant)

## 主要特性

- **语音活动检测（VAD）**：使用高效的算法精确识别语音输入。
- **语音转文字（STT）**：采用 Deepgram 的先进模型进行准确的语音转录。
- **自然语言处理（NLP）**：利用强大的语言模型（如 GPT）生成智能响应。
- **文字转语音（TTS）**：使用 Cartesia 的高质量语音合成技术。
- **高度可定制**：支持多语言、多种模型选择，以及灵活的配置选项。
- **简单集成**：提供简洁的 RESTful API，易于集成到各种应用中。

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Deepgram STT
- GPT/GROQ 语言模型
- Cartesia TTS
- @ricky0123/vad 用于语音活动检测

## API 使用指南

### POST /api/voice-assistant

处理音频输入并返回语音响应。

#### 请求体

```json
{
  "audio": "base64_encoded_audio_data",
  "config": {
    "language": "zh",
    "sttModel": "nova-2",
    "llmModel": "llama-3.1-8b-instant",
    "ttsVoiceId": "voice-id"
  }
}
```

- `audio`: Base64 编码的音频数据（必需）
- `config`: 可选的配置对象
  - `language`: 语言代码（可选，默认为 "zh"）这里的国际化语言代码使用的格式是 [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag)
  - `sttModel`: 语音转文字模型（可选）参考[Deepgram 的 Models](https://developers.deepgram.com/docs/models)
  - `llmModel`: 语言模型（可选）使用[Groq](https://console.groq.com/docs/models)的模型
  - `ttsVoiceId`: 文字转语音的声音 ID（可选）可以参考[Cartesia 的 Voices](https://play.cartesia.ai/library)

#### 响应

返回 WAV 格式的音频数据。

### GET /api/voice-assistant

生成语音问候。

#### 查询参数

- `message`: 要转换为语音的文本（可选，默认为 "你好，今天过得怎么样？"）
- `language`: 语言代码（可选）
- `sttModel`: 语音转文字模型（可选）
- `llmModel`: 语言模型（可选）
- `ttsVoiceId`: 文字转语音的声音 ID（可选）

#### 响应

返回 WAV 格式的音频数据。

## 使用示例

### 使用 cURL 发送 POST 请求

```bash
curl -X POST https://your-api-url/api/voice-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "base64_encoded_audio_data",
    "config": {
      "language": "en",
      "sttModel": "nova-2",
      "llmModel": "llama-3.1-8b-instant",
      "ttsVoiceId": "eda5bbff-1ff1-4886-8ef1-4e69a77640a0"
    }
  }'

# 使用默认配置的例子
AUDIO_BASE64=$(base64 -i input-audio.wav | tr -d '\n')
echo "{\"audio\": \"$AUDIO_BASE64\"}" > temp_audio.json

curl -X POST http://localhost:3000/api/voice-assistant \
    -H "Content-Type: application/json" \
    --data @temp_audio.json | ffmpeg -f f32le -ar 44100 -ac 1 -i pipe: output4.wav

rm temp_audio.json
```

### 使用 cURL 发送 GET 请求

```bash
curl -G "http://localhost:3000/api/voice-assistant" \
     --data-urlencode "message=Next Fast Voice Assistant简直太快太方便了吧？" \
     --data-urlencode "language=zh" \
     --data-urlencode "sttModel=nova-2" \
     --data-urlencode "llama-3.1-8b-instant3" \
     --data-urlencode "ttsVoiceId=eda5bbff-1ff1-4886-8ef1-4e69a77640a0" | ffmpeg -f f32le -ar 44100 -ac 1 -i pipe: voice.wav
```

## 项目优势

1. **高度灵活**：支持多种语言和模型，可以根据不同需求进行定制。
2. **性能优越**：使用最新的 AI 技术，提供快速、准确的语音交互体验。
3. **易于集成**：简单的 API 设计使其容易集成到各种应用中。
4. **可扩展性强**：模块化设计允许轻松添加新功能或替换现有组件。
5. **实时处理**：支持实时语音输入和响应。
6. **安全可靠**：采用严格的错误处理和安全措施。

## 部署

1. 克隆仓库：

   ```
   git clone https://github.com/steveoOn/next-fast-voice-assistant.git
   ```

2. 安装依赖：

   ```
   pnpm install
   ```

3. 设置环境变量（在 `.env.local` 文件中）：

   ```
   DEEPGRAM_API_KEY=your_deepgram_key
   CEREBRAS_API_KEY=your_cerebras_key
   CARTESIA_API_KEY=your_cartesia_key
   ```

   参考 [.env.example](./.env.example) 文件来创建你自己的环境变量文件.

4. 运行开发服务器：

   ```
   pnpm dev
   ```

5. 构建生产版本：
   ```
   pnpm build
   ```

## 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何开始。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

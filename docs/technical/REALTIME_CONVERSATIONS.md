# Realtime conversations

Learn how to manage realtime speech-to-speech conversations.

Once you have connected to the Realtime API through either [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc) or [WebSocket](https://platform.openai.com/docs/guides/realtime-websocket), you can call a Realtime model (such as [gpt-realtime](https://platform.openai.com/docs/models/gpt-realtime)) to have speech-to-speech conversations. Doing so requires you to **send client events** to initiate actions, and **listen for server events** to respond to actions taken by the Realtime API.

This guide walks through the event flows required to use model capabilities like audio and text generation, image input, and function calling, plus how to think about the state of a Realtime Session.

If you do not need to have a conversation with the model, meaning you do not expect any response, you can use the Realtime API in [transcription mode](https://platform.openai.com/docs/guides/realtime-transcription).

## How this fits Bickford (architecture map)

This guide explains the Realtime API mechanics. For Bickford, the key question is **what each action enables** and how it supports decision continuity, automation, and persistence.

### Intent → decision pipeline

| Realtime capability | What it enables in Bickford | Where it lands |
| --- | --- | --- |
| `conversation.item.create` with `input_text` or audio transcript | Capture spoken intent as text | Send transcript + intent to `POST /api/realtime`, then forward intent to `POST /api/execute` for a decision + ledger entry. |
| `response.output_text.delta` | Live feedback while the model is still speaking/typing | Streaming UI updates (recommended for `packages/web-ui` when realtime UI is built). |
| `response.done` | Final, stable output | Persist the final transcript and decision summary. |
| Session end | Durable audit trail | Capture a session completion event (use `@bickford/session-completion-runtime`). |

### Recommended Bickford integration path (no code yet)

1. **Connect Realtime** (WebRTC or WebSocket). This unlocks low-latency speech input.
2. **Turn speech into intent**: listen for `response.done` or transcript events, then map the final transcript into a single `intent` string.
3. **Persist the transcript**: send `{ sessionId, transcript, intent, metadata }` to `POST /api/realtime` to store the raw transcript and intent together for auditability.
4. **Optionally steer configuration**: include `configOverrides` on `POST /api/realtime` or `POST /api/execute` when you need a known runtime profile (e.g., `"routing": "low-latency"`). This creates a durable configuration artifact you can reference later.
5. **Option A (single call)**: set `execute: true` on `POST /api/realtime` to archive and execute in one step (the transcript + metadata are captured in the ledger entry).
6. **Option B (two steps)**: call `POST /api/execute` with the extracted intent and keep the returned `ledgerEntry.id` for traceability.
7. **Persist the session**: on session end, record the transcript, decision outcome, and `ledgerEntry.id` using the Session Completion Runtime so the outcome is recoverable and auditable.
8. **Compound knowledge**: every execution writes a knowledge record (`trace/knowledge-YYYY-MM-DD.jsonl`) so the system keeps a durable memory of decisions and their context.
9. **Compound dynamic performance**: every execution writes a performance record (`trace/performance-YYYY-MM-DD.jsonl`) with duration and traceability so you can observe latency trends over time.
10. **Compound dynamic configuration**: every execution writes a configuration record (`trace/configuration-YYYY-MM-DD.jsonl`) with the resolved configuration fingerprint and any overrides applied.

> Coaching note: Steps 2–4 are the “why” behind the mechanics. They make realtime speech actionable by binding it to Bickford’s decision engine, ledger, and configuration trail.

## Continuous compounding (business workflows + value tracking)

If you want **continuous compounding**, aim for a loop where every realtime action produces:

1. **A decision outcome** (execution + ledger).
2. **A durable knowledge artifact** (so the system remembers).
3. **A measurable value signal** (so you can steer automation by impact).

Think of each workflow as: **Intent → Decision → Action → Knowledge → Value signal → Next intent**.

### Real-world workflow examples (what each action enables)

| Workflow | Realtime trigger | Automation action | Knowledge artifact | Value signal (USD/hr) |
| --- | --- | --- | --- | --- |
| Support triage | Live transcript identifies issue type | Auto-route to L1/L2 queue, draft reply | Resolution pattern + outcomes | Hours saved per resolved ticket |
| Sales qualification | Call transcript signals buying intent | Create CRM opportunity, schedule follow-up | Qualified lead record | Rep time saved × avg hourly rate |
| Incident response | “Service down” detected | Page on-call, open incident | Incident timeline + runbook path | Downtime avoided × revenue/hr |
| Finance approvals | “Approve spend” detected | Route to approver + policy check | Approval decision + rationale | Approval cycle time reduced |
| Legal intake | “Review contract” detected | Create case + assign reviewer | Risk classification + clause map | Review hours reduced |
| R&D experiment | “Run experiment” detected | Start job + log params | Experiment snapshot + result | Research iteration time saved |

> Coaching note: each workflow ties the **action** to a **value signal**, so you can decide what to automate next based on compounding returns.

### Value tracking structure (examples you can extend)

Track value as **USD per hour saved or gained**, segmented by the dimensions you care about. Below is a starter set — expand as needed:

- **Region**: AMER, EMEA, APAC, LATAM, NA, EU, UK, ANZ.
- **Business unit**: Sales, Support, Finance, Legal, Security, Engineering, Research, Operations.
- **Sales region**: North America, EMEA Enterprise, APAC Enterprise, LATAM Mid-Market.
- **Customer tier**: Enterprise, Mid-Market, SMB, Public Sector.
- **Product line**: Core, Enterprise, Edge, Platform, API.
- **Channel**: Inbound, Outbound, Partner, Self-serve.
- **KPI**: Revenue/hr, Margin/hr, Tickets/hr, Incidents/hr, Deployments/hr, Conversion/hr.
- **Team**: SRE, Infra, Security, Applied AI, Product, Growth.
- **Role**: AE, CSM, SE, Support Engineer, Analyst, PM.
- **Employee**: per-employee USD/hr baseline (use comp to normalize impact).
- **Workflow**: onboarding, renewals, escalations, approvals, incident response.
- **Account segment**: Top 50, Strategic, Long-tail.
- **Deal stage**: Discovery, Evaluation, Procurement, Close.
- **Risk class**: Low, Medium, High, Critical.
- **SLA tier**: Platinum, Gold, Silver.
- **Locale**: Country/State/City/Timezone.
- **Shift**: Day, Swing, Overnight.
- **System**: Datacenter/Cloud region, cluster, environment (prod/stage/dev).

Each execution can include a `metadata` object capturing these dimensions so you can compute **compounding value per hour** over time.

## Realtime speech-to-speech sessions

A Realtime Session is a stateful interaction between the model and a connected client. The key components of the session are:

- The **Session** object, which controls the parameters of the interaction, like the model being used, the voice used to generate output, and other configuration.
- A **Conversation**, which represents user input items and model output items generated during the current session.
- **Responses**, which are model-generated audio or text items that are added to the Conversation.

### Input audio buffer and WebSockets

If you are using WebRTC, much of the media handling required to send and receive audio from the model is assisted by WebRTC APIs.

If you are using WebSockets for audio, you will need to manually interact with the **input audio buffer** by sending audio to the server, sent with JSON events with base64-encoded audio.

All these components together make up a Realtime Session. You will use client events to update the state of the session, and listen for server events to react to state changes within the session.

![diagram realtime state](https://openaidevs.retool.com/api/file/11fe71d2-611e-4a26-a587-881719a90e56)

## Session lifecycle events

After initiating a session via either [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc) or [WebSockets](https://platform.openai.com/docs/guides/realtime-websockets), the server will send a [`session.created`](https://platform.openai.com/docs/api-reference/realtime-server-events/session/created) event indicating the session is ready. On the client, you can update the current session configuration with the [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update) event. Most session properties can be updated at any time, except for the `voice` the model uses for audio output, after the model has responded with audio once during the session. The maximum duration of a Realtime session is **60 minutes**.

The following example shows updating the session with a `session.update` client event. See the [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc#sending-and-receiving-events) or [WebSocket](https://platform.openai.com/docs/guides/realtime-websocket#sending-and-receiving-events) guide for more on sending client events over these channels.

Update the system instructions used by the model in this session:

```js
const event = {
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime",
    // Lock the output to audio (set to ["text"] if you want text without audio)
    output_modalities: ["audio"],
    audio: {
      input: {
        format: {
          type: "audio/pcm",
          rate: 24000,
        },
        turn_detection: {
          type: "semantic_vad",
        },
      },
      output: {
        format: {
          type: "audio/pcm",
        },
        voice: "marin",
      },
    },
    // Use a server-stored prompt by ID. Optionally pin a version and pass variables.
    prompt: {
      id: "pmpt_123", // your stored prompt ID
      version: "89", // optional: pin a specific version
      variables: {
        city: "Paris", // example variable used by your prompt
      },
    },
    // You can still set direct session fields; these override prompt fields if they overlap:
    instructions:
      "Speak clearly and briefly. Confirm understanding before taking actions.",
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "type": "realtime",
        "model": "gpt-realtime",
        # Lock the output to audio (add "text" if you also want text)
        "output_modalities": ["audio"],
        "audio": {
            "input": {
                "format": {
                    "type": "audio/pcm",
                    "rate": 24000,
                },
                "turn_detection": {
                    "type": "semantic_vad",
                },
            },
            "output": {
                "format": {
                    "type": "audio/pcmu",
                },
                "voice": "marin",
            },
        },
        # Use a server-stored prompt by ID. Optionally pin a version and pass variables.
        "prompt": {
            "id": "pmpt_123",  # your stored prompt ID
            "version": "89",  # optional: pin a specific version
            "variables": {
                "city": "Paris",  # example variable used by your prompt
            },
        },
        # You can still set direct session fields; these override prompt fields if they overlap:
        "instructions": "Speak clearly and briefly. Confirm understanding before taking actions.",
    },
}
ws.send(json.dumps(event))
```

When the session has been updated, the server will emit a [`session.updated`](https://platform.openai.com/docs/api-reference/realtime-server-events/session/updated) event with the new state of the session.

## Text inputs and outputs

To generate text with a Realtime model, you can add text inputs to the current conversation, ask the model to generate a response, and listen for server-sent events indicating the progress of the model's response. In order to generate text, the [session must be configured](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update) with the `text` modality (this is true by default).

Create a new text conversation item using the [`conversation.item.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create) client event. This is similar to sending a [user message (prompt) in Chat Completions](https://platform.openai.com/docs/guides/text-generation) in the REST API.

Create a conversation item with user input:

```js
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "What Prince album sold the most copies?",
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "conversation.item.create",
    "item": {
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": "What Prince album sold the most copies?",
            }
        ],
    },
}
ws.send(json.dumps(event))
```

After adding the user message to the conversation, send the [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) event to initiate a response from the model. If both audio and text are enabled for the current session, the model will respond with both audio and text content. If you would like to generate text only, you can specify that when sending the `response.create` client event.

Generate a text-only response:

```js
const event = {
  type: "response.create",
  response: {
    output_modalities: ["text"],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {"output_modalities": ["text"]},
}
ws.send(json.dumps(event))
```

When the response is completely finished, the server will emit the [`response.done`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/done) event. This event will contain the full text generated by the model.

Listen for `response.done` to see the final results:

```js
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (serverEvent.type === "response.done") {
    console.log(serverEvent.response.output[0]);
  }
}

// Listen for server messages (WebRTC)
dataChannel.addEventListener("message", handleEvent);

// Listen for server messages (WebSocket)
// ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    if server_event.type == "response.done":
        print(server_event.response.output[0])
```

While the model response is being generated, the server will emit a number of lifecycle events during the process. You can listen for these events, such as [`response.output_text.delta`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_text/delta), to provide realtime feedback to users as the response is generated. A full listing of the events emitted by the server are found below under **related server events**. They are provided in the rough order of when they are emitted, along with relevant client-side events for text generation.

| Client events | Server events |
| --- | --- |
| `conversation.item.create`<br>`response.create` | `conversation.item.added`<br>`conversation.item.done`<br>`response.created`<br>`response.output_item.added`<br>`response.content_part.added`<br>`response.output_text.delta`<br>`response.output_text.done`<br>`response.content_part.done`<br>`response.output_item.done`<br>`response.done`<br>`rate_limits.updated` |

## Audio inputs and outputs

One of the most powerful features of the Realtime API is voice-to-voice interaction with the model, without an intermediate text-to-speech or speech-to-text step. This enables lower latency for voice interfaces, and gives the model more data to work with around the tone and inflection of voice input.

### Voice options

Realtime sessions can be configured to use one of several built-in voices when producing audio output. You can set the `voice` on session creation (or on a `response.create`) to control how the model sounds. Current voice options are `alloy`, `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`, `marin`, and `cedar`. Once the model has emitted audio in a session, the `voice` cannot be modified for that session. For best quality, we recommend using `marin` or `cedar`.

### Handling audio with WebRTC

If you are connecting to the Realtime API using WebRTC, the Realtime API is acting as a [peer connection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) to your client. Audio output from the model is delivered to your client as a [remote media stream](https://platform.openai.com/docs/guides/realtime-conversations). Audio input to the model is collected using audio devices ([`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)), and media streams are added as tracks to the peer connection.

The example code from the [WebRTC connection guide](https://platform.openai.com/docs/guides/realtime-webrtc) shows a basic example of configuring both local and remote audio using browser APIs:

```js
// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
const audioEl = document.createElement("audio");
audioEl.autoplay = true;
pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);
```

The snippet above enables simple interaction with the Realtime API, but there is much more that can be done. For more examples of different kinds of user interfaces, check out the [WebRTC samples](https://github.com/webrtc/samples) repository. Live demos of these samples can also be [found here](https://webrtc.github.io/samples/).

Using [media captures and streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) in the browser enables you to do things like mute and unmute microphones, select which device to collect input from, and more.

### Client and server events for audio in WebRTC

By default, WebRTC clients do not need to send any client events to the Realtime API before sending audio inputs. Once a local audio track is added to the peer connection, your users can just start talking.

However, WebRTC clients still receive a number of server-sent lifecycle events as audio is moving back and forth between client and server over the peer connection. Examples include:

- When input is sent over the local media track, you will receive [`input_audio_buffer.speech_started`](https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/speech_started) events from the server.
- When local audio input stops, you will receive the [`input_audio_buffer.speech_stopped`](https://platform.openai.com/docs/api-reference/realtime-server-events/input_audio_buffer/speech_started) event.
- You will receive [delta events for the in-progress audio transcript](https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_audio_transcript/delta).
- You will receive a [`response.done`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/done) event when the model has transcribed and completed sending a response.

Manipulating WebRTC APIs for media streams may give you all the control you need. However, it may occasionally be necessary to use lower-level interfaces for audio input and output. Refer to the WebSockets section below for more information and a listing of events required for granular audio input handling.

### Handling audio with WebSockets

When sending and receiving audio over a WebSocket, you will have a bit more work to do in order to send media from the client, and receive media from the server. Below, you will find a table describing the flow of events during a WebSocket session that are necessary to send and receive audio over the WebSocket.

The events below are given in lifecycle order, though some events (like the delta events) may happen concurrently.

| Phase | Client events | Server events |
| --- | --- | --- |
| Session initialization | `session.update` | `session.created`<br>`session.updated` |
| User audio input | `conversation.item.create` (send whole audio message)<br>`input_audio_buffer.append` (stream audio in chunks)<br>`input_audio_buffer.commit` (used when VAD is disabled)<br>`response.create` (used when VAD is disabled) | `input_audio_buffer.speech_started`<br>`input_audio_buffer.speech_stopped`<br>`input_audio_buffer.committed` |
| Server audio output | `input_audio_buffer.clear` (used when VAD is disabled) | `conversation.item.added`<br>`conversation.item.done`<br>`response.created`<br>`response.output_item.created`<br>`response.content_part.added`<br>`response.output_audio.delta`<br>`response.output_audio.done`<br>`response.output_audio_transcript.delta`<br>`response.output_audio_transcript.done`<br>`response.output_text.delta`<br>`response.output_text.done`<br>`response.content_part.done`<br>`response.output_item.done`<br>`response.done`<br>`rate_limits.updated` |

### Streaming audio input to the server

To stream audio input to the server, you can use the [`input_audio_buffer.append`](https://platform.openai.com/docs/api-reference/realtime-client-events/input_audio_buffer/append) client event. This event requires you to send chunks of **Base64-encoded audio bytes** to the Realtime API over the socket. Each chunk cannot exceed 15 MB in size.

The format of the input chunks can be configured either for the entire session, or per response.

- Session: `session.input_audio_format` in [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update)
- Response: `response.input_audio_format` in [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create)

Append audio input bytes to the conversation:

```js
import fs from "fs";
import decodeAudio from "audio-decode";

// Converts Float32Array of audio data to PCM16 ArrayBuffer
function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return buffer;
}

// Converts a Float32Array to base64-encoded PCM16 data
function base64EncodeAudio(float32Array) {
  const arrayBuffer = floatTo16BitPCM(float32Array);
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000; // 32KB chunk size
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

// Fills the audio buffer with the contents of three files,
// then asks the model to generate a response.
const files = [
  "./path/to/sample1.wav",
  "./path/to/sample2.wav",
  "./path/to/sample3.wav",
];

for (const filename of files) {
  const audioFile = fs.readFileSync(filename);
  const audioBuffer = await decodeAudio(audioFile);
  const channelData = audioBuffer.getChannelData(0);
  const base64Chunk = base64EncodeAudio(channelData);
  ws.send(
    JSON.stringify({
      type: "input_audio_buffer.append",
      audio: base64Chunk,
    })
  );
}

ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
ws.send(JSON.stringify({ type: "response.create" }));
```

```python
import base64
import json
import struct
import soundfile as sf
from websocket import create_connection

# ... create websocket-client named ws ...

def float_to_16bit_pcm(float32_array):
    clipped = [max(-1.0, min(1.0, x)) for x in float32_array]
    pcm16 = b"".join(struct.pack("<h", int(x * 32767)) for x in clipped)
    return pcm16

def base64_encode_audio(float32_array):
    pcm_bytes = float_to_16bit_pcm(float32_array)
    encoded = base64.b64encode(pcm_bytes).decode("ascii")
    return encoded

files = [
    "./path/to/sample1.wav",
    "./path/to/sample2.wav",
    "./path/to/sample3.wav",
]

for filename in files:
    data, samplerate = sf.read(filename, dtype="float32")
    channel_data = data[:, 0] if data.ndim > 1 else data
    base64_chunk = base64_encode_audio(channel_data)

    # Send the client event
    event = {"type": "input_audio_buffer.append", "audio": base64_chunk}
    ws.send(json.dumps(event))
```

### Send full audio messages

It is also possible to create conversation messages that are full audio recordings. Use the [`conversation.item.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create) client event to create messages with `input_audio` content.

Create full audio input conversation items:

```js
const fullAudio = "<a base64-encoded string of audio bytes>";

const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_audio",
        audio: fullAudio,
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
fullAudio = "<a base64-encoded string of audio bytes>"

event = {
    "type": "conversation.item.create",
    "item": {
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_audio",
                "audio": fullAudio,
            }
        ],
    },
}

ws.send(json.dumps(event))
```

### Working with audio output from a WebSocket

**To play output audio back on a client device like a web browser, we recommend using WebRTC rather than WebSockets**. WebRTC will be more robust sending media to client devices over uncertain network conditions.

To work with audio output in server-to-server applications using a WebSocket, you will need to listen for [`response.output_audio.delta`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_audio/delta) events containing the base64-encoded chunks of audio data from the model. You will either need to buffer these chunks and write them out to a file, or immediately stream them to another source like [a phone call with Twilio](https://www.twilio.com/en-us/blog/twilio-openai-realtime-api-launch-integration).

Note that the [`response.output_audio.done`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_audio/done) and [`response.done`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/done) events will not contain audio data in them, only audio content transcriptions. To get the actual bytes, listen for the [`response.output_audio.delta`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/output_audio/delta) events.

The format of the output chunks can be configured either for the entire session, or per response.

- Session: `session.audio.output.format` in [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update)
- Response: `response.audio.output.format` in [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create)

Listen for `response.output_audio.delta` events:

```js
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (serverEvent.type === "response.audio.delta") {
    // Access base64-encoded audio chunks
    // console.log(serverEvent.delta);
  }
}

// Listen for server messages (WebSocket)
ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    if server_event.type == "response.audio.delta":
        # Access base64-encoded audio chunks:
        # print(server_event.delta)
        pass
```

## Image inputs

`gpt-realtime` and `gpt-realtime-mini` also support image input. You can attach an image as a content part in a user message, and the model can incorporate what is in the image when it responds.

Add an image to the conversation:

```js
const base64Image = "<a base64-encoded string of image bytes>";

const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_image",
        image_url: `data:image/{format};base64,${base64Image}`,
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

## Voice activity detection

By default, Realtime sessions have **voice activity detection (VAD)** enabled, which means the API will determine when the user has started or stopped speaking and respond automatically.

Read more about how to configure VAD in our [voice activity detection](https://platform.openai.com/docs/guides/realtime-vad) guide.

### Disable VAD

VAD can be disabled by setting `turn_detection` to `null` with the [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update) client event. This can be useful for interfaces where you would like to take granular control over audio input, like [push to talk](https://en.wikipedia.org/wiki/Push-to-talk) interfaces.

When VAD is disabled, the client will have to manually emit some additional client events to trigger audio responses:

- Manually send [`input_audio_buffer.commit`](https://platform.openai.com/docs/api-reference/realtime-client-events/input_audio_buffer/commit), which will create a new user input item for the conversation.
- Manually send [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) to trigger an audio response from the model.
- Send [`input_audio_buffer.clear`](https://platform.openai.com/docs/api-reference/realtime-client-events/input_audio_buffer/clear) before beginning a new user input.

### Keep VAD, but disable automatic responses

If you would like to keep VAD mode enabled, but you would like to retain the ability to manually decide when a response is generated, you can set `turn_detection.interrupt_response` and `turn_detection.create_response` to `false` with the [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update) client event. This retains all the behavior of VAD but does not automatically create new responses. Clients can trigger these manually with a [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) event.

This can be useful for moderation or input validation or RAG patterns, where you are comfortable trading a bit more latency in the interaction for control over inputs.

## Create responses outside the default conversation

By default, all responses generated during a session are added to the session's conversation state (the "default conversation"). However, you may want to generate model responses outside the context of the session's default conversation, or have multiple responses generated concurrently. You might also want to have more granular control over which conversation items are considered while the model generates a response (for example, only the last N number of turns).

Generating out-of-band responses which are not added to the default conversation state is possible by setting the `response.conversation` field to the string `none` when creating a response with the [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) client event.

When creating an out-of-band response, you will probably also want some way to identify which server-sent events pertain to this response. You can provide `metadata` for your model response that will help you identify which response is being generated for this client-sent event.

Create an out-of-band model response:

```js
const prompt = `
Analyze the conversation so far. If it is related to support, output
"support". If it is related to sales, output "sales".
`;

const event = {
  type: "response.create",
  response: {
    // Setting to "none" indicates the response is out of band
    // and will not be added to the default conversation
    conversation: "none",

    // Set metadata to help identify responses sent back from the model
    metadata: { topic: "classification" },

    // Set any other available response fields
    output_modalities: ["text"],
    instructions: prompt,
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
prompt = """
Analyze the conversation so far. If it is related to support, output
"support". If it is related to sales, output "sales".
"""

event = {
    "type": "response.create",
    "response": {
        # Setting to "none" indicates the response is out of band,
        # and will not be added to the default conversation
        "conversation": "none",
        # Set metadata to help identify responses sent back from the model
        "metadata": {"topic": "classification"},
        # Set any other available response fields
        "output_modalities": ["text"],
        "instructions": prompt,
    },
}

ws.send(json.dumps(event))
```

Now, when you listen for the [`response.done`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/done) server event, you can identify the result of your out-of-band response.

Listen for out-of-band model responses:

```js
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (
    serverEvent.type === "response.done" &&
    serverEvent.response.metadata?.topic === "classification"
  ) {
    // this server event pertained to our OOB model response
    console.log(serverEvent.response.output[0]);
  }
}

// Listen for server messages (WebRTC)
dataChannel.addEventListener("message", handleEvent);

// Listen for server messages (WebSocket)
// ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    topic = ""

    # See if metadata is present
    try:
        topic = server_event.response.metadata.topic
    except AttributeError:
        print("topic not set")

    if server_event.type == "response.done" and topic == "classification":
        # this server event pertained to our OOB model response
        print(server_event.response.output[0])
```

### Create a custom context for responses

You can also construct a custom context that the model will use to generate a response, outside the default/current conversation. This can be done using the `input` array on a [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) client event. You can use new inputs, or reference existing input items in the conversation by ID.

Listen for out-of-band model response with custom context:

```js
const event = {
  type: "response.create",
  response: {
    conversation: "none",
    metadata: { topic: "pizza" },
    output_modalities: ["text"],

    // Create a custom input array for this request with whatever context
    // is appropriate
    input: [
      // potentially include existing conversation items:
      {
        type: "item_reference",
        id: "some_conversation_item_id",
      },
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Is it okay to put pineapple on pizza?",
          },
        ],
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "conversation": "none",
        "metadata": {"topic": "pizza"},
        "output_modalities": ["text"],
        # Create a custom input array for this request with whatever
        # context is appropriate
        "input": [
            # potentially include existing conversation items:
            {"type": "item_reference", "id": "some_conversation_item_id"},
            # include new content as well
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Is it okay to put pineapple on pizza?",
                    }
                ],
            },
        ],
    },
}

ws.send(json.dumps(event))
```

### Create responses with no context

You can also insert responses into the default conversation, ignoring all other instructions and context. Do this by setting `input` to an empty array.

Insert no-context model responses into the default conversation:

```js
const prompt = `
Say exactly the following:
I'm a little teapot, short and stout!
This is my handle, this is my spout!
`;

const event = {
  type: "response.create",
  response: {
    // An empty input array removes existing context
    input: [],
    instructions: prompt,
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
prompt = """
Say exactly the following:
I'm a little teapot, short and stout!
This is my handle, this is my spout!
"""

event = {
    "type": "response.create",
    "response": {
        # An empty input array removes all prior context
        "input": [],
        "instructions": prompt,
    },
}

ws.send(json.dumps(event))
```

## Function calling

The Realtime models also support **function calling**, which enables you to execute custom code to extend the capabilities of the model. Here is how it works at a high level:

1. When [updating the session](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update) or [creating a response](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create), you can specify a list of available functions for the model to call.
2. If when processing input, the model determines it should make a function call, it will add items to the conversation representing arguments to a function call.
3. When the client detects conversation items that contain function call arguments, it will execute custom code using those arguments.
4. When the custom code has been executed, the client will create new conversation items that contain the output of the function call, and ask the model to respond.

### Configure callable functions

First, give the model a selection of functions it can call based on user input. Available functions can be configured either at the session level, or the individual response level.

- Session: `session.tools` property in [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update)
- Response: `response.tools` property in [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create)

Example `session.update` payload that configures a horoscope generation function, taking a single argument (the astrological sign for which the horoscope should be generated):

```json
{
  "type": "session.update",
  "session": {
    "tools": [
      {
        "type": "function",
        "name": "generate_horoscope",
        "description": "Give today's horoscope for an astrological sign.",
        "parameters": {
          "type": "object",
          "properties": {
            "sign": {
              "type": "string",
              "description": "The sign for the horoscope.",
              "enum": [
                "Aries",
                "Taurus",
                "Gemini",
                "Cancer",
                "Leo",
                "Virgo",
                "Libra",
                "Scorpio",
                "Sagittarius",
                "Capricorn",
                "Aquarius",
                "Pisces"
              ]
            }
          },
          "required": ["sign"]
        }
      }
    ],
    "tool_choice": "auto"
  }
}
```

### Detect when the model wants to call a function

Based on inputs to the model, the model may decide to call a function in order to generate the best response. Say our application adds the following conversation item with a [`conversation.item.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create) event and then creates a response:

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      {
        "type": "input_text",
        "text": "What is my horoscope? I am an aquarius."
      }
    ]
  }
}
```

Followed by a [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) client event to generate a response:

```json
{
  "type": "response.create"
}
```

Instead of immediately returning a text or audio response, the model will generate a response that contains the arguments that should be passed to a function in the developer's application. You can listen for realtime updates to function call arguments using the [`response.function_call_arguments.delta`](https://platform.openai.com/docs/api-reference/realtime-server-events/response/function_call_arguments/delta) server event, but `response.done` will also have the complete data we need to call our function.

Example `response.done` payload:

```json
{
  "type": "response.done",
  "event_id": "event_AeqLA8iR6FK20L4XZs2P6",
  "response": {
    "object": "realtime.response",
    "id": "resp_AeqL8XwMUOri9OhcQJIu9",
    "status": "completed",
    "status_details": null,
    "output": [
      {
        "object": "realtime.item",
        "id": "item_AeqL8gmRWDn9bIsUM2T35",
        "type": "function_call",
        "status": "completed",
        "name": "generate_horoscope",
        "call_id": "call_sHlR7iaFwQ2YQOqm",
        "arguments": "{\"sign\":\"Aquarius\"}"
      }
    ]
  }
}
```

In the JSON emitted by the server, we can detect that the model wants to call a custom function:

| Property | Function calling purpose |
| --- | --- |
| `response.output[0].type` | When set to `function_call`, indicates this response contains arguments for a named function call. |
| `response.output[0].name` | The name of the configured function to call, in this case `generate_horoscope`. |
| `response.output[0].arguments` | A JSON string containing arguments to the function. In this case, `{\"sign\":\"Aquarius\"}`. |
| `response.output[0].call_id` | A system-generated ID for this function call - you will need this ID to pass a function call result back to the model. |

Given this information, we can execute code in our application to generate the horoscope, and then provide that information back to the model so it can generate a response.

### Provide the results of a function call to the model

Upon receiving a response from the model with arguments to a function call, your application can execute code that satisfies the function call. This could be anything you want, like talking to external APIs or accessing databases.

Once you are ready to give the model the results of your custom code, create a new conversation item containing the result via the [`conversation.item.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create) client event.

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_sHlR7iaFwQ2YQOqm",
    "output": "{\"horoscope\": \"You will soon meet a new friend.\"}"
  }
}
```

- The conversation item type is `function_call_output`.
- `item.call_id` is the same ID you got back in the `response.done` event.
- `item.output` is a JSON string containing the results of your function call.

Once you have added the conversation item containing your function call results, emit the [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) event from the client. This will trigger a model response using the data from the function call.

```json
{
  "type": "response.create"
}
```

## Error handling

The [`error`](https://platform.openai.com/docs/api-reference/realtime-server-events/error) event is emitted by the server whenever an error condition is encountered on the server during the session. Occasionally, these errors can be traced to a client event that was emitted by your application.

Unlike HTTP requests and responses, where a response is implicitly tied to a request from the client, you need to use an `event_id` property on client events to know when one of them has triggered an error condition on the server. This technique is shown in the code below, where the client attempts to emit an unsupported event type.

```js
const event = {
  event_id: "my_awesome_event",
  type: "scooby.dooby.doo",
};

dataChannel.send(JSON.stringify(event));
```

This unsuccessful event sent from the client will emit an error event like the following:

```json
{
  "type": "invalid_request_error",
  "code": "invalid_value",
  "message": "Invalid value: 'scooby.dooby.doo' ...",
  "param": "type",
  "event_id": "my_awesome_event"
}
```

## Interruption and truncation

In many voice applications the user can interrupt the model while it is speaking. Realtime API handles interruptions when VAD is enabled, in that it detects user speech, cancels the ongoing response, and starts a new one. However in this scenario you will want the model to know where it was interrupted, so it can continue the conversation naturally (for example if the user says "what was that last thing?"). We call this **truncating** the model's last response, meaning removing the unplayed portion of the model's last response from the conversation.

In WebRTC and SIP connections the server manages a buffer of output audio, and thus knows how much audio has been played at a given moment. The server will automatically truncate unplayed audio when there is a user interruption.

With a WebSocket connection the client manages audio playback, and thus must stop playback and handle truncation. Here is how this procedure works:

1. The client monitors for new `input_audio_buffer.speech_started` events from the server, which indicate the user has started speaking. The server will automatically cancel any in-progress model response and a `response.cancelled` event will be emitted.
2. When the client detects this event, it should immediately stop playback of any audio currently being played from the model. It should note how much of the last audio response was played before the interruption.
3. The client should send a [`conversation.item.truncate`](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate) event to remove the unplayed portion of the model's last response from the conversation.

Example:

```json
{
  "type": "conversation.item.truncate",
  "item_id": "item_1234", // this is the item ID of the model's last response
  "content_index": 0,
  "audio_end_ms": 1500 // truncate audio after 1.5 seconds
}
```

What about truncating the transcript as well? The realtime model does not have enough information to precisely align transcript and audio, and thus `conversation.item.truncate` will cut the audio at a given place and remove the text transcript for the unplayed portion. This solves the problem of removing unplayed audio but does not provide a truncated transcript.

## Push-to-talk

Realtime API defaults to using voice activity detection (VAD), which means model responses will be triggered with audio input. You can also do a push-to-talk interaction by disabling VAD and using an application-level gate to control when audio input is sent to the model, for example holding the space-bar down to capture audio, then triggering a response when it is released. For some apps this works surprisingly well — it gives the users control over interactions, avoids VAD failures, and it feels snappy because you are not waiting for a VAD timeout.

Implementing push-to-talk looks a bit different on WebSockets and WebRTC. In a Realtime API WebSocket connection all events are sent in the same channel and with the same ordering, while a WebRTC connection has separate channels for audio and control events.

### WebSockets

To implement push-to-talk with a WebSocket connection, you will want the client to stop audio playback, handle interruptions, and kick off a new response. Here is a more detailed procedure:

1. Turn VAD off by setting `"turn_detection": null` in a [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update) event.
2. On push down, start recording audio on the client.
   1. If there is an in-progress response from the model, cancel it by sending a [`response.cancel`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/cancel) event.
   2. If there is ongoing output playback from the model, stop playback immediately and send a [`conversation.item.truncate`](https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/truncate) event to remove any unplayed audio from the conversation.
3. On up, send an [`input_audio_buffer.append`](https://platform.openai.com/docs/api-reference/realtime-client-events/input_audio_buffer/append) message with the audio to place new audio into the input buffer.
4. Send an [`input_audio_buffer.commit`](https://platform.openai.com/docs/api-reference/realtime-client-events/input_audio_buffer/commit) event, which will commit the audio written to the input buffer and kick off input transcription (if enabled).
5. Then trigger a response with a [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) event.

### WebRTC and SIP

Implementing push-to-talk with WebRTC is similar but the input audio buffer must be explicitly cleared. Here is a procedure:

1. Turn VAD off by setting `"turn_detection": null` in a [`session.update`](https://platform.openai.com/docs/api-reference/realtime-client-events/session/update) event.
2. On push down, send an [`input_audio_buffer.clear`](https://platform.openai.com/docs/api-reference/realtime-client-events/input_audio_buffer/clear) event to clear any previous audio input.
   1. If there is an in-progress response from the model, cancel it by sending a [`response.cancel`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/cancel) event.
   2. If there is ongoing output playback from the model, send an [`output_audio_buffer.clear`](https://platform.openai.com/docs/api-reference/realtime-client-events/output_audio_buffer/clear) event to clear out the unplayed audio, this truncates the conversation as well.
3. On up, send an [`input_audio_buffer.commit`](https://platform.openai.com/docs/api-reference/realtime-client-events/input_audio_buffer/commit) event, which will commit the audio written to the input buffer and kick off input transcription (if enabled).
4. Then trigger a response with a [`response.create`](https://platform.openai.com/docs/api-reference/realtime-client-events/response/create) event.

# Video generation with Sora

Create, iterate on, and manage videos with the Sora API.

## Overview

Sora is OpenAI's newest frontier in generative media: a state-of-the-art video model that creates richly detailed clips with audio from natural language or images. Built on years of research into multimodal diffusion and trained on diverse visual data, Sora brings a deep understanding of 3D space, motion, and scene continuity to text-to-video generation.

The [Video API](https://platform.openai.com/docs/api-reference/videos) (preview) exposes these capabilities to developers for the first time, enabling programmatic creation, extension, and remixing of videos. It provides five endpoints, each with distinct capabilities:

- **Create video**: Start a new render job from a prompt, with optional reference inputs or a remix ID.
- **Get video status**: Retrieve the current state of a render job and monitor its progress.
- **Download video**: Fetch the finished MP4 once the job is completed.
- **List videos**: Enumerate your videos with pagination for history, dashboards, or housekeeping.
- **Delete videos**: Remove an individual video ID from OpenAI's storage.

## Models

The second-generation Sora model comes in two variants, each tailored for different use cases.

### Sora 2 (`sora-2`)

Designed for **speed and flexibility**. Ideal for experimentation when you need quick feedback rather than perfect fidelity. It produces good quality results fast, making it well suited for rapid iteration, concepting, and rough cuts.

### Sora 2 Pro (`sora-2-pro`)

Optimized for **production-quality output**. It takes longer to render and costs more, but produces more polished, stable results. Best for high-resolution cinematic footage, marketing assets, and situations where visual precision is critical.

## How to use Sora in Bickford

Sora is best treated as a **long-running render capability** that plugs into Bickford's existing event capture and decision flow. Use it to generate video artifacts (demos, marketing clips, UX walkthroughs, or simulation outputs) while preserving observability and governance.

### Recommended integration pattern

1. **Create a render request** with `POST /videos` and capture the returned `video_id`.
2. **Record a ledger event** for traceability (request intent, prompt, model, size, seconds).
3. **Use webhooks** to receive `video.completed` or `video.failed` events.
4. **Record completion events** and store the final asset in your own storage.
5. **Attach outputs** to downstream workflows (distribution, QA review, or remix pipelines).

### Canon-aligned decisioning

Use the Bickford decision layer to guide model choice and cadence:

- **`sora-2`** for rapid iteration and exploratory drafts.
- **`sora-2-pro`** for polished assets that require stability and quality.

Treat remixing as a **single-change iteration primitive** so each step preserves continuity and reduces risk of regression.

### Suggested event fields for the ledger

Capture these fields in your event payload to align with existing observability:

- `video_id`, `status`, `progress`, `model`, `seconds`, `size`
- `prompt`, `remix_video_id`, `input_reference` metadata
- `storage_uri` (where the MP4 and derivatives live)
- `webhook_event_id` for reconciliation and idempotency

### Bickford helper module

`@bickford/execution-convergence` includes Sora helpers for job creation and ledger capture:

```ts
import {
  createSoraVideoJob,
  createSoraVideoJobAndPoll,
  downloadSoraContent,
  listSoraVideos,
  deleteSoraVideo,
  recordSoraVideoEvent,
} from "@bickford/execution-convergence";

const job = await createSoraVideoJob({
  model: "sora-2",
  prompt: "Wide tracking shot of a teal coupe driving through a desert highway.",
  size: "1280x720",
  seconds: "8",
});

recordSoraVideoEvent("media-renders", {
  videoId: job.id,
  status: job.status,
  model: job.model,
  seconds: job.seconds,
  size: job.size,
});

const videoBytes = await downloadSoraContent(job.id);
console.log("Downloaded bytes:", videoBytes.byteLength);

const completed = await createSoraVideoJobAndPoll({
  model: "sora-2",
  prompt: "Sunlit forest with floating lanterns, camera drifting upward.",
  seconds: "6",
});
console.log("Completed status:", completed.status);

const listing = await listSoraVideos({ limit: 10, order: "desc" });
console.log("Latest jobs:", listing.data.length);

await deleteSoraVideo("video_to_delete");
```

## Generate a video

Generating a video is **asynchronous**:

1. Call `POST /videos` to start a job. The response includes a job `id` and initial `status`.
2. Poll `GET /videos/{video_id}` until the status is `completed`, or use webhooks to be notified automatically.
3. Download the MP4 from `GET /videos/{video_id}/content`.

### Start a render job

Use a text prompt plus required parameters. The prompt defines the creative direction; parameters like `size` and `seconds` control resolution and duration.

```ts
import OpenAI from 'openai';

const openai = new OpenAI();

const video = await openai.videos.create({
  model: 'sora-2',
  prompt: "A video of the words 'Thank you' in sparkling letters",
});

console.log('Video generation started: ', video);
```

```py
from openai import OpenAI

openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)
```

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="Wide tracking shot of a teal coupe driving through a desert highway, heat ripples visible, hard sun overhead." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8"
```

Example response:

```json
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "queued",
  "model": "sora-2-pro",
  "progress": 0,
  "seconds": "8",
  "size": "1280x720"
}
```

### Guardrails and restrictions

The API enforces several content restrictions:

- Only content suitable for audiences under 18 (a setting to bypass this restriction will be available in the future).
- Copyrighted characters and copyrighted music will be rejected.
- Real people (including public figures) cannot be generated.
- Input images with faces of humans are currently rejected.

Ensure prompts, reference images, and transcripts respect these rules to avoid failed generations.

### Effective prompting

For best results, describe **shot type, subject, action, setting, and lighting**. Examples:

- *"Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward."*
- *"Close-up of a steaming coffee cup on a wooden table, morning light through blinds, soft depth of field."*

This level of specificity helps the model produce consistent results without inventing unwanted details. For more advanced techniques, see the dedicated Sora 2 [prompting guide](https://cookbook.openai.com/examples/sora/sora2_prompting_guide).

## Monitor progress

Video generation takes time. Depending on model, API load, and resolution, a single render may take several minutes. You can poll for status updates or use webhooks for notifications.

### Poll the status endpoint

```ts
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const video = await openai.videos.createAndPoll({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
  });

  if (video.status === 'completed') {
    console.log('Video successfully completed: ', video);
  } else {
    console.log('Video creation failed. Status: ', video.status);
  }
}

main();
```

```py
import asyncio

from openai import AsyncOpenAI

client = AsyncOpenAI()

async def main() -> None:
    video = await client.videos.create_and_poll(
        model="sora-2",
        prompt="A video of a cat on a motorcycle",
    )

    if video.status == "completed":
        print("Video successfully completed: ", video)
    else:
        print("Video creation failed. Status: ", video.status)

asyncio.run(main())
```

Example response:

```json
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "in_progress",
  "model": "sora-2-pro",
  "progress": 33,
  "seconds": "8",
  "size": "1280x720"
}
```

### Use webhooks for notifications

Register a [webhook](https://platform.openai.com/docs/guides/webhooks) to be notified when a job completes or fails. Configure webhooks in your [webhook settings page](https://platform.openai.com/settings/project/webhooks). The API emits `video.completed` and `video.failed` events.

Example payload:

```json
{
  "id": "evt_abc123",
  "object": "event",
  "created_at": 1758941485,
  "type": "video.completed",
  "data": {
    "id": "video_abc123"
  }
}
```

## Retrieve results

### Download the MP4

Once the job reaches `completed`, fetch the MP4 with `GET /videos/{video_id}/content`. The endpoint streams binary video data and returns standard content headers, so you can save the file directly to disk or pipe it to cloud storage.

```ts
import OpenAI from 'openai';

const openai = new OpenAI();

let video = await openai.videos.create({
  model: 'sora-2',
  prompt: "A video of the words 'Thank you' in sparkling letters",
});

console.log('Video generation started: ', video);
let progress = video.progress ?? 0;

while (video.status === 'in_progress' || video.status === 'queued') {
  video = await openai.videos.retrieve(video.id);
  progress = video.progress ?? 0;

  const barLength = 30;
  const filledLength = Math.floor((progress / 100) * barLength);
  const bar = '='.repeat(filledLength) + '-'.repeat(barLength - filledLength);
  const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

  process.stdout.write(`${statusText}: [${bar}] ${progress.toFixed(1)}%`);

  await new Promise((resolve) => setTimeout(resolve, 2000));
}

process.stdout.write('\n');

if (video.status === 'failed') {
  console.error('Video generation failed');
  process.exit(1);
}

console.log('Video generation completed: ', video);
console.log('Downloading video content...');

const content = await openai.videos.downloadContent(video.id);
const body = content.arrayBuffer();
const buffer = Buffer.from(await body);

require('fs').writeFileSync('video.mp4', buffer);

console.log('Wrote video.mp4');
```

```bash
curl -L "https://api.openai.com/v1/videos/video_abc123/content" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output video.mp4
```

```py
from openai import OpenAI
import sys
import time

openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)

progress = getattr(video, "progress", 0)
bar_length = 30

while video.status in ("in_progress", "queued"):
    video = openai.videos.retrieve(video.id)
    progress = getattr(video, "progress", 0)

    filled_length = int((progress / 100) * bar_length)
    bar = "=" * filled_length + "-" * (bar_length - filled_length)
    status_text = "Queued" if video.status == "queued" else "Processing"

    sys.stdout.write(f"\n{status_text}: [{bar}] {progress:.1f}%")
    sys.stdout.flush()
    time.sleep(2)

sys.stdout.write("\n")

if video.status == "failed":
    message = getattr(
        getattr(video, "error", None), "message", "Video generation failed"
    )
    print(message)
    raise SystemExit(1)

print("Video generation completed:", video)
print("Downloading video content...")

content = openai.videos.download_content(video.id, variant="video")
content.write_to_file("video.mp4")

print("Wrote video.mp4")
```

Download URLs are valid for up to one hour after generation. If you need long-term storage, copy the file to your own storage promptly.

### Download supporting assets

Download a **thumbnail** or **spritesheet** for previews, scrubbers, or catalog displays via the `variant` query parameter.

```bash
# Download a thumbnail
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=thumbnail" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output thumbnail.webp

# Download a spritesheet
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=spritesheet" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output spritesheet.jpg
```

## Use image references

You can guide a generation with an input image, which acts as **the first frame of your video**. Include an image file as the `input_reference` parameter in your `POST /videos` request. The image must match the target video's resolution (`size`).

Supported file formats: `image/jpeg`, `image/png`, and `image/webp`.

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="She turns around and smiles, then slowly walks out of the frame." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8" \
  -F input_reference="@sample_720p.jpeg;type=image/jpeg"
```

## Remix completed videos

Remix lets you take an existing video and make targeted adjustments without regenerating everything from scratch. Provide the `remix_video_id` of a completed job along with a new prompt describing the change. The system reuses the original's structure, continuity, and composition while applying the modification.

This works best when you make a **single, well-defined change** because smaller, focused edits preserve more of the original fidelity and reduce the risk of artifacts.

```bash
curl -X POST "https://api.openai.com/v1/videos/<previous_video_id>/remix" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Shift the color palette to teal, sand, and rust, with a warm backlight."
  }'
```

## Maintain your library

Use `GET /videos` to enumerate videos. The endpoint supports optional query parameters for pagination and sorting.

```bash
# default
curl "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```

```bash
# with params
curl "https://api.openai.com/v1/videos?limit=20&after=video_123&order=asc" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```

Use `DELETE /videos/{video_id}` to remove videos you no longer need from OpenAI's storage.

```bash
curl -X DELETE "https://api.openai.com/v1/videos/[REPLACE_WITH_YOUR_VIDEO_ID]" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```

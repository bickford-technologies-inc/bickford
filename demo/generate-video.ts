#!/usr/bin/env tsx
/**
 * Automated Demo Video Generator
 * 
 * Creates an MP4 video of Demo A with:
 * - Terminal output captured frame-by-frame
 * - Narration text overlays from DEMO_A_SCREENS.md
 * - Professional timing and transitions
 * 
 * Requirements: ffmpeg
 * Usage: npm run demo:video
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Screen timings (seconds)
const SCREEN_DURATIONS = [30, 45, 60, 60, 90, 60, 30]; // Total: 375s = 6.25 minutes

// Video settings
const FPS = 2; // 2 frames per second (slow for readability)
const VIDEO_SIZE = '1920x1080';
const FONT = 'DejaVuSansMono';
const FONT_SIZE = 16;

// Narration text for each screen (from DEMO_A_SCREENS.md)
const NARRATIONS = [
  "Every AI system faces the same problem: decisions decay. Re-decisions happen without coordination. Safety gates cause unexpected churn. Time-to-value expands unpredictably.",
  
  "Here's our input boundary. Only metadata: timestamps, states, document hashes. No prompts, no weights, no user content. This is what makes shadow mode possible.",
  
  "When a DECISION_DECLARED event enters the ledger, it becomes a canonical constraint. This one says: No deploy before SAFETY_APPROVED. This constraint is now mechanically enforced.",
  
  "OPTR enumerates all candidate paths. Path A: ship now. Path B: wait for safety, then ship. OPTR will score each path against expected time-to-value, cost, and risk.",
  
  "This is the holy shit moment. Path A is inadmissible. The invariant SAFETY_GATE_REQUIRED blocks it because we're missing the SAFETY_APPROVED event. Full audit trail with evidence links. No human intervention required.",
  
  "Timeline resolves: safety approved at 14:14, deploy executed at 14:15. Final metrics: DCR of 0.92, one rework loop, sixteen minutes time-to-value, one inadmissible attempt prevented. Bickford didn't decide—it made the structure binding and auditable.",
  
  "What a real pilot looks like: Shadow mode first, metadata-only connectors, produce DCR and time-to-value metrics with audit packs. Four to eight weeks to validate. Zero disruption to existing workflows."
];

async function checkDependencies() {
  // ffmpeg
  try {
    execSync('which ffmpeg', { stdio: 'ignore' });
  } catch {
    console.error('❌ ffmpeg not found. Installing...');
    execSync('sudo apt-get update && sudo apt-get install -y ffmpeg', { stdio: 'inherit' });
  }

  // ImageMagick (convert) is used to render text frames to PNGs
  try {
    execSync('which convert', { stdio: 'ignore' });
  } catch {
    console.error('❌ ImageMagick (convert) not found. Installing...');
    execSync('sudo apt-get update && sudo apt-get install -y imagemagick', { stdio: 'inherit' });
  }
}

async function captureTerminalOutput(): Promise<string> {
  console.log('📹 Capturing terminal output...');
  
  const output = execSync('npm run demo:a 2>&1', {
    cwd: process.cwd(),
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  });
  
  return output;
}

function parseScreens(output: string): string[] {
  const screens: string[] = [];
  const screenRegex = /SCREEN \d+:.*?\n\n(.*?)(?=SCREEN \d+:|DEMO SUMMARY|$)/gs;
  
  let match;
  while ((match = screenRegex.exec(output)) !== null) {
    screens.push(match[0]);
  }
  
  // If parsing fails, split by screen markers
  if (screens.length === 0) {
    const parts = output.split(/SCREEN \d+:/);
    screens.push(...parts.slice(1));
  }
  
  return screens;
}

function renderFrameTxtToPng(framePath: string, imgPath: string) {
  // Render the text file into a PNG (monospace), with predictable padding.
  // NOTE: ImageMagick `label:@file` will wrap long lines.
  execSync(
    `convert -size ${VIDEO_SIZE} -background black -fill white -font ${FONT} -pointsize ${FONT_SIZE} ` +
      `-gravity NorthWest -interline-spacing 4 label:@${framePath} ${imgPath}`,
    { stdio: 'ignore' }
  );
}

async function generateVideoFrames(screens: string[], narrations: string[]) {
  console.log('🎬 Generating video frames...');

  const framesDir = join(process.cwd(), 'demo', 'frames');
  mkdirSync(framesDir, { recursive: true });

  let frameNumber = 0;

  const numScreens = Math.min(
    Math.max(screens.length, 1),
    Math.max(SCREEN_DURATIONS.length, narrations.length)
  );

  for (let i = 0; i < numScreens; i++) {
    const screen = screens[i] ?? '';
    const narration = narrations[i] ?? '';
    const duration = SCREEN_DURATIONS[i] ?? 30;
    const numFrames = Math.ceil(duration * FPS);

    console.log(`  Screen ${i + 1}: ${numFrames} frames (${duration}s)`);

    for (let f = 0; f < numFrames; f++) {
      const base = `frame_${String(frameNumber).padStart(5, '0')}`;
      const framePath = join(framesDir, `${base}.txt`);
      const imgPath = join(framesDir, `${base}.png`);

      const narrationBox = wrapText(narration, 70);

      const frameContent = `
╔════════════════════════════════════════════════════════════════════════╗
║ BICKFORD DEMO A - SCREEN ${i + 1}/${numScreens}${' '.repeat(Math.max(0, 44 - String(i + 1).length - String(numScreens).length))}║
╚════════════════════════════════════════════════════════════════════════╝

${screen}

╔════════════════════════════════════════════════════════════════════════╗
║ NARRATION                                                              ║
╠════════════════════════════════════════════════════════════════════════╣
${narrationBox}
╚════════════════════════════════════════════════════════════════════════╝
`;

      writeFileSync(framePath, frameContent);
      renderFrameTxtToPng(framePath, imgPath);
      frameNumber++;
    }
  }

  console.log(`✅ Generated ${frameNumber} frames`);
  return frameNumber;
}

function wrapText(text: string, width: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines.map(line => `║ ${line.padEnd(width)} ║`).join('\n');
}

async function convertFramesToVideo(totalFrames: number) {
  console.log('🎥 Converting frames to video...');

  const framesDir = join(process.cwd(), 'demo', 'frames');
  const outputPath = join(process.cwd(), 'demo', 'DEMO_A.mp4');

  console.log('  Creating video from PNG frames...');

  // frame_00000.png ... frame_NNNNN.png
  // Use glob pattern via ffmpeg's sequence input.
  execSync(
    `ffmpeg -y -framerate ${FPS} -i ${join(framesDir, 'frame_%05d.png')} ` +
      `-c:v libx264 -pix_fmt yuv420p -vf "scale=${VIDEO_SIZE}:force_original_aspect_ratio=decrease,pad=${VIDEO_SIZE}:(ow-iw)/2:(oh-ih)/2" ` +
      `${outputPath}`,
    { stdio: 'inherit' }
  );

  console.log(`✅ Video saved to: ${outputPath}`);
}

async function main() {
  console.log('🎬 Bickford Demo A - Automated Video Generator\n');

  try {
    await checkDependencies();

    const output = await captureTerminalOutput();

    const screens = parseScreens(output);
    console.log(`✅ Parsed ${screens.length} screens\n`);

    const totalFrames = await generateVideoFrames(screens, NARRATIONS);
    await convertFramesToVideo(totalFrames);

    console.log('\n✅ Demo video generation complete!');
    console.log('📁 Output: demo/DEMO_A.mp4');
  } catch (error) {
    console.error('❌ Error generating video:', error);
    console.log('\n💡 Fallback: Record manually using screen recording software');
    console.log('   Run: npm run demo:a');
    console.log('   Narration: demo/DEMO_A_SCREENS.md');
    process.exit(1);
  }
}

main();

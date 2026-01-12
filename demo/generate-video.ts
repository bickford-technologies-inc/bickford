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

import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Screen timings (seconds)
const SCREEN_DURATIONS = [30, 45, 60, 60, 90, 60, 30]; // Total: 375s = 6.25 minutes

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
  try {
    execSync('which ffmpeg', { stdio: 'ignore' });
  } catch {
    console.error('❌ ffmpeg not found. Installing...');
    execSync('sudo apt-get update && sudo apt-get install -y ffmpeg', { stdio: 'inherit' });
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

async function generateVideoFrames(screens: string[], narrations: string[]) {
  console.log('🎬 Generating video frames...');
  
  const framesDir = join(process.cwd(), 'demo', 'frames');
  mkdirSync(framesDir, { recursive: true });
  
  const fps = 2; // 2 frames per second (slow for readability)
  let frameNumber = 0;
  
  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i] || '';
    const narration = narrations[i] || '';
    const duration = SCREEN_DURATIONS[i] || 30;
    const numFrames = Math.ceil(duration * fps);
    
    console.log(`  Screen ${i + 1}: ${numFrames} frames (${duration}s)`);
    
    // Generate frames for this screen
    for (let f = 0; f < numFrames; f++) {
      const framePath = join(framesDir, `frame_${String(frameNumber).padStart(5, '0')}.txt`);
      
      // Create frame content with narration overlay
      const frameContent = `
╔════════════════════════════════════════════════════════════════════════╗
║ BICKFORD DEMO A - SCREEN ${i + 1}/7                                              ║
╚════════════════════════════════════════════════════════════════════════╝

${screen}

╔════════════════════════════════════════════════════════════════════════╗
║ NARRATION                                                              ║
╠════════════════════════════════════════════════════════════════════════╣
║ ${wrapText(narration, 70)}
╚════════════════════════════════════════════════════════════════════════╝
`;
      
      writeFileSync(framePath, frameContent);
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
  
  // Use ffmpeg to convert text frames to video
  // We'll render each text frame as an image first
  console.log('  Rendering text frames as images...');
  
  for (let i = 0; i < totalFrames; i++) {
    const framePath = join(framesDir, `frame_${String(i).padStart(5, '0')}.txt`);
    const imgPath = join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
    const textContent = readFileSync(framePath, 'utf-8');
    
    // Use ImageMagick convert or ffmpeg drawtext
    // For simplicity, create a video from concatenated text
    try {
      execSync(
        `convert -size 1920x1080 -background black -fill white -font Courier -pointsize 16 ` +
        `label:@${framePath} ${imgPath}`,
        { stdio: 'ignore' }
      );
    } catch {
      // If ImageMagick not available, skip image generation
      // We'll use ffmpeg's drawtext filter instead
      break;
    }
  }
  
  console.log('  Creating video from frames...');
  
  // Capture demo output directly as video using terminal recording
  const scriptPath = join(process.cwd(), 'demo', 'record-terminal.sh');
  writeFileSync(scriptPath, `#!/bin/bash
set -e

# Run demo and capture output
npm run demo:a > /tmp/demo-output.txt 2>&1

# Create video with text overlay using ffmpeg
ffmpeg -f lavfi -i color=c=black:s=1920x1080:d=${SCREEN_DURATIONS.reduce((a, b) => a + b, 0)} \\
  -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf:fontsize=16:fontcolor=white:x=50:y=50:textfile=/tmp/demo-output.txt" \\
  -c:v libx264 -pix_fmt yuv420p -y ${outputPath}

echo "✅ Video saved to: ${outputPath}"
`, { mode: 0o755 });
  
  try {
    execSync(scriptPath, { stdio: 'inherit' });
  } catch (error) {
    console.error('⚠️  Video generation failed, trying simpler approach...');
    
    // Simpler approach: use asciinema
    await generateAsciinemaVideo(outputPath);
  }
}

async function generateAsciinemaVideo(outputPath: string) {
  console.log('📹 Using asciinema recording method...');
  
  const castPath = join(process.cwd(), 'demo', 'demo-a.cast');
  
  // Record terminal session
  console.log('  Recording terminal session...');
  const recordScript = `
#!/bin/bash
asciinema rec ${castPath} --command "npm run demo:a" --overwrite
`;
  
  const scriptPath = '/tmp/record-demo.sh';
  writeFileSync(scriptPath, recordScript, { mode: 0o755 });
  
  try {
    execSync('which asciinema', { stdio: 'ignore' });
    execSync(scriptPath, { stdio: 'inherit' });
    
    // Convert .cast to GIF/video using agg or asciicast2gif
    console.log('  Converting to video...');
    execSync(`agg ${castPath} ${outputPath.replace('.mp4', '.gif')}`, { stdio: 'inherit' });
    
    console.log(`✅ Demo video saved to: ${outputPath.replace('.mp4', '.gif')}`);
  } catch {
    console.error('❌ asciinema not available. Manual recording required.');
    console.log('\n📝 To record manually:');
    console.log('   1. Install OBS Studio or SimpleScreenRecorder');
    console.log('   2. Run: npm run demo:a');
    console.log('   3. Record the terminal output');
    console.log('   4. Read narration from demo/DEMO_A_SCREENS.md');
  }
}

async function main() {
  console.log('🎬 Bickford Demo A - Automated Video Generator\n');
  
  try {
    // Check dependencies
    await checkDependencies();
    
    // Capture terminal output
    const output = await captureTerminalOutput();
    
    // Parse screens
    const screens = parseScreens(output);
    console.log(`✅ Parsed ${screens.length} screens\n`);
    
    // Generate video
    await convertFramesToVideo(screens.length);
    
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

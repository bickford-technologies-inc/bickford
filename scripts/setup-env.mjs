#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

async function setup() {
  console.log('🔧 Bickford Environment Setup');
  console.log('==============================\n');

  const envFile = 'packages/bickford/.env';
  const envExample = 'packages/bickford/.env.example';

  // Ensure .env.example exists
  if (!existsSync(envExample)) {
    console.error(`❌ ${envExample} not found!`);
    process.exit(1);
  }

  // Check if .env already exists
  if (existsSync(envFile)) {
    console.log(`⚠️  ${envFile} already exists`);
    const overwrite = await question('Overwrite? (y/N): ');
    if (!overwrite.match(/^[Yy]$/)) {
      console.log('⏭️  Skipping .env creation\n');
    } else {
      const template = readFileSync(envExample, 'utf8');
      writeFileSync(envFile, template);
      console.log(`✅ Created ${envFile} from template\n`);
    }
  } else {
    const template = readFileSync(envExample, 'utf8');
    writeFileSync(envFile, template);
    console.log(`✅ Created ${envFile} from template\n`);
  }

  // Check for OPENAI_API_KEY
  const existingKey = process.env.OPENAI_API_KEY;
  
  if (!existingKey) {
    console.log('⚠️  OPENAI_API_KEY not found in environment');
    console.log('   Get your key from: https://platform.openai.com/api-keys\n');
    
    const apiKey = await question('Enter your OpenAI API key (or press Enter to skip): ');
    
    if (apiKey.trim()) {
      let envContent = readFileSync(envFile, 'utf8');
      
      if (envContent.includes('OPENAI_API_KEY=')) {
        envContent = envContent.replace(/^OPENAI_API_KEY=.*/m, `OPENAI_API_KEY=${apiKey.trim()}`);
      } else {
        envContent += `\nOPENAI_API_KEY=${apiKey.trim()}\n`;
      }
      
      writeFileSync(envFile, envContent);
      console.log(`✅ Saved OPENAI_API_KEY to ${envFile}\n`);
    } else {
      console.log('⏭️  Skipping OpenAI setup (demo mode will be used)\n');
    }
  } else {
    console.log('✅ OPENAI_API_KEY found in environment');
    let envContent = readFileSync(envFile, 'utf8');
    
    if (envContent.match(/^OPENAI_API_KEY=/m)) {
      envContent = envContent.replace(/^OPENAI_API_KEY=.*/m, `OPENAI_API_KEY=${existingKey}`);
      writeFileSync(envFile, envContent);
      console.log(`✅ Auto-configured OPENAI_API_KEY in ${envFile}\n`);
    }
  }

  console.log('✅ Environment setup complete!\n');
  console.log('Next steps:');
  console.log('  1. npm install');
  console.log('  2. npm run dev:api    # Start backend');
  console.log('  3. npm run dev:web    # Start frontend\n');
  
  rl.close();
}

setup().catch(console.error);

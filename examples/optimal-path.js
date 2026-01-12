/**
 * Example: Optimal Path Scoring
 * Demonstrates evaluating multiple paths and getting recommendations
 */
import { DecisionContinuityRuntime } from '../src/index.js';

async function optimalPathExample() {
  console.log('=== Optimal Path Scoring Example ===\n');

  // Initialize with custom weights
  const dcr = new DecisionContinuityRuntime({
    scoringWeights: {
      cost: 0.25,
      time: 0.25,
      risk: 0.3,
      quality: 0.2
    }
  });
  await dcr.initialize();

  // Define deployment strategies
  const strategies = [
    {
      id: 'blue-green',
      name: 'Blue-Green Deployment',
      description: 'Zero-downtime deployment with instant rollback',
      metrics: {
        cost: 70,
        time: 30,
        risk: 15,
        quality: 95
      }
    },
    {
      id: 'canary',
      name: 'Canary Deployment',
      description: 'Gradual rollout to subset of users',
      metrics: {
        cost: 50,
        time: 60,
        risk: 20,
        quality: 90
      }
    },
    {
      id: 'rolling',
      name: 'Rolling Deployment',
      description: 'Sequential update of instances',
      metrics: {
        cost: 30,
        time: 80,
        risk: 40,
        quality: 75
      }
    }
  ];

  console.log('Evaluating deployment strategies...\n');
  
  const recommendation = dcr.evaluatePaths(strategies);

  console.log('RECOMMENDED STRATEGY:');
  console.log('Name:', recommendation.recommended.path.name);
  console.log('Description:', recommendation.recommended.path.description);
  console.log('Total Score:', recommendation.recommended.totalScore.toFixed(3));
  console.log('\nScore Breakdown:');
  Object.entries(recommendation.recommended.scores).forEach(([metric, score]) => {
    console.log(`  ${metric}: ${score.toFixed(3)}`);
  });

  console.log('\nConfidence:', (recommendation.confidence * 100).toFixed(1) + '%');

  console.log('\nALTERNATIVE STRATEGIES:');
  recommendation.alternatives.forEach((alt, index) => {
    console.log(`${index + 1}. ${alt.path.name} (Score: ${alt.totalScore.toFixed(3)})`);
  });

  // Record the decision
  console.log('\nRecording deployment decision...');
  const decision = await dcr.recordDecision({
    type: 'deployment',
    strategy: recommendation.recommended.path.id,
    reason: 'Optimal path based on OPTR analysis',
    confidence: recommendation.confidence
  });
  console.log('Decision ID:', decision.id);
}

optimalPathExample().catch(console.error);

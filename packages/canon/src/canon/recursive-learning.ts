/**
 * Recursive Learning System
 * TIMESTAMP: 2026-01-19T23:13:00Z
 *
 * Self-coaching runtime intelligence that learns from execution patterns
 * and continuously improves decision-making through feedback loops.
 */

export interface LearningSignal {
  id: string;
  ts: string;
  category: "SUCCESS" | "FAILURE" | "OPTIMIZATION" | "PATTERN";
  action: string;
  features: Record<string, number>;
  outcome: {
    actual: number; // Actual TTV or metric
    predicted?: number; // Predicted value
    error?: number; // Prediction error
  };
  feedback?: {
    explicit?: boolean; // User provided feedback
    implicit?: boolean; // Derived from behavior
    score?: number; // Quality score
  };
}

export interface LearningModel {
  id: string;
  version: number;
  ts: string;
  weights: Record<string, number>;
  bias: number;
  performance: {
    samples: number;
    avgError: number;
    confidence: number;
  };
}

export interface OptimizationInsight {
  pattern: string;
  frequency: number;
  avgImprovement: number;
  confidence: number;
  recommendation: string;
}

/**
 * Recursive learning system that improves OPTR scoring over time
 */
export class RecursiveLearningSystem {
  private signals: LearningSignal[] = [];
  private model: LearningModel;
  private readonly MAX_SIGNALS = 10000;
  private readonly LEARNING_RATE = 0.01;

  constructor(initialWeights?: Record<string, number>) {
    this.model = {
      id: `model_${Date.now()}`,
      version: 1,
      ts: new Date().toISOString(),
      weights: initialWeights || {},
      bias: 0,
      performance: {
        samples: 0,
        avgError: 0,
        confidence: 0,
      },
    };
  }

  /**
   * Record a learning signal from execution
   */
  recordSignal(signal: LearningSignal): void {
    this.signals.push(signal);

    // Self-prune to maintain memory bounds
    if (this.signals.length > this.MAX_SIGNALS) {
      this.signals = this.signals.slice(-this.MAX_SIGNALS);
    }

    // Trigger learning if we have enough signals
    if (this.signals.length % 100 === 0) {
      this.learn();
    }
  }

  /**
   * Learn from accumulated signals using online gradient descent
   */
  learn(): void {
    const recentSignals = this.signals.slice(-1000); // Use last 1000
    if (recentSignals.length < 10) return;

    let totalError = 0;
    let updateCount = 0;

    for (const signal of recentSignals) {
      if (!signal.outcome.predicted || !signal.outcome.error) continue;

      const error = signal.outcome.error;
      totalError += Math.abs(error);
      updateCount++;

      // Update weights using gradient descent
      for (const [feature, value] of Object.entries(signal.features)) {
        const currentWeight = this.model.weights[feature] || 0;
        const gradient = error * value;
        this.model.weights[feature] = currentWeight - this.LEARNING_RATE * gradient;
      }

      // Update bias
      this.model.bias -= this.LEARNING_RATE * error;
    }

    // Update model performance metrics
    if (updateCount > 0) {
      this.model.performance.samples += updateCount;
      this.model.performance.avgError = totalError / updateCount;
      this.model.performance.confidence = Math.min(
        1.0,
        this.model.performance.samples / 1000
      );
    }
  }

  /**
   * Predict outcome using learned model
   */
  predict(features: Record<string, number>): number {
    let prediction = this.model.bias;

    for (const [feature, value] of Object.entries(features)) {
      const weight = this.model.weights[feature] || 0;
      prediction += weight * value;
    }

    return prediction;
  }

  /**
   * Get current model
   */
  getModel(): LearningModel {
    return { ...this.model };
  }

  /**
   * Analyze patterns and generate optimization insights
   */
  analyzePatterns(): OptimizationInsight[] {
    if (this.signals.length < 50) return [];

    const patternMap = new Map<string, { count: number; improvements: number[] }>();

    // Group signals by action to identify patterns
    for (const signal of this.signals) {
      const existing = patternMap.get(signal.action) || {
        count: 0,
        improvements: [],
      };

      existing.count++;

      if (signal.outcome.predicted && signal.outcome.actual) {
        const improvement = signal.outcome.predicted - signal.outcome.actual;
        if (improvement > 0) {
          existing.improvements.push(improvement);
        }
      }

      patternMap.set(signal.action, existing);
    }

    // Generate insights
    const insights: OptimizationInsight[] = [];

    for (const [action, data] of patternMap.entries()) {
      if (data.count < 5) continue; // Need minimum samples

      const avgImprovement =
        data.improvements.length > 0
          ? data.improvements.reduce((a, b) => a + b, 0) / data.improvements.length
          : 0;

      const successRate = data.improvements.length / data.count;

      if (successRate > 0.6 && avgImprovement > 0) {
        insights.push({
          pattern: action,
          frequency: data.count,
          avgImprovement,
          confidence: Math.min(1.0, data.count / 100),
          recommendation: `Action "${action}" shows ${(successRate * 100).toFixed(
            1
          )}% success rate with avg ${avgImprovement.toFixed(2)}s improvement`,
        });
      }
    }

    return insights.sort((a, b) => b.avgImprovement - a.avgImprovement);
  }

  /**
   * Get learning progress summary
   */
  getProgress(): {
    totalSignals: number;
    modelVersion: number;
    performance: LearningModel["performance"];
    topFeatures: Array<{ feature: string; weight: number }>;
  } {
    const topFeatures = Object.entries(this.model.weights)
      .map(([feature, weight]) => ({ feature, weight }))
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, 10);

    return {
      totalSignals: this.signals.length,
      modelVersion: this.model.version,
      performance: this.model.performance,
      topFeatures,
    };
  }

  /**
   * Export model for persistence
   */
  exportModel(): LearningModel {
    return {
      ...this.model,
      ts: new Date().toISOString(),
    };
  }

  /**
   * Import model from persistence
   */
  importModel(model: LearningModel): void {
    this.model = { ...model };
    this.model.version = model.version + 1;
  }
}

/**
 * Self-coaching optimizer that provides recommendations
 */
export class SelfCoachingOptimizer {
  private learningSystem: RecursiveLearningSystem;

  constructor(initialWeights?: Record<string, number>) {
    this.learningSystem = new RecursiveLearningSystem(initialWeights);
  }

  /**
   * Coach: Analyze and provide optimization recommendations
   */
  coach(): {
    insights: OptimizationInsight[];
    progress: ReturnType<RecursiveLearningSystem["getProgress"]>;
    recommendations: string[];
  } {
    const insights = this.learningSystem.analyzePatterns();
    const progress = this.learningSystem.getProgress();

    const recommendations: string[] = [];

    // Generate coaching recommendations
    if (progress.performance.confidence < 0.5) {
      recommendations.push(
        "⚠️  Low confidence: Need more execution samples for reliable predictions"
      );
    }

    if (progress.performance.avgError > 1.0) {
      recommendations.push(
        "⚠️  High prediction error: Consider recalibrating feature weights"
      );
    }

    if (insights.length > 0) {
      recommendations.push(
        `✅ Identified ${insights.length} optimization patterns with positive outcomes`
      );
    }

    if (progress.topFeatures.length > 0) {
      const topFeature = progress.topFeatures[0];
      recommendations.push(
        `📊 Most influential feature: "${topFeature.feature}" (weight: ${topFeature.weight.toFixed(3)})`
      );
    }

    return {
      insights,
      progress,
      recommendations,
    };
  }

  /**
   * Record execution outcome for learning
   */
  recordExecution(
    action: string,
    features: Record<string, number>,
    actual: number,
    predicted?: number
  ): void {
    const signal: LearningSignal = {
      id: `signal_${Date.now()}`,
      ts: new Date().toISOString(),
      category: actual < (predicted || Infinity) ? "SUCCESS" : "OPTIMIZATION",
      action,
      features,
      outcome: {
        actual,
        predicted,
        error: predicted ? actual - predicted : undefined,
      },
    };

    this.learningSystem.recordSignal(signal);
  }

  /**
   * Get learning system
   */
  getLearningSystem(): RecursiveLearningSystem {
    return this.learningSystem;
  }
}

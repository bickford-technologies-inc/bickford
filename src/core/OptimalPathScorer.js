/**
 * OptimalPathScorer (OPTR) - Optimal path scoring and recommendation engine
 * Evaluates decision paths and recommends optimal routes based on multiple criteria
 */

export class OptimalPathScorer {
  constructor(weights = {}) {
    this.weights = {
      cost: weights.cost || 0.3,
      time: weights.time || 0.3,
      risk: weights.risk || 0.2,
      quality: weights.quality || 0.2
    };
    this.pathHistory = [];
  }

  /**
   * Score a decision path based on multiple criteria
   * @param {Object} path - The path to score
   * @returns {Object} Score breakdown and total
   */
  scorePath(path) {
    const scores = {
      cost: this._scoreCost(path),
      time: this._scoreTime(path),
      risk: this._scoreRisk(path),
      quality: this._scoreQuality(path)
    };

    const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + (value * this.weights[key]);
    }, 0);

    const scoreRecord = {
      pathId: path.id,
      scores,
      totalScore,
      timestamp: new Date().toISOString(),
      path: path
    };

    this.pathHistory.push(scoreRecord);

    return scoreRecord;
  }

  /**
   * Compare multiple paths and recommend the optimal one
   * @param {Array} paths - Array of paths to compare
   * @returns {Object} Recommendation with analysis
   */
  recommendOptimalPath(paths) {
    const scoredPaths = paths.map(path => this.scorePath(path));
    
    // Sort by total score (higher is better)
    scoredPaths.sort((a, b) => b.totalScore - a.totalScore);

    return {
      recommended: scoredPaths[0],
      alternatives: scoredPaths.slice(1),
      confidence: this._calculateConfidence(scoredPaths),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Score cost efficiency (lower cost is better, normalized to 0-1)
   * @private
   */
  _scoreCost(path) {
    const cost = path.metrics?.cost || 50;
    // Normalize: lower cost = higher score
    return Math.max(0, Math.min(1, 1 - (cost / 100)));
  }

  /**
   * Score time efficiency (lower time is better, normalized to 0-1)
   * @private
   */
  _scoreTime(path) {
    const time = path.metrics?.time || 50;
    // Normalize: lower time = higher score
    return Math.max(0, Math.min(1, 1 - (time / 100)));
  }

  /**
   * Score risk level (lower risk is better, normalized to 0-1)
   * @private
   */
  _scoreRisk(path) {
    const risk = path.metrics?.risk || 50;
    // Normalize: lower risk = higher score
    return Math.max(0, Math.min(1, 1 - (risk / 100)));
  }

  /**
   * Score quality level (higher quality is better, normalized to 0-1)
   * @private
   */
  _scoreQuality(path) {
    const quality = path.metrics?.quality || 50;
    // Normalize: higher quality = higher score
    return Math.max(0, Math.min(1, quality / 100));
  }

  /**
   * Calculate confidence in the recommendation
   * @private
   */
  _calculateConfidence(scoredPaths) {
    if (scoredPaths.length < 2) return 1.0;

    const topScore = scoredPaths[0].totalScore;
    const secondScore = scoredPaths[1].totalScore;
    const scoreDifference = topScore - secondScore;

    // Higher difference = higher confidence
    return Math.min(1, 0.5 + scoreDifference);
  }

  /**
   * Get scoring history
   * @returns {Array} Array of all scored paths
   */
  getHistory() {
    return [...this.pathHistory];
  }

  /**
   * Update scoring weights
   * @param {Object} newWeights - New weight values
   */
  updateWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
    
    // Normalize weights to sum to 1.0
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    Object.keys(this.weights).forEach(key => {
      this.weights[key] /= sum;
    });
  }
}

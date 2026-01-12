/**
 * GovernanceGate - Promotion gate system for governance enforcement
 * Validates and controls the promotion of decisions through stages
 */

export class GovernanceGate {
  constructor(config = {}) {
    this.stages = config.stages || ['development', 'staging', 'production'];
    this.rules = new Map();
    this.promotionHistory = [];
    
    // Initialize default rules for each stage
    this.stages.forEach(stage => {
      this.rules.set(stage, []);
    });
  }

  /**
   * Add a validation rule to a stage
   * @param {string} stage - Target stage
   * @param {Function} rule - Validation function that returns {valid: boolean, message: string}
   */
  addRule(stage, rule) {
    if (!this.stages.includes(stage)) {
      throw new Error(`Invalid stage: ${stage}`);
    }
    
    const stageRules = this.rules.get(stage);
    stageRules.push(rule);
  }

  /**
   * Validate a decision for promotion to a target stage
   * @param {Object} decision - The decision to validate
   * @param {string} targetStage - The stage to promote to
   * @returns {Object} Validation result
   */
  async validatePromotion(decision, targetStage) {
    if (!this.stages.includes(targetStage)) {
      return {
        valid: false,
        stage: targetStage,
        errors: [`Invalid target stage: ${targetStage}`],
        warnings: []
      };
    }

    const rules = this.rules.get(targetStage);
    const errors = [];
    const warnings = [];

    for (const rule of rules) {
      try {
        const result = await rule(decision);
        if (!result.valid) {
          if (result.severity === 'warning') {
            warnings.push(result.message);
          } else {
            errors.push(result.message);
          }
        }
      } catch (error) {
        errors.push(`Rule execution failed: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      stage: targetStage,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Promote a decision to a target stage
   * @param {Object} decision - The decision to promote
   * @param {string} targetStage - The stage to promote to
   * @param {Object} metadata - Additional promotion metadata
   * @returns {Object} Promotion result
   */
  async promote(decision, targetStage, metadata = {}) {
    const validation = await this.validatePromotion(decision, targetStage);

    if (!validation.valid) {
      return {
        success: false,
        validation,
        promotedDecision: null
      };
    }

    const promotedDecision = {
      ...decision,
      stage: targetStage,
      promotedAt: new Date().toISOString(),
      promotionMetadata: metadata
    };

    const promotionRecord = {
      decisionId: decision.id,
      fromStage: decision.stage || 'none',
      toStage: targetStage,
      timestamp: new Date().toISOString(),
      metadata,
      validation
    };

    this.promotionHistory.push(promotionRecord);

    return {
      success: true,
      validation,
      promotedDecision
    };
  }

  /**
   * Get promotion history
   * @param {string} decisionId - Optional decision ID to filter by
   * @returns {Array} Array of promotion records
   */
  getPromotionHistory(decisionId = null) {
    if (decisionId) {
      return this.promotionHistory.filter(r => r.decisionId === decisionId);
    }
    return [...this.promotionHistory];
  }

  /**
   * Check if a decision can be promoted to a stage
   * @param {Object} decision - The decision to check
   * @param {string} targetStage - The target stage
   * @returns {Promise<boolean>} True if promotion is allowed
   */
  async canPromote(decision, targetStage) {
    const validation = await this.validatePromotion(decision, targetStage);
    return validation.valid;
  }

  /**
   * Get all stages in order
   * @returns {Array} Array of stage names
   */
  getStages() {
    return [...this.stages];
  }

  /**
   * Get next stage in the pipeline
   * @param {string} currentStage - Current stage
   * @returns {string|null} Next stage or null
   */
  getNextStage(currentStage) {
    const index = this.stages.indexOf(currentStage);
    if (index === -1 || index === this.stages.length - 1) {
      return null;
    }
    return this.stages[index + 1];
  }
}

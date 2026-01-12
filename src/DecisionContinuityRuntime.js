/**
 * DecisionContinuityRuntime (DCR)
 * Main runtime that orchestrates all components for decision tracking,
 * optimal path scoring, governance enforcement, and session management
 */
import { DecisionTracker } from './core/DecisionTracker.js';
import { OptimalPathScorer } from './core/OptimalPathScorer.js';
import { GovernanceGate } from './governance/GovernanceGate.js';
import { SessionManager } from './session/SessionManager.js';
import { IPProtector } from './security/IPProtector.js';

export class DecisionContinuityRuntime {
  constructor(config = {}) {
    this.config = config;
    
    // Initialize core components
    this.decisionTracker = new DecisionTracker();
    this.pathScorer = new OptimalPathScorer(config.scoringWeights);
    this.governanceGate = new GovernanceGate(config.governance);
    this.sessionManager = new SessionManager(config.session);
    this.ipProtector = new IPProtector(config.security);
    
    this.initialized = false;
  }

  /**
   * Initialize the runtime
   */
  async initialize() {
    await this.sessionManager.initialize();
    this.initialized = true;
    console.log('Decision Continuity Runtime initialized');
    return this;
  }

  /**
   * Record a decision with full tracking
   * @param {Object} decision - Decision to record
   * @param {string} sessionId - Optional session ID
   * @returns {Object} Recorded decision with metadata
   */
  async recordDecision(decision, sessionId = null) {
    this._ensureInitialized();

    // Record in decision tracker
    const record = this.decisionTracker.recordDecision(decision);

    // Update session if provided
    if (sessionId) {
      await this.sessionManager.updateSession(sessionId, {
        lastDecisionId: record.id,
        decisions: [
          ...(await this.sessionManager.getSession(sessionId))?.data?.decisions || [],
          record.id
        ]
      });
    }

    return record;
  }

  /**
   * Evaluate and score decision paths
   * @param {Array} paths - Paths to evaluate
   * @returns {Object} Scoring recommendation
   */
  evaluatePaths(paths) {
    this._ensureInitialized();
    return this.pathScorer.recommendOptimalPath(paths);
  }

  /**
   * Promote a decision through governance gates
   * @param {string} decisionId - Decision ID to promote
   * @param {string} targetStage - Target stage
   * @param {Object} metadata - Promotion metadata
   * @returns {Object} Promotion result
   */
  async promoteDecision(decisionId, targetStage, metadata = {}) {
    this._ensureInitialized();

    const decision = this.decisionTracker.getDecision(decisionId);
    if (!decision) {
      throw new Error(`Decision not found: ${decisionId}`);
    }

    return await this.governanceGate.promote(decision, targetStage, metadata);
  }

  /**
   * Create a new session for cross-device continuity
   * @param {Object} sessionData - Initial session data
   * @returns {Object} Created session
   */
  async createSession(sessionData = {}) {
    this._ensureInitialized();
    return await this.sessionManager.createSession(sessionData);
  }

  /**
   * Resume a session
   * @param {string} sessionId - Session ID
   * @param {Object} deviceInfo - Device information
   * @returns {Object} Session object
   */
  async resumeSession(sessionId, deviceInfo = {}) {
    this._ensureInitialized();
    
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    await this.sessionManager.registerDeviceAccess(sessionId, deviceInfo);
    return session;
  }

  /**
   * Export decision history with IP protection
   * @param {string} integrationId - Integration requesting export
   * @param {string} token - Access token
   * @param {Array} sensitiveFields - Additional fields to protect
   * @returns {Object} Sanitized export data
   */
  exportDecisions(integrationId, token, sensitiveFields = []) {
    this._ensureInitialized();

    if (!this.ipProtector.validateAccess(integrationId, token)) {
      throw new Error('Unauthorized access attempt');
    }

    const snapshot = this.decisionTracker.exportSnapshot();
    return this.ipProtector.sanitizeForExport(snapshot, sensitiveFields);
  }

  /**
   * Register an integration for secure access
   * @param {string} integrationId - Integration identifier
   * @param {Object} permissions - Integration permissions
   * @returns {Object} Integration credentials
   */
  registerIntegration(integrationId, permissions = {}) {
    this._ensureInitialized();
    return this.ipProtector.registerIntegration(integrationId, permissions);
  }

  /**
   * Get runtime status and health
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      components: {
        decisionTracker: {
          totalDecisions: this.decisionTracker.getAllDecisions().length,
          integrityVerified: this.decisionTracker.verifyIntegrity()
        },
        pathScorer: {
          totalScores: this.pathScorer.getHistory().length,
          weights: this.pathScorer.weights
        },
        governanceGate: {
          stages: this.governanceGate.getStages(),
          promotions: this.governanceGate.getPromotionHistory().length
        },
        sessionManager: {
          activeSessions: this.sessionManager.getActiveSessions().length
        },
        ipProtector: {
          registeredIntegrations: this.ipProtector.getRegisteredIntegrations().length,
          accessAttempts: this.ipProtector.getAccessLog().length
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verify system integrity
   * @returns {Object} Integrity verification results
   */
  verifyIntegrity() {
    this._ensureInitialized();

    return {
      decisionChainValid: this.decisionTracker.verifyIntegrity(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a checkpoint in a session
   * @param {string} sessionId - Session ID
   * @param {string} description - Checkpoint description
   * @returns {Object} Checkpoint information
   */
  async createCheckpoint(sessionId, description = '') {
    this._ensureInitialized();
    return await this.sessionManager.createCheckpoint(sessionId, description);
  }

  /**
   * Restore session to a checkpoint
   * @param {string} sessionId - Session ID
   * @param {string} checkpointId - Checkpoint ID
   * @returns {Object} Restored session
   */
  async restoreCheckpoint(sessionId, checkpointId) {
    this._ensureInitialized();
    return await this.sessionManager.restoreCheckpoint(sessionId, checkpointId);
  }

  /**
   * Ensure runtime is initialized
   * @private
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Runtime not initialized. Call initialize() first.');
    }
  }
}

export default DecisionContinuityRuntime;

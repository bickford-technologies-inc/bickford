/**
 * DecisionTracker - Immutable decision tracking system
 * Records all decisions with cryptographic integrity to ensure auditability
 */
import crypto from 'crypto';

export class DecisionTracker {
  constructor() {
    this.decisions = [];
    this.decisionIndex = new Map();
  }

  /**
   * Record a new decision immutably
   * @param {Object} decision - The decision to record
   * @returns {Object} The recorded decision with metadata
   */
  recordDecision(decision) {
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();
    
    // Create immutable decision record
    const record = Object.freeze({
      id,
      timestamp,
      decision: Object.freeze({ ...decision }),
      hash: this._computeHash({ id, timestamp, decision }),
      previousHash: this.decisions.length > 0 ? 
        this.decisions[this.decisions.length - 1].hash : null
    });

    this.decisions.push(record);
    this.decisionIndex.set(id, this.decisions.length - 1);

    return record;
  }

  /**
   * Get a decision by ID
   * @param {string} id - Decision ID
   * @returns {Object|null} The decision record or null
   */
  getDecision(id) {
    const index = this.decisionIndex.get(id);
    return index !== undefined ? this.decisions[index] : null;
  }

  /**
   * Get all decisions
   * @returns {Array} Array of all decision records
   */
  getAllDecisions() {
    return [...this.decisions];
  }

  /**
   * Verify the integrity of the decision chain
   * @returns {boolean} True if chain is valid
   */
  verifyIntegrity() {
    for (let i = 0; i < this.decisions.length; i++) {
      const record = this.decisions[i];
      const expectedHash = this._computeHash({
        id: record.id,
        timestamp: record.timestamp,
        decision: record.decision
      });

      if (record.hash !== expectedHash) {
        return false;
      }

      if (i > 0) {
        const previousHash = this.decisions[i - 1].hash;
        if (record.previousHash !== previousHash) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Compute cryptographic hash for decision data
   * @private
   */
  _computeHash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Export decision history as immutable snapshot
   * @returns {Object} Snapshot of decision history
   */
  exportSnapshot() {
    return Object.freeze({
      decisions: this.getAllDecisions(),
      snapshotTime: new Date().toISOString(),
      verified: this.verifyIntegrity()
    });
  }
}

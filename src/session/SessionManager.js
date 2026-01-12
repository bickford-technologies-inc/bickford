/**
 * SessionManager - Persistent session layer for cross-device continuity
 * Manages sessions that can be resumed across different devices and contexts
 */
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class SessionManager {
  constructor(config = {}) {
    this.sessions = new Map();
    this.sessionDir = config.sessionDir || '.sessions';
    this.persistence = config.persistence !== false;
    this.encryptionKey = config.encryptionKey;
  }

  /**
   * Initialize the session manager (create storage directory)
   */
  async initialize() {
    if (this.persistence) {
      try {
        await fs.mkdir(this.sessionDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create session directory:', error);
      }
    }
  }

  /**
   * Create a new session
   * @param {Object} sessionData - Initial session data
   * @returns {Object} Created session
   */
  async createSession(sessionData = {}) {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      data: sessionData,
      deviceHistory: [],
      checkpoints: []
    };

    this.sessions.set(sessionId, session);

    if (this.persistence) {
      await this._persistSession(session);
    }

    return session;
  }

  /**
   * Get a session by ID
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Session object or null
   */
  async getSession(sessionId) {
    let session = this.sessions.get(sessionId);

    if (!session && this.persistence) {
      // Try to load from disk
      session = await this._loadSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
      }
    }

    if (session) {
      session.lastAccessedAt = new Date().toISOString();
      if (this.persistence) {
        await this._persistSession(session);
      }
    }

    return session;
  }

  /**
   * Update session data
   * @param {string} sessionId - Session ID
   * @param {Object} updates - Data to update
   * @returns {Object|null} Updated session or null
   */
  async updateSession(sessionId, updates) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.data = { ...session.data, ...updates };
    session.lastAccessedAt = new Date().toISOString();

    if (this.persistence) {
      await this._persistSession(session);
    }

    return session;
  }

  /**
   * Create a checkpoint in the session (for rollback capabilities)
   * @param {string} sessionId - Session ID
   * @param {string} description - Checkpoint description
   * @returns {Object|null} Checkpoint or null
   */
  async createCheckpoint(sessionId, description = '') {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const checkpoint = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      description,
      data: JSON.parse(JSON.stringify(session.data)) // Deep copy
    };

    session.checkpoints.push(checkpoint);

    if (this.persistence) {
      await this._persistSession(session);
    }

    return checkpoint;
  }

  /**
   * Restore session to a checkpoint
   * @param {string} sessionId - Session ID
   * @param {string} checkpointId - Checkpoint ID
   * @returns {Object|null} Restored session or null
   */
  async restoreCheckpoint(sessionId, checkpointId) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const checkpoint = session.checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) return null;

    session.data = JSON.parse(JSON.stringify(checkpoint.data));
    session.lastAccessedAt = new Date().toISOString();

    if (this.persistence) {
      await this._persistSession(session);
    }

    return session;
  }

  /**
   * Register device access to a session
   * @param {string} sessionId - Session ID
   * @param {Object} deviceInfo - Device information
   */
  async registerDeviceAccess(sessionId, deviceInfo) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    session.deviceHistory.push({
      timestamp: new Date().toISOString(),
      device: deviceInfo
    });

    if (this.persistence) {
      await this._persistSession(session);
    }

    return session;
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {boolean} True if deleted
   */
  async deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);

    if (this.persistence) {
      try {
        const sessionPath = path.join(this.sessionDir, `${sessionId}.json`);
        await fs.unlink(sessionPath);
      } catch (error) {
        // Session file may not exist
      }
    }

    return deleted;
  }

  /**
   * Persist session to disk
   * @private
   */
  async _persistSession(session) {
    try {
      const sessionPath = path.join(this.sessionDir, `${session.id}.json`);
      let data = JSON.stringify(session, null, 2);

      if (this.encryptionKey) {
        data = this._encrypt(data);
      }

      await fs.writeFile(sessionPath, data, 'utf8');
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  }

  /**
   * Load session from disk
   * @private
   */
  async _loadSession(sessionId) {
    try {
      const sessionPath = path.join(this.sessionDir, `${sessionId}.json`);
      let data = await fs.readFile(sessionPath, 'utf8');

      if (this.encryptionKey) {
        data = this._decrypt(data);
      }

      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Encrypt data (placeholder - implement proper encryption as needed)
   * @private
   */
  _encrypt(data) {
    // Simple encryption placeholder - use proper encryption library in production
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decrypt data (placeholder - implement proper decryption as needed)
   * @private
   */
  _decrypt(data) {
    // Simple decryption placeholder - use proper encryption library in production
    return Buffer.from(data, 'base64').toString('utf8');
  }

  /**
   * List all active sessions
   * @returns {Array} Array of session IDs
   */
  getActiveSessions() {
    return Array.from(this.sessions.keys());
  }
}

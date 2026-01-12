/**
 * IPProtector - IP protection and integration safeguards
 * Provides mechanisms to protect intellectual property while enabling integration
 */
import crypto from 'crypto';

export class IPProtector {
  constructor(config = {}) {
    this.allowedIntegrations = new Set(config.allowedIntegrations || []);
    this.accessLog = [];
    this.encryptionEnabled = config.encryptionEnabled !== false;
    this.watermarkEnabled = config.watermarkEnabled !== false;
  }

  /**
   * Register an allowed integration
   * @param {string} integrationId - Unique integration identifier
   * @param {Object} permissions - Integration permissions
   */
  registerIntegration(integrationId, permissions = {}) {
    this.allowedIntegrations.add(integrationId);
    
    this.accessLog.push({
      action: 'register',
      integrationId,
      permissions,
      timestamp: new Date().toISOString()
    });

    return {
      integrationId,
      token: this._generateToken(integrationId),
      permissions
    };
  }

  /**
   * Validate integration access
   * @param {string} integrationId - Integration identifier
   * @param {string} token - Access token
   * @returns {boolean} True if access is valid
   */
  validateAccess(integrationId, token) {
    if (!this.allowedIntegrations.has(integrationId)) {
      this._logAccess(integrationId, 'denied', 'Integration not registered');
      return false;
    }

    const expectedToken = this._generateToken(integrationId);
    if (token !== expectedToken) {
      this._logAccess(integrationId, 'denied', 'Invalid token');
      return false;
    }

    this._logAccess(integrationId, 'granted', 'Valid access');
    return true;
  }

  /**
   * Sanitize data for external sharing (remove sensitive information)
   * @param {Object} data - Data to sanitize
   * @param {Array} sensitiveFields - Fields to redact
   * @returns {Object} Sanitized data
   */
  sanitizeForExport(data, sensitiveFields = []) {
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const defaultSensitiveFields = [
      'password',
      'secret',
      'apiKey',
      'privateKey',
      'token',
      'credentials'
    ];

    const fieldsToRedact = [...defaultSensitiveFields, ...sensitiveFields];

    const redact = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const key in obj) {
        if (fieldsToRedact.some(field => 
          key.toLowerCase().includes(field.toLowerCase())
        )) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          redact(obj[key]);
        }
      }
    };

    redact(sanitized);

    if (this.watermarkEnabled) {
      sanitized._watermark = this._generateWatermark(sanitized);
    }

    return sanitized;
  }

  /**
   * Encrypt sensitive data
   * @param {Object} data - Data to encrypt
   * @returns {string} Encrypted data
   */
  encryptData(data) {
    if (!this.encryptionEnabled) {
      return JSON.stringify(data);
    }

    // Simple encryption - use proper encryption library in production
    const dataStr = JSON.stringify(data);
    return Buffer.from(dataStr).toString('base64');
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data
   * @returns {Object} Decrypted data
   */
  decryptData(encryptedData) {
    if (!this.encryptionEnabled) {
      return JSON.parse(encryptedData);
    }

    // Simple decryption - use proper encryption library in production
    const dataStr = Buffer.from(encryptedData, 'base64').toString('utf8');
    return JSON.parse(dataStr);
  }

  /**
   * Generate access token for integration
   * @private
   */
  _generateToken(integrationId) {
    // Simple token generation - use proper JWT or similar in production
    return crypto
      .createHash('sha256')
      .update(`${integrationId}-${Date.now()}`)
      .digest('hex');
  }

  /**
   * Generate watermark for data tracking
   * @private
   */
  _generateWatermark(data) {
    const timestamp = new Date().toISOString();
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');

    return {
      timestamp,
      hash: dataHash.substring(0, 16),
      version: '1.0'
    };
  }

  /**
   * Log access attempt
   * @private
   */
  _logAccess(integrationId, status, reason) {
    this.accessLog.push({
      integrationId,
      status,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get access log
   * @param {string} integrationId - Optional filter by integration
   * @returns {Array} Access log entries
   */
  getAccessLog(integrationId = null) {
    if (integrationId) {
      return this.accessLog.filter(entry => entry.integrationId === integrationId);
    }
    return [...this.accessLog];
  }

  /**
   * Revoke integration access
   * @param {string} integrationId - Integration to revoke
   * @returns {boolean} True if revoked
   */
  revokeAccess(integrationId) {
    const deleted = this.allowedIntegrations.delete(integrationId);
    
    if (deleted) {
      this._logAccess(integrationId, 'revoked', 'Access revoked by administrator');
    }

    return deleted;
  }

  /**
   * Get list of registered integrations
   * @returns {Array} Array of integration IDs
   */
  getRegisteredIntegrations() {
    return Array.from(this.allowedIntegrations);
  }
}

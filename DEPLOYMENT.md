# Deployment Guide for Decision Continuity Runtime

## System Requirements

- **Node.js**: Version 18.0.0 or higher
- **Operating System**: Linux, macOS, or Windows
- **Memory**: Minimum 512MB RAM (recommended 1GB+)
- **Storage**: Depends on usage (sessions and decision history)

## Installation

### From Source

```bash
# Clone repository
git clone https://github.com/bickfordd-bit/session-completion-runtime.git
cd session-completion-runtime

# Verify Node.js version
node --version  # Should be 18+

# Run tests
node examples/comprehensive-test.js
```

### As a Module

```javascript
// Import in your Node.js project
import { DecisionContinuityRuntime } from './src/index.js';
```

## Configuration

### Basic Configuration

```javascript
const dcr = new DecisionContinuityRuntime({
  scoringWeights: {
    cost: 0.3,
    time: 0.3,
    risk: 0.2,
    quality: 0.2
  },
  governance: {
    stages: ['development', 'staging', 'production']
  },
  session: {
    persistence: true,
    sessionDir: '.sessions'
  },
  security: {
    encryptionEnabled: true,
    watermarkEnabled: true
  }
});
```

### Production Configuration

```javascript
const dcr = new DecisionContinuityRuntime({
  scoringWeights: {
    cost: 0.25,
    time: 0.25,
    risk: 0.3,
    quality: 0.2
  },
  governance: {
    stages: ['dev', 'qa', 'uat', 'staging', 'production']
  },
  session: {
    persistence: true,
    sessionDir: '/var/lib/dcr/sessions',
    encryptionKey: process.env.DCR_ENCRYPTION_KEY
  },
  security: {
    encryptionEnabled: true,
    watermarkEnabled: true,
    allowedIntegrations: [] // Start empty, register explicitly
  }
});
```

## Environment Variables

Create a `.env` file for sensitive configuration:

```bash
# Session encryption key (generate with: openssl rand -hex 32)
DCR_ENCRYPTION_KEY=your-secure-encryption-key-here

# Session storage directory
DCR_SESSION_DIR=/var/lib/dcr/sessions

# Log level
DCR_LOG_LEVEL=info
```

## Directory Structure

```
/var/lib/dcr/
├── sessions/           # Persistent session data
│   ├── <session-id>.json
│   └── ...
├── backups/           # Optional backup location
└── logs/              # Application logs
```

## Permissions

### File System Permissions

```bash
# Create DCR directories
sudo mkdir -p /var/lib/dcr/sessions
sudo mkdir -p /var/lib/dcr/backups
sudo mkdir -p /var/log/dcr

# Set ownership (replace 'appuser' with your app user)
sudo chown -R appuser:appuser /var/lib/dcr
sudo chown -R appuser:appuser /var/log/dcr

# Set permissions
sudo chmod 700 /var/lib/dcr/sessions  # Only owner can access
sudo chmod 755 /var/lib/dcr
```

## Running in Production

### As a Service (systemd)

Create `/etc/systemd/system/dcr.service`:

```ini
[Unit]
Description=Decision Continuity Runtime
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/dcr
Environment=NODE_ENV=production
EnvironmentFile=/etc/dcr/environment
ExecStart=/usr/bin/node /opt/dcr/src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dcr
sudo systemctl start dcr
sudo systemctl status dcr
```

### As a Docker Container

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy application
COPY package*.json ./
COPY src ./src

# Create data directories
RUN mkdir -p /usr/src/app/.sessions && \
    chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose port if running as HTTP service
# EXPOSE 3000

# Start application
CMD ["node", "src/index.js"]
```

Build and run:

```bash
docker build -t dcr:latest .
docker run -d \
  --name dcr \
  -v /var/lib/dcr/sessions:/usr/src/app/.sessions \
  -e DCR_ENCRYPTION_KEY=your-key \
  dcr:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  dcr:
    build: .
    container_name: dcr
    restart: unless-stopped
    volumes:
      - ./sessions:/usr/src/app/.sessions
    environment:
      - NODE_ENV=production
      - DCR_ENCRYPTION_KEY=${DCR_ENCRYPTION_KEY}
    networks:
      - dcr-network

networks:
  dcr-network:
    driver: bridge
```

Run with:

```bash
docker-compose up -d
```

## Backup and Recovery

### Backup Sessions

```bash
#!/bin/bash
# backup-dcr.sh

BACKUP_DIR="/var/lib/dcr/backups"
SESSION_DIR="/var/lib/dcr/sessions"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "${BACKUP_DIR}/sessions_${DATE}.tar.gz" -C "${SESSION_DIR}" .

# Keep only last 30 days
find "${BACKUP_DIR}" -name "sessions_*.tar.gz" -mtime +30 -delete
```

Schedule with cron:

```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-dcr.sh
```

### Restore from Backup

```bash
#!/bin/bash
# restore-dcr.sh

BACKUP_FILE=$1
SESSION_DIR="/var/lib/dcr/sessions"

# Stop service
sudo systemctl stop dcr

# Restore
tar -xzf "${BACKUP_FILE}" -C "${SESSION_DIR}"

# Start service
sudo systemctl start dcr
```

## Monitoring

### Health Check

```javascript
// health-check.js
import { DecisionContinuityRuntime } from './src/index.js';

const dcr = new DecisionContinuityRuntime();
await dcr.initialize();

const status = dcr.getStatus();
const integrity = dcr.verifyIntegrity();

if (!status.initialized || !integrity.decisionChainValid) {
  console.error('Health check failed');
  process.exit(1);
}

console.log('Health check passed');
process.exit(0);
```

### Metrics to Monitor

1. **Decision throughput**: Decisions recorded per minute
2. **Integrity checks**: Time to verify decision chain
3. **Session count**: Active sessions
4. **Promotion rate**: Success/failure ratio
5. **Access attempts**: Authorized vs denied
6. **Response time**: API call latency

### Logging

```javascript
// Add to your runtime initialization
console.log('DCR Status:', dcr.getStatus());

// Log on errors
try {
  await dcr.recordDecision(decision);
} catch (error) {
  console.error('Decision recording failed:', error);
  // Send to logging service
}
```

## Security Hardening

### 1. Encryption

Use strong encryption keys:

```bash
# Generate secure key
openssl rand -hex 32
```

Store securely:
- Use environment variables
- Never commit to git
- Use secret management (AWS Secrets Manager, HashiCorp Vault)

### 2. Access Control

Implement proper authentication:

```javascript
// Replace simple token with JWT
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { integrationId, permissions },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### 3. Network Security

- Use TLS/SSL for all connections
- Implement rate limiting
- Use firewall rules
- Enable audit logging

### 4. File Permissions

```bash
# Restrict session files to owner only
chmod 600 /var/lib/dcr/sessions/*.json
```

## Performance Tuning

### Memory Management

```javascript
// Clear old sessions periodically
setInterval(async () => {
  const sessions = dcr.sessionManager.getActiveSessions();
  const now = Date.now();
  
  for (const sessionId of sessions) {
    const session = await dcr.sessionManager.getSession(sessionId);
    const lastAccess = new Date(session.lastAccessedAt).getTime();
    
    // Delete sessions older than 7 days
    if (now - lastAccess > 7 * 24 * 60 * 60 * 1000) {
      await dcr.sessionManager.deleteSession(sessionId);
    }
  }
}, 24 * 60 * 60 * 1000); // Run daily
```

### Storage Optimization

```bash
# Compress old sessions
find /var/lib/dcr/sessions -name "*.json" -mtime +7 -exec gzip {} \;
```

## Troubleshooting

### Issue: High memory usage

**Cause**: Too many sessions in memory

**Solution**: Implement session cleanup or use external storage

```javascript
// Limit in-memory sessions
if (dcr.sessionManager.sessions.size > 1000) {
  // Persist and clear oldest sessions
}
```

### Issue: Slow integrity verification

**Cause**: Large decision chain

**Solution**: Implement periodic snapshots

```javascript
// Create snapshot every 1000 decisions
if (dcr.decisionTracker.getAllDecisions().length % 1000 === 0) {
  const snapshot = dcr.decisionTracker.exportSnapshot();
  // Save snapshot to archive
}
```

### Issue: Session files corrupted

**Cause**: Improper shutdown or disk issues

**Solution**: Restore from backup

```bash
./restore-dcr.sh /var/lib/dcr/backups/sessions_20231220_020000.tar.gz
```

## Scaling Considerations

### Horizontal Scaling

For multiple instances:

1. **Shared Storage**: Use network file system or object storage
2. **Session Replication**: Implement session sync between instances
3. **Load Balancer**: Distribute requests across instances

### Database Backend

For large-scale deployments, consider database storage:

```javascript
// Example with PostgreSQL
class DatabaseDecisionTracker extends DecisionTracker {
  async recordDecision(decision) {
    // Store in database
    const record = await db.insert('decisions', ...);
    return record;
  }
}
```

## Compliance

### Audit Trail

DCR maintains complete audit trails for:
- All decisions (immutable)
- Promotion history
- Access attempts
- Session activity

### Data Retention

Configure retention policies:

```javascript
// Archive old decisions
if (decision.timestamp < retentionDate) {
  archiveDecision(decision);
}
```

### GDPR Compliance

Implement data deletion:

```javascript
// Delete user's session data
async function deleteUserData(userId) {
  const sessions = /* find sessions by userId */;
  for (const session of sessions) {
    await dcr.sessionManager.deleteSession(session.id);
  }
}
```

## Support

For production issues:

1. Check logs: `/var/log/dcr/`
2. Run health check: `node health-check.js`
3. Verify integrity: `dcr.verifyIntegrity()`
4. Review status: `dcr.getStatus()`

## License

MIT - See LICENSE file

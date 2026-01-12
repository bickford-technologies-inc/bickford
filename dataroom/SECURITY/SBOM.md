# Software Bill of Materials (SBOM) - Bickford DCR

**Timestamp:** 2025-12-20T20:15:00-05:00  
**Format:** SPDX-Lite  
**Status:** Complete

---

## Summary

- **Total Components**: 7 (all internal)
- **External Dependencies**: **0**
- **Node.js Built-in Modules**: 3 (crypto, fs/promises, path)
- **License**: MIT

---

## Component Inventory

### Internal Components (7)

1. **DecisionContinuityRuntime** - Main orchestrator
   - File: `src/DecisionContinuityRuntime.js`
   - License: MIT
   - Dependencies: All internal

2. **DecisionTracker** - Immutable decision tracking
   - File: `src/core/DecisionTracker.js`
   - License: MIT
   - Dependencies: crypto (Node.js built-in)

3. **OptimalPathScorer** - OPTR scoring engine
   - File: `src/core/OptimalPathScorer.js`
   - License: MIT
   - Dependencies: None

4. **GovernanceGate** - Promotion validation
   - File: `src/governance/GovernanceGate.js`
   - License: MIT
   - Dependencies: None

5. **SessionManager** - Persistent sessions
   - File: `src/session/SessionManager.js`
   - License: MIT
   - Dependencies: crypto, fs/promises, path (Node.js built-in)

6. **IPProtector** - IP protection and security
   - File: `src/security/IPProtector.js`
   - License: MIT
   - Dependencies: crypto (Node.js built-in)

7. **Index** - Module exports
   - File: `src/index.js`
   - License: MIT
   - Dependencies: All internal

### External Dependencies

**None** - This system has zero external npm dependencies.

### Node.js Built-in Modules (Not External Dependencies)

1. **crypto** - Cryptographic functions (SHA-256 hashing)
   - Version: Built into Node.js
   - License: Node.js license (MIT-compatible)
   - Usage: Hash generation, UUIDs, token generation

2. **fs/promises** - File system operations
   - Version: Built into Node.js
   - License: Node.js license (MIT-compatible)
   - Usage: Session persistence to disk

3. **path** - Path manipulation
   - Version: Built into Node.js
   - License: Node.js license (MIT-compatible)
   - Usage: Session file path resolution

---

## Verification

```bash
# Verify zero external dependencies
cat package.json | jq '.dependencies'
# Expected: {}

# List all imports
grep -rh "^import.*from" src/ | sort | uniq
# Expected: Only internal imports and crypto/fs/path
```

---

## Security Implications

**Zero external dependencies means**:
- No npm package vulnerabilities
- No supply chain attacks
- No dependency confusion attacks
- No transitive dependency risks
- Minimal attack surface

---

## License Compliance

All components are MIT licensed, compatible with commercial use.

---

**Last Updated**: 2025-12-20  
**Maintainer**: Derek Bickford

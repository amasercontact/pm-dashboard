# 🛡️ Project Management Dashboard - Security Documentation

## Overview

This document explains the security features implemented in the Project Management Dashboard to protect your data.

## 🔐 Authentication Security

### Password Hashing

**Implementation:** PBKDF2 (Password-Based Key Derivation Function 2) via Web Crypto API

- **Algorithm:** PBKDF2 with SHA-256
- **Iterations:** 100,000+ iterations (configurable)
- **Salt:** Unique 128-bit salt per user, randomly generated
- **Key Length:** 256 bits

```javascript
// Password hashing flow:
1. Generate random salt for each user
2. Apply PBKDF2 with high iteration count
3. Store only: { salt, hash } - NEVER the plaintext password
4. On login: hash input + stored salt, compare hashes
```

**Why PBKDF2?**
- Computationally expensive (resistant to brute force)
- Uses salt (prevents rainbow table attacks)
- Industry standard (NIST recommended)

### Session Management

**Session Token Structure:**
```
{tokenId}.{expiration}.{hmacSignature}
```

- **Token Lifetime:** 30 minutes (configurable)
- **Idle Timeout:** 10 minutes of inactivity → auto-logout
- **Storage:** HttpOnly-equivalent (not accessible to JavaScript for XSS safety)

### Login Attempt Protection

**Rate Limiting:**
- Max 5 failed attempts per user
- Lockout duration: 15 minutes
- Lockout increases with repeated failures (15, 30, 60 minutes)

**Brute Force Protection:**
- Failed attempts are logged with timestamps
- IP-based tracking (in memory)
- Account unlock via password reset

## 🛡️ Data Protection

### Encryption at Rest

**Algorithm:** AES-GCM (Galois/Counter Mode)

- **Key Derivation:** Password-derived key using PBKDF2
- **Key Strength:** 256-bit
- **IV:** Unique random IV per encryption operation
- **Authentication:** Built-in authentication tag (tamper detection)

**What's Encrypted:**
- All project data
- Task content
- User credentials
- Activity logs

**What's NOT Encrypted:**
- Session tokens (stored separately)
- User preferences (theme, etc.)

### Secure Storage

**Primary Storage:** IndexedDB with encryption wrapper

**Benefits over localStorage:**
- Structured data (no JSON parsing overhead)
- Supports transactions
- Better performance with large datasets
- Not exposed to XSS in same way

**Encryption Wrapper:**
```javascript
// All data is encrypted before IndexedDB storage
encrypt(data) → AES-GCM(serialize(data))
decrypt(data) → deserialize(AES-GCM⁻¹(data))
```

## 🚫 Attack Prevention

### XSS (Cross-Site Scripting) Prevention

**Input Sanitization:**
- All user input is sanitized before rendering
- HTML entities escaped
- No innerHTML with user content
- Use textContent instead

```javascript
// Example sanitization
function sanitize(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
```

### CSRF (Cross-Site Request Forgery) Protection

**Token-Based Protection:**
- CSRF token generated per session
- Token required for all state-changing operations
- Token validated server-side (in our case, validated before IndexedDB write)

```javascript
// Token included in all requests
{ action, data, csrfToken, timestamp }
```

### Content Security Policy

**Implemented Headers:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
```

### Input Validation

**Sanitization Rules:**
- Strings: HTML entities escaped
- Numbers: Type-checked and bounded
- Dates: Validated format
- IDs: UUID validation

## 🔑 Key Management

### Master Key Derivation

```
masterKey = PBKDF2(userPassword, uniqueSalt, iterations)
encryptionKey = HMAC(masterKey, "encryption")
hmacKey = HMAC(masterKey, "hmac")
sessionKey = HMAC(masterKey, "session")
```

### Key Rotation

- Master key never stored (derived from password)
- Session keys can be rotated on demand
- Old data re-encrypted on password change

## ⏱️ Auto-Logout

### Inactivity Detection

**Timeout:** 10 minutes of no interaction

**Events Tracked:**
- Mouse movement
- Keyboard input
- Touch events
- Scroll events

**Warning:** Toast notification at 8 minutes (2 min before logout)

```javascript
// Activity tracking
const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_MS = 8 * 60 * 1000;  // 8 minutes

// Reset timer on any user interaction
```

## 🔒 Security Checklist

- [x] Passwords hashed with PBKDF2 (100k+ iterations)
- [x] Unique salt per user
- [x] Session tokens with HMAC signatures
- [x] Session expiration
- [x] Auto-logout after inactivity
- [x] Login attempt limiting
- [x] Account lockout
- [x] Data encrypted with AES-GCM
- [x] Input sanitization
- [x] CSRF token protection
- [x] Secure random number generation (crypto.getRandomValues)
- [x] No plaintext passwords stored
- [x] No sensitive data in URLs
- [x] IndexedDB over localStorage

## 🧪 Security Best Practices Used

1. **Defense in Depth:** Multiple layers of protection
2. **Fail Securely:** Lock down on any error
3. **Least Privilege:** Minimal permissions
4. **Secure Defaults:** Safe out-of-the-box
5. **Privacy by Design:** Encrypt everything

## 🔐 Password Requirements

For maximum security:

- Minimum 8 characters
- Mix of uppercase and lowercase
- At least one number
- At least one special character
- Not a common password
- Not reused from other sites

## 📱 Device Security

### Mobile Considerations

- Biometric authentication (if available via Web Authentication API)
- Screen lock enforcement
- Clear data on multiple failed device unlocks

### Offline Security

- Encrypted cache
- No cached credentials
- Session invalidation on reconnect

## 🚨 Incident Response

### If You Suspect Compromise

1. **Change your password immediately**
2. **Export and review recent activity logs**
3. **Check for unauthorized projects/tasks**
4. **Clear all local data and re-initialize**
5. **Enable additional monitoring**

### Data Recovery

- Export your projects as JSON (Settings → Export)
- Keep backups in a secure location
- Use import to restore after password change

## 📋 Compliance

This implementation follows security best practices including:

- OWASP Top 10 prevention
- NIST guidelines for password storage
- GDPR data protection principles

## 🔄 Updates

Security features are updated based on:
- Known vulnerabilities
- New attack vectors
- Industry best practices

**Last Security Review:** Dashboard v1.0

---

_Your data is encrypted and protected. No plaintext is ever stored._

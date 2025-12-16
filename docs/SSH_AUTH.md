# SSH & Authentication Setup Guide

**Understanding 1Password SSH Agent and Git authentication**

## Table of Contents

1. [Overview](#overview)
2. [Current Setup](#current-setup)
3. [How It Works](#how-it-works)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Alternative: Traditional SSH Keys](#alternative-traditional-ssh-keys)
7. [FAQ](#faq)

---

## Overview

This dotfiles system uses **1Password SSH Agent** for secure, password-less authentication with Git, GitHub, and other SSH services.

### Why 1Password SSH Agent?

✅ **More Secure**
- SSH keys never written to disk
- Keys locked behind TouchID (macOS)
- Centralized key management

✅ **More Convenient**
- No manual key generation
- No key file management
- Automatic SSH agent integration

✅ **Cross-Device**
- Keys available on all devices with 1Password
- No need to copy keys between machines
- Consistent setup everywhere

---

## Current Setup

### What's Configured

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION STACK                          │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐
  │   Your Command   │
  │  (git push, etc) │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  Git (SSH mode)  │
  │  Uses SSH URLs   │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │   SSH Client     │
  │  Reads config    │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │   ~/.ssh/config  │
  │  Points to 1Pass │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 1Password Agent  │
  │  Provides keys   │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 1Password Vault  │
  │  Stores keys     │
  └──────────────────┘
```

### Files Involved

| File | Purpose |
|------|---------|
| `~/.ssh/config` | SSH configuration pointing to 1Password agent |
| `~/.gitconfig` | Git configured to use SSH URLs |
| `~/.config/op/plugins.sh` | 1Password CLI plugins (gh, docker, etc.) |

---

## How It Works

### SSH Key Storage

**Traditional Setup (Old Way)**
```
~/.ssh/
├── id_ed25519        ← Private key (dangerous if leaked!)
├── id_ed25519.pub    ← Public key
└── known_hosts
```

**1Password Setup (Current)**
```
1Password Vault (Encrypted)
├── SSH Key 1 (GitHub)
├── SSH Key 2 (GitLab)
└── SSH Key 3 (Server)
         │
         └──► Provided on-demand by 1Password SSH Agent
               (never written to disk)
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               SSH AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. You run: git push
     │
     ▼
2. Git needs SSH key
     │
     ├─► Reads ~/.gitconfig
     │   └─► Configured to use SSH (git@github.com:...)
     │
     ▼
3. SSH client reads ~/.ssh/config
     │
     ├─► IdentityAgent ~/.1password/agent.sock
     │   └─► Use 1Password SSH Agent
     │
     ▼
4. SSH requests key from 1Password agent
     │
     ├─► 1Password Desktop app must be unlocked
     │   └─► TouchID prompt (macOS)
     │
     ▼
5. 1Password provides key from vault
     │
     ├─► Key never written to disk
     │   └─► Exists only in memory
     │
     ▼
6. SSH authenticates with GitHub
     │
     └─► ✅ Success! Push completed
```

### Git URL Rewriting

Your `.gitconfig` automatically converts HTTPS URLs to SSH:

```ini
# ~/.gitconfig
[url "git@github.com:"]
    insteadOf = https://github.com/
```

**What This Means:**
```bash
# You clone with HTTPS
git clone https://github.com/user/repo.git

# Git automatically converts to SSH
git clone git@github.com:user/repo.git
```

---

## Verification

### Check If Everything Works

#### 1. Verify 1Password CLI

```bash
# Check if installed
op --version

# Check if signed in
op whoami
```

**Expected Output:**
```
2.32.0 (or higher)
your-email@example.com
```

#### 2. Check SSH Agent

```bash
ssh-add -l
```

**Expected Output:**
```
The agent has no identities
```

⚠️ **This is NORMAL!** With 1Password SSH Agent, `ssh-add -l` always shows no identities because keys are provided on-demand, not pre-loaded.

#### 3. Test GitHub SSH Connection

```bash
ssh -T git@github.com
```

**Expected Output:**
```
Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.
```

✅ If you see this, **SSH authentication is working perfectly!**

#### 4. Check Git Configuration

```bash
git config --get url.git@github.com:.insteadOf
```

**Expected Output:**
```
https://github.com/
```

#### 5. Full Status Check

```bash
dotfiles ssh
```

This command checks all authentication components and shows current status.

---

## Troubleshooting

### Common Issues

#### ❌ "Permission denied (publickey)"

**Causes:**
- 1Password desktop app is locked/closed
- SSH key not added to 1Password vault
- SSH config not properly set up

**Solutions:**

1. **Unlock 1Password**
   ```bash
   # Make sure 1Password desktop app is running and unlocked
   open -a "1Password"
   ```

2. **Verify SSH config**
   ```bash
   cat ~/.ssh/config
   ```

   Should contain:
   ```
   Host *
       IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
   ```

3. **Add SSH key to 1Password**
   - Open 1Password desktop app
   - Create new item → SSH Key
   - Add key to GitHub: Settings → SSH Keys

#### ❌ "Could not open a connection to your authentication agent"

**Cause:** 1Password desktop app is not running

**Solution:**
```bash
open -a "1Password"
```

#### ❌ "No such identity: /Users/.../.ssh/1Password/..."

**Cause:** SSH key not in 1Password vault

**Solution:**
1. Open 1Password desktop app
2. Go to Settings → Developer
3. Enable "Use the SSH Agent"
4. Add SSH key to vault:
   - New Item → SSH Key
   - Fill in details
   - Save

#### ❌ `ssh-add -l` shows "Error connecting to agent"

**Cause:** SSH agent not running or wrong socket path

**Solution:**
```bash
# Check 1Password SSH agent socket
ls -la "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"

# If missing, check 1Password settings:
# 1Password → Settings → Developer → Use the SSH Agent
```

#### ❌ Git still prompts for password

**Cause:** Repository uses HTTPS, not SSH

**Solutions:**

1. **Check current remote:**
   ```bash
   git remote -v
   ```

2. **If using HTTPS, switch to SSH:**
   ```bash
   git remote set-url origin git@github.com:user/repo.git
   ```

3. **Verify URL rewriting is enabled:**
   ```bash
   git config --global url."git@github.com:".insteadOf https://github.com/
   ```

---

## Alternative: Traditional SSH Keys

If you prefer traditional SSH keys instead of 1Password:

### Setup Steps

#### 1. Generate SSH Key

```bash
# Generate new ED25519 key (recommended)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Or RSA if ED25519 not supported
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**Prompts:**
```
Enter file in which to save the key: (press Enter for default)
Enter passphrase: (optional, but recommended)
```

#### 2. Add Key to SSH Agent

```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519
```

#### 3. Copy Public Key

```bash
# Copy to clipboard (macOS)
pbcopy < ~/.ssh/id_ed25519.pub

# Or display to copy manually
cat ~/.ssh/id_ed25519.pub
```

#### 4. Add Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Paste your public key
4. Click "Add SSH key"

#### 5. Update SSH Config

Edit `~/.ssh/config`:
```bash
Host github.com
    IdentityFile ~/.ssh/id_ed25519
    UseKeychain yes      # Store passphrase in keychain (macOS)
    AddKeysToAgent yes
```

#### 6. Test Connection

```bash
ssh -T git@github.com
```

### Remove 1Password SSH Agent

If switching to traditional keys:

1. **Disable in 1Password:**
   - 1Password → Settings → Developer
   - Uncheck "Use the SSH Agent"

2. **Update ~/.ssh/config:**
   ```bash
   # Remove or comment out:
   # IdentityAgent "..."
   ```

3. **Restart terminal**

---

## FAQ

### Why does `ssh-add -l` show no keys?

This is **expected behavior** with 1Password SSH Agent. Keys are provided on-demand, not pre-loaded into the agent.

To verify keys are available, test the actual SSH connection:
```bash
ssh -T git@github.com
```

### Do I need to generate SSH keys?

No! With 1Password SSH Agent, you create keys directly in 1Password:
1. Open 1Password
2. New Item → SSH Key
3. Save
4. Add public key to GitHub/GitLab/etc.

### Where are my SSH keys stored?

**With 1Password:** Encrypted in your 1Password vault
**Without 1Password:** `~/.ssh/id_ed25519` (private), `~/.ssh/id_ed25519.pub` (public)

### Can I use both 1Password and traditional keys?

Yes! SSH will try 1Password agent first, then fall back to traditional keys in `~/.ssh/`.

### How do I see my public key?

**With 1Password:**
1. Open 1Password desktop app
2. Find your SSH key item
3. Copy "public key" field

**With traditional keys:**
```bash
cat ~/.ssh/id_ed25519.pub
```

### Will this work on other machines?

**With 1Password:** Yes! Install 1Password on new machine, sign in, enable SSH agent.
**With traditional keys:** No. Must copy `~/.ssh/` directory to new machine.

### Is 1Password SSH Agent secure?

Yes! Benefits:
- Keys never written to disk unencrypted
- TouchID/biometric unlock required
- Centralized key management
- Automatic key rotation support
- Audit logs in 1Password

### Can I use this for servers (not just GitHub)?

Yes! Add SSH keys to 1Password for any server:
1. Create SSH key item in 1Password
2. Add public key to server's `~/.ssh/authorized_keys`
3. Connect normally: `ssh user@server.com`

---

## Quick Reference

### Check Status
```bash
dotfiles ssh                         # Full status check
op whoami                            # 1Password signed in?
ssh -T git@github.com                # GitHub SSH working?
git remote -v                        # Using SSH or HTTPS?
```

### Common Commands
```bash
# Test SSH connection
ssh -T git@github.com

# Check SSH config
cat ~/.ssh/config

# View git remote URLs
git remote -v

# Switch remote from HTTPS to SSH
git remote set-url origin git@github.com:user/repo.git

# Sign in to 1Password CLI
op signin
```

### Files to Check
```
~/.ssh/config                        # SSH configuration
~/.gitconfig                         # Git URL rewriting
~/.config/op/plugins.sh              # 1Password CLI plugins
```

---

## Resources

### Documentation
- **1Password SSH:** https://developer.1password.com/docs/ssh/
- **GitHub SSH:** https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- **SSH Config:** https://man.openbsd.org/ssh_config

### Tools
- `op` - 1Password CLI
- `ssh` - SSH client
- `ssh-agent` - SSH agent
- `ssh-add` - Manage SSH keys
- `gh` - GitHub CLI (also uses 1Password)

---

**Last Updated**: 2025-01-03
**View Online**: Run `dotfiles docs ssh`
**Quick Check**: Run `dotfiles ssh` to verify your setup

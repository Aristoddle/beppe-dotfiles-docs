# Latest Updates (as of 2025-11-18)

- Core toolchain overlay built from source (curl/rsync/ssh/git/tar/coreutils/grep, OpenSSL 3.3.2, IDN2/PSL, zstd/lz4/xxhash):
  `docs/updates/2025-11-18-core-toolchain.md`
- Security fixes roundup: `SECURITY_FIXES_2025-11-15.md`
- zsh performance audit: `ZSH_PERFORMANCE_AUDIT_2025-11-15.md`

PATH/MANPATH guard (appended to avoid shadowing `uname` for gitstatus):
```
if [ -d "$HOME/Documents/Code/core-build/install/bin" ]; then
  export PATH="$PATH:$HOME/Documents/Code/core-build/install/bin"
fi
if [ -d "$HOME/Documents/Code/core-build/install/share/man" ]; then
  export MANPATH="$HOME/Documents/Code/core-build/install/share/man:${MANPATH:-}"
fi
```

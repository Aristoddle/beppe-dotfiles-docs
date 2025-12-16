# Core Toolchain Build (2025-11-18)

Prefix: `~/Documents/Code/core-build/install`

Built from source (Apple clang 17.0.0, SDK `$(xcrun --show-sdk-path)`, flags `-O2 -pipe -fstack-protector-strong -D_FORTIFY_SOURCE=2 -mcpu=apple-m1 -Wl,-dead_strip`):

- OpenSSL 3.3.2
- libiconv 1.17
- libunistring 1.2
- libidn2 2.3.7
- libpsl 0.21.5
- curl 8.10.1 (OpenSSL, IDN2, PSL)
- rsync 3.3.0 (zstd/lz4/xxhash enabled)
- OpenSSH 9.8p1 (OpenSSL)
- coreutils 9.5
- grep 3.11
- GNU sed 4.9
- git 2.47.0 (OpenSSL)
- GNU tar 1.35

Path opt-in (appended to avoid shadowing utilities gitstatus relies on):
```
if [ -d "$HOME/Documents/Code/core-build/install/bin" ]; then
  export PATH="$PATH:$HOME/Documents/Code/core-build/install/bin"
fi
if [ -d "$HOME/Documents/Code/core-build/install/share/man" ]; then
  export MANPATH="$HOME/Documents/Code/core-build/install/share/man:${MANPATH:-}"
fi
```

Notes:
- All binaries and man pages live under the prefix; system tools remain untouched.
- curl is built without HTTP/3; enabling it would require nghttp3/ngtcp2.

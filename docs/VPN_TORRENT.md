# VPN + Torrent Client (Mullvad + Gluetun + Transmission)

Practical recipe, distilled from the media stack work. Keeps secrets out of git and avoids common pitfalls.

## Required env (export before docker compose up)
- `MULLVAD_WG_PRIVATE_KEY` — WireGuard private key
- `MULLVAD_WG_ADDRESSES` — **IPv4 only** (e.g., `10.x.x.x/32`)
- `MULLVAD_COUNTRY` — use `USA`
- `MULLVAD_CITY` — e.g., `New York NY`
- `MULLVAD_ACCOUNT` — optional (only needed if you regenerate keys)
- Optional hostname: `MULLVAD_HOSTNAME=us-nyc-001`

Keep these in an untracked `.env.local` or 1Password; do not commit.

## Compose tips (gluetun + transmission)
- Put transmission on `network_mode: service:gluetun`; **do not** set hostname or publish ports on transmission itself.
- Publish host ports from gluetun instead, e.g.:
  - `9093:9091` (Transmission UI/RPC)
  - `51413:51413` TCP/UDP
- Allow LAN: set gluetun `FIREWALL=on` (default); use `SERVER_COUNTRIES=USA`, `SERVER_CITIES=New York NY`.
- Avoid the `/gluetun` volume unless you manage permissions/SELinux; transient FS is fine.

## WireGuard generation (Mullvad API)
1) Generate keypair locally:
   ```bash
   umask 077
   wg genkey > /tmp/mullvad_wg_private.key
   wg pubkey < /tmp/mullvad_wg_private.key > /tmp/mullvad_wg_public.key
   ```
2) Register public key with Mullvad:
   ```bash
   MULLVAD_ACCOUNT=<your account>
   PUBLIC=$(cat /tmp/mullvad_wg_public.key)
   curl -s -X POST https://api.mullvad.net/wg/ -d account=${MULLVAD_ACCOUNT} --data-urlencode pubkey=${PUBLIC} \
     -o /tmp/mullvad_wg_response.json
   ```
   - Extract IPv4 address: `jq -r '.ipv4_addr_in' /tmp/mullvad_wg_response.json`
3) Set env vars (example):
   ```bash
   export MULLVAD_WG_PRIVATE_KEY=$(cat /tmp/mullvad_wg_private.key)
   export MULLVAD_WG_ADDRESSES=10.69.163.158/32
   export MULLVAD_COUNTRY=USA
   export MULLVAD_CITY="New York NY"
   ```
   Store the values in 1Password or `.env.local`; clear /tmp afterward.

## Health checks
- VPN IP: `sudo docker exec gluetun wget -qO- https://ipinfo.io/ip`
- Transmission RPC: `curl -sI http://localhost:9093/transmission/rpc`
- Inside gluetun: `sudo docker exec gluetun netstat -tlnp | grep 9091`

## Sonarr/Radarr settings (when transmission is behind gluetun)
- Host: `gluetun`
- Port: `9091`
- URL Base: `/transmission/`
- Categories: tv-sonarr / radarr (or your preferred)
- Authentication: off (if you disabled RPC auth); otherwise set user/pass.

## Gotchas & fixes
- “Private key not set” or gluetun exits: ensure `MULLVAD_WG_PRIVATE_KEY` is exported.
- IPv6 in addresses → gluetun exits. Use IPv4 only.
- Permission denied on `/gluetun/servers.json`: avoid binding `/gluetun` or fix perms/SELinux; transient FS is fine.
- Port conflicts: publish only on gluetun; don’t publish on transmission when using `network_mode`.

## Safe restart snippet
```bash
export $(grep -v '^#' .env.local | xargs)  # or load from op
sudo -E docker compose \
  -f docker-compose.yml \
  -f docker-compose.override.yml \
  -f docker-compose.vpn-mullvad.yml \
  up -d gluetun transmission
```

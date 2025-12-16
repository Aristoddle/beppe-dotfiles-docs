# Bazzite (Fedora Atomic) Notes

## System Snapshot
- Hostname: steambox
- OS: Bazzite 43.20251210.1 (Fedora Atomic/rpm-ostree)
- User: deck (UID/GID 1000)
- Layered rpm-ostree packages (current): `1password`, `1password-cli`, `zsh`, `moby-engine`, `docker-buildx`, `docker-compose-switch`, `ulauncher`
- Planned next layer: `wmctrl` (for reliable `ulauncher-toggle` focus)

## Container Runtime Policy
- **Default:** Podman (preinstalled). Use podman/podman-compose; prefer Podman-first for day-to-day containers.
- **Podman shim for docker CLI:** optional `podman-docker` RPM (not installed).
- **If you truly need Docker Engine/Compose on host (mutable choice):**
  1) `sudo rpm-ostree install moby-engine docker-compose-plugin docker-buildx-plugin`
  2) Reboot → `sudo systemctl enable --now docker`
  3) `sudo usermod -aG docker $USER` → relog/newgrp
  Notes: layers persist across normal rpm-ostree upgrades; re-check only after a rebase to a different image.
- **Safer alternative:** run Docker inside a dedicated distrobox and export the CLI; keeps host immutable.

## Docs & Scripts
- Bootstrap: `scripts/bazzite-bootstrap.sh` (see `docs/BAZZITE_BOOTSTRAP.md` for full flow).
- Tooling/layers philosophy: `docs/BAZZITE_TOOLS.md` (host vs distrobox vs rpm-ostree).
- Recovery/immutable OS guidance: `docs/RECOVERY_INSTRUCTIONS.md`.

## To Do (if enabling host Docker)
- Decide on host Docker vs Podman-only vs docker-in-distrobox.
- If host Docker: layer moby packages (above), enable service, add user to docker group.
- Once container runtime is chosen, run the media stack (Swarm/compose) with `.env.local` secrets.

## Desktop QoL
- Ulauncher is layered; after reboot set GNOME shortcut to `ulauncher-toggle` (suggested: Super+Space). Install/layer `wmctrl` for window focus reliability.

## rpm-ostree Guardrails (read before layering)
- Layering is a **last resort**; Bazzite docs warn it can block updates/rebases until removed. Reboot is always required after layering. Prefer Flatpak/Distrobox/brew first. citeturn0search1
- Layered packages **persist across updates/rebases**; conflicts can be resolved with `rpm-ostree reset` or uninstalling the layer. citeturn0search4
- If layering third-party COPR/RPM: add repo, layer package, reboot; if updates fail, remove the repo and the layered package, then retry.

## Ulauncher hotkey (Wayland)
1) Ensure `wmctrl` is layered (already queued).  
2) Set Ulauncher’s built-in hotkey to an unused combo.  
3) GNOME Settings → Keyboard → Custom Shortcut → command `ulauncher-toggle`, bind to Super+Space. citeturn0search0

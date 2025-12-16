# EmuDeck Emulation Setup Guide

**For**: Comprehensive emulation setup on Steam Deck and Bazzite
**Companion to**: `BAZZITE_BOOTSTRAP.md`, `STEAM_DECK_SETUP.md`
**Goal**: Complete retro gaming setup with cloud saves, achievements, and optimal configurations

---

## CONTEXT FOR CLAUDE AGENTS

```
Systems: Steam Deck (LCD/OLED) + Bazzite (AMD 7840HS + Radeon 780M)
Username: deck (UID 1000, GID 1000) - REQUIRED for SD card compatibility
Emulation stack: EmuDeck + RetroArch + standalone emulators
Storage: Internal + SD card (ROMs, saves, BIOS files)
Sync: Syncthing for save states between devices
Cloud: EmuDeck CloudSync (premium) + manual sync options

Key standards:
- ROM folders use lowercase names (EmuDeck convention)
- BIOS files go in ~/Emulation/bios/
- Saves sync via ~/Emulation/saves/
- Steam ROM Manager integrates with Steam Library
- RetroAchievements for achievement tracking
```

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [EmuDeck Installation](#emudeck-installation)
3. [ROM Folder Structure](#rom-folder-structure)
4. [BIOS Requirements by System](#bios-requirements-by-system)
5. [Recommended Emulators by System](#recommended-emulators-by-system)
6. [Cloud Save Sync (EmuDeck <-> Bazzite)](#cloud-save-sync)
7. [RetroAchievements Setup](#retroachievements-setup)
8. [Steam ROM Manager Configuration](#steam-rom-manager-configuration)
9. [Performance Settings by System](#performance-settings-by-system)
10. [Controller Configuration](#controller-configuration)
11. [Artwork Scraping](#artwork-scraping)
12. [Troubleshooting](#troubleshooting)

---

## Quick Reference

| Task | Command/Location |
|------|------------------|
| Install EmuDeck (Bazzite) | `ujust install-emudeck` |
| Install EmuDeck (Steam Deck) | Download from https://www.emudeck.com/ |
| ROM folder | `~/Emulation/roms/<system>/` |
| BIOS folder | `~/Emulation/bios/` |
| Saves folder | `~/Emulation/saves/` |
| Update EmuDeck | Run EmuDeck app -> "Update EmuDeck" |
| Steam ROM Manager | Desktop Mode -> EmuDeck -> Steam ROM Manager |
| RetroArch | Desktop Mode -> EmuDeck -> RetroArch |

---

## EmuDeck Installation

### Bazzite Installation (Recommended)

```bash
# Using ujust (fastest method)
ujust install-emudeck

# This installs:
# - EmuDeck core scripts
# - RetroArch + cores
# - Standalone emulators (PCSX2, Dolphin, RPCS3, etc.)
# - Steam ROM Manager
# - EmuDeck app for configuration
```

**During Setup**:
1. Choose installation location:
   - **Internal**: `~/Emulation` (256GB-1TB)
   - **SD Card**: `/run/media/deck/<CardName>/Emulation` (RECOMMENDED for large ROM libraries)
2. Accept default emulator choices (can customize later)
3. Enable Steam ROM Manager integration
4. Configure RetroAchievements (optional, see below)

### Steam Deck Installation

```bash
# Desktop Mode method
# 1. Download EmuDeck installer
curl -L https://www.emudeck.com/EmuDeck.desktop -o ~/Desktop/EmuDeck.desktop
chmod +x ~/Desktop/EmuDeck.desktop

# 2. Run installer from Desktop
./Desktop/EmuDeck.desktop

# OR use browser method:
# 1. Switch to Desktop Mode
# 2. Open Firefox/Chromium
# 3. Go to https://www.emudeck.com/
# 4. Click "Download EmuDeck"
# 5. Run the installer
```

**First Run Wizard**:
- Installation Type: **Custom** (for full control) or **Easy Mode** (defaults)
- Installation Location: SD Card recommended
- RetroArch: **Yes**
- Standalone Emulators: Select systems you need
- Steam ROM Manager: **Yes**
- EmulationStation-DE: **Optional** (alternative frontend)

### Verify Installation

```bash
# Check EmuDeck installation
ls ~/Emulation/
# Should show: bios/ hdpacks/ roms/ saves/ storage/ tools/

# Check emulators
ls ~/Applications/
# Should show: RetroArch.AppImage, PCSX2-Qt.AppImage, Dolphin.AppImage, etc.

# Test RetroArch
~/Applications/RetroArch.AppImage --version
```

---

## ROM Folder Structure

EmuDeck uses **lowercase folder names** by default. Place ROMs in the appropriate folder:

```
~/Emulation/roms/
├── 3do/              # 3DO Interactive Multiplayer
├── amiga/            # Commodore Amiga
├── amstradcpc/       # Amstrad CPC
├── arcade/           # MAME/FinalBurn Neo ROMs
├── atari2600/        # Atari 2600
├── atari5200/        # Atari 5200
├── atari7800/        # Atari 7800
├── atarilynx/        # Atari Lynx
├── atarist/          # Atari ST
├── c64/              # Commodore 64
├── dreamcast/        # Sega Dreamcast (.cdi, .gdi, .chd)
├── easyrpg/          # RPG Maker 2000/2003
├── fds/              # Famicom Disk System
├── gamecube/         # Nintendo GameCube (.iso, .gcm, .rvz)
├── gb/               # Game Boy (.gb)
├── gba/              # Game Boy Advance (.gba)
├── gbc/              # Game Boy Color (.gbc)
├── genesis/          # Sega Genesis/Mega Drive
├── mastersystem/     # Sega Master System
├── megadrive/        # Sega Mega Drive (Europe) - symlink to genesis
├── n3ds/             # Nintendo 3DS (.3ds, .cia, .cxi)
├── n64/              # Nintendo 64 (.z64, .n64, .v64)
├── nds/              # Nintendo DS (.nds)
├── neogeo/           # Neo Geo
├── nes/              # Nintendo Entertainment System (.nes)
├── ngc/              # GameCube (alternate folder)
├── pcengine/         # PC Engine / TurboGrafx-16
├── pico8/            # PICO-8
├── ps2/              # PlayStation 2 (.iso, .chd, .bin)
├── psp/              # PlayStation Portable (.iso, .cso, .pbp)
├── psx/              # PlayStation 1 (.bin/.cue, .chd, .pbp)
├── saturn/           # Sega Saturn (.cue/.bin, .chd, .mds/.mdf)
├── scummvm/          # ScummVM games
├── sega32x/          # Sega 32X
├── segacd/           # Sega CD / Mega CD
├── sfc/              # Super Famicom (Japan) - symlink to snes
├── snes/             # Super Nintendo Entertainment System (.sfc, .smc)
├── switch/           # Nintendo Switch (.nsp, .xci)
├── virtualboy/       # Nintendo Virtual Boy
├── wii/              # Nintendo Wii (.iso, .wbfs, .rvz)
├── wiiu/             # Nintendo Wii U
└── wonderswan/       # WonderSwan
```

### ROM File Format Recommendations

| System | Preferred Format | Alternative | Notes |
|--------|------------------|-------------|-------|
| PS1 | `.chd` | `.bin/.cue`, `.pbp` | CHD = smaller, single file |
| PS2 | `.chd` | `.iso` | CHD saves 30-50% space |
| Dreamcast | `.chd` | `.gdi`, `.cdi` | CHD most compatible |
| Saturn | `.chd` | `.bin/.cue` | CHD reduces load times |
| GameCube | `.rvz` | `.iso` | RVZ = Dolphin's compressed format |
| Wii | `.rvz` | `.wbfs`, `.iso` | RVZ smaller than WBFS |
| N64 | `.z64` | `.n64`, `.v64` | Z64 = big-endian (best) |
| DS/3DS | `.nds`, `.3ds` | `.cia` (3DS) | CIA = installable format |
| PSP | `.cso` | `.iso` | CSO = compressed ISO |

### Converting ROMs to CHD

```bash
# Install chdman (part of MAME tools)
# Bazzite/Fedora:
rpm-ostree install mame-tools
systemctl reboot

# Ubuntu/Debian:
sudo apt install mame-tools

# Convert PS1 .bin/.cue to .chd
chdman createcd -i game.cue -o game.chd

# Convert PS2 .iso to .chd
chdman createdvd -i game.iso -o game.chd

# Convert Dreamcast .gdi to .chd
chdman createcd -i game.gdi -o game.chd

# Batch convert all .iso files in directory
for file in *.iso; do
  chdman createdvd -i "$file" -o "${file%.iso}.chd"
done
```

---

## BIOS Requirements by System

**Location**: All BIOS files go in `~/Emulation/bios/`

### Critical BIOS Files (Won't Work Without These)

| System | BIOS Files | MD5 Hash | Notes |
|--------|------------|----------|-------|
| **PlayStation 1** | `scph5501.bin` | 490f666e1afb15b7362b406ed1cea246 | USA BIOS (required) |
| | `scph5500.bin` | 8dd7d5296a650fac7319bce665a6a53c | Japan BIOS (optional) |
| | `scph5502.bin` | 32736f17079d0b2b7024407c39bd3050 | Europe BIOS (optional) |
| **PlayStation 2** | `SCPH-70012.bin` | d333558cc14561c1fdc334c75d5f37b7 | USA BIOS (v12+) |
| | `ps2-0230a-20080220.bin` | dc752f160044f2ed5fc1f4964db2a095 | Japan BIOS (alt) |
| **Sega Saturn** | `saturn_bios.bin` | af5828fdff51384f99b3c4926be27762 | Japan/USA BIOS |
| | `mpr-17933.bin` | 3240872c70984b6cbfda1586cab68dbe | Europe BIOS |
| **Sega CD** | `bios_CD_U.bin` | 2efd74e3232ff260e371b99f84024f7f | USA BIOS |
| | `bios_CD_E.bin` | e66fa1dc5820d254611fdcdba0662372 | Europe BIOS |
| | `bios_CD_J.bin` | 278a9397d192149e84e820ac621a8ade | Japan BIOS |
| **Dreamcast** | `dc_boot.bin` | e10c53c2f8b90bab96ead2d368858623 | Boot ROM |
| | `dc_flash.bin` | 0a93f7940c455905bea6e392dfde92a4 | Flash ROM |
| **GameCube/Wii** | No BIOS required | - | Dolphin uses HLE |
| **Nintendo DS** | `bios7.bin` | df692a80a5b1bc90728bc3dfc76cd948 | ARM7 BIOS |
| | `bios9.bin` | a392174eb3e572fed6447e956bde4b25 | ARM9 BIOS |
| | `firmware.bin` | 145eaef5bd3037cbc247c213bb3da1b3 | DS Firmware |
| **Nintendo 3DS** | Requires dumped keys | - | Use Citra/Lime3DS |
| **PSP** | No BIOS required | - | PPSSPP uses HLE |

### Optional BIOS Files (Enhanced Compatibility)

| System | BIOS Files | Purpose |
|--------|------------|---------|
| **PC Engine CD** | `syscard3.pce` | Super CD-ROM² support |
| **Neo Geo** | `neogeo.zip` | Contains: `000-lo.lo`, `sfix.sfix`, `sp-s2.sp1`, etc. |
| **Atari 5200** | `5200.rom` | Required for some games |
| **Amiga** | `kick34005.A500` | Kickstart ROM |

### Where to Get BIOS Files

**Legal Options**:
1. **Dump from your own console** (100% legal):
   - PS1/PS2: Use FreeMcBoot + BIOS dumper
   - DS: Use GodMode9 (3DS) or TWiLight Menu++
   - Dreamcast: Use DreamShell
2. **RetroArch Online Updater** (some systems):
   - RetroArch -> Online Updater -> Update System Files

**BIOS Verification**:

```bash
# Check MD5 hash of BIOS file
md5sum ~/Emulation/bios/scph5501.bin
# Should match: 490f666e1afb15b7362b406ed1cea246

# Verify all BIOS files
cd ~/Emulation/bios
md5sum -c ~/Emulation/tools/bios-checksums.txt
```

---

## Recommended Emulators by System

EmuDeck installs multiple emulators per system. Here are the best choices:

| System | Best Emulator | Alternative | Notes |
|--------|---------------|-------------|-------|
| **NES** | Mesen | RetroArch (Nestopia) | Mesen = accuracy + features |
| **SNES** | Snes9x | RetroArch (bsnes) | bsnes = more accurate, slower |
| **N64** | Mupen64Plus-Next | ParaLLEl N64 | ParaLLEl needs Vulkan |
| **GameCube/Wii** | Dolphin (standalone) | - | Best performance + features |
| **Game Boy/GBC/GBA** | mGBA | RetroArch (mGBA core) | Standalone has better settings |
| **DS** | melonDS | DeSmuME | melonDS = better performance |
| **3DS** | Citra (Lime3DS fork) | - | Lime3DS is actively maintained |
| **PSP** | PPSSPP (standalone) | - | Best compatibility + upscaling |
| **PS1** | DuckStation | RetroArch (Beetle PSX HW) | DuckStation = modern features |
| **PS2** | PCSX2 | - | Requires BIOS |
| **Dreamcast** | Flycast | RetroArch (Flycast core) | Standalone has better settings |
| **Saturn** | Beetle Saturn | Yabause | Beetle = accuracy |
| **Genesis/MD** | Genesis Plus GX | BlastEm | Genesis Plus GX = compatibility |
| **Arcade** | MAME (standalone) | FinalBurn Neo | MAME = accuracy, FBN = speed |
| **Switch** | Yuzu (if available) | Ryujinx | Both discontinued, use forks |

### Changing Default Emulator

**Via EmuDeck App**:
1. Desktop Mode -> EmuDeck
2. Click "Manage Emulators"
3. Select system
4. Choose preferred emulator
5. Save changes

**Via Steam ROM Manager**:
1. Open Steam ROM Manager
2. Settings -> Parsers
3. Edit parser for system
4. Change "Executable" path
5. Save and regenerate app list

---

## Cloud Save Sync

### Strategy: Multi-Tier Sync

**Tier 1: EmuDeck CloudSync (Premium, $3/month)**
- Official EmuDeck cloud service
- Automatic sync across devices
- Supports: RetroArch saves, standalone emulator saves
- Setup: EmuDeck app -> CloudSync -> Sign in

**Tier 2: Syncthing (Free, Manual Setup)**
- Open-source sync between Steam Deck <-> Bazzite
- Real-time sync when both devices online
- No file size limits

**Tier 3: Manual Backup (Fallback)**
- Copy saves to external storage
- Use when internet unavailable

### Option 1: EmuDeck CloudSync (Easiest)

**Requirements**:
- EmuDeck CloudSync subscription ($3/month or $30/year)
- Chromium browser (Firefox has OAuth bug)
- Same EmuDeck account on all devices

**Setup on Steam Deck**:

```bash
# 1. Install Chromium (if not already installed)
flatpak install flathub org.chromium.Chromium

# 2. Open EmuDeck app
# Desktop Mode -> EmuDeck

# 3. Click "CloudSync"
# 4. Sign in with Google/GitHub/Discord
# 5. Subscribe to CloudSync ($3/month)
# 6. Enable sync for desired systems

# 7. Verify sync status
ls ~/.config/EmuDeck/cloudsync/
# Should show: config.json, sync.log
```

**Setup on Bazzite**:

```bash
# Same steps as Steam Deck
# Must use SAME account credentials

# CloudSync will automatically sync when:
# - Game is saved (upload)
# - Game is launched (download latest)
```

**Supported Systems**:
- RetroArch (all cores)
- PCSX2
- Dolphin (GameCube/Wii)
- PPSSPP
- Citra (3DS)
- DuckStation (PS1)

**Not Supported**:
- Yuzu/Ryujinx (Switch) - use manual sync
- RPCS3 (PS3) - use manual sync

### Option 2: Syncthing (Free Alternative)

**Install Syncthing on Both Devices**:

See `BAZZITE_BOOTSTRAP.md` and `STEAM_DECK_SETUP.md` for Syncthing setup.

**Configure Save Sync**:

```bash
# 1. Open Syncthing web UI: http://localhost:8385

# 2. Add folder to sync:
# Folder ID: emudeck-saves
# Folder Path: ~/Emulation/saves/
# Folder Type: Send & Receive

# 3. Share with other device
# Actions -> Edit -> Sharing -> Select device

# 4. Create .stignore in ~/Emulation/saves/
cat > ~/Emulation/saves/.stignore << 'EOF'
# Temporary files
*.tmp
*.lock
*.bak
.sync/

# Large state files (optional - sync only save files)
# Uncomment if you only want .sav, not .state files
# *.state
# *.state.auto
EOF

# 5. Force initial sync
# Syncthing UI -> Emudeck-saves -> Rescan
```

**Verify Sync**:

```bash
# Play game on Steam Deck, create save
# Wait 30 seconds
# Check on Bazzite:
ls -lh ~/Emulation/saves/<system>/
# Should show recently modified files
```

### Option 3: Manual Backup

**Quick Backup to SD Card**:

```bash
# Steam Deck -> SD Card
tar -czf /run/media/deck/SanDisk932/emudeck-saves-$(date +%Y%m%d).tar.gz \
  ~/Emulation/saves/

# Bazzite -> SD Card (mounted via USB)
tar -czf /mnt/SanDisk932/emudeck-saves-$(date +%Y%m%d).tar.gz \
  ~/Emulation/saves/
```

**Restore from Backup**:

```bash
# Extract to Emulation folder
tar -xzf /path/to/emudeck-saves-20251205.tar.gz -C ~/
```

### Save File Locations by Emulator

| Emulator | Save Location | File Types |
|----------|---------------|------------|
| **RetroArch** | `~/Emulation/saves/RetroArch/saves/` | `.sav`, `.srm` |
| **RetroArch States** | `~/Emulation/saves/RetroArch/states/` | `.state`, `.state.auto` |
| **PCSX2** | `~/Emulation/saves/pcsx2/saves/` | `.ps2` memory cards |
| **Dolphin** | `~/Emulation/saves/dolphin/Wii/` | Wii save files |
| | `~/Emulation/saves/dolphin/GC/` | GameCube memory cards |
| **PPSSPP** | `~/Emulation/saves/ppsspp/` | `.ppst` save states |
| **DuckStation** | `~/Emulation/saves/duckstation/` | `.sav` memory cards |
| **Citra** | `~/Emulation/saves/citra-emu/` | 3DS save data |
| **melonDS** | `~/Emulation/saves/melonds/` | `.sav`, `.dsv` |

---

## RetroAchievements Setup

RetroAchievements adds Xbox-style achievements to retro games (30,000+ games supported).

**Supported Systems**:
- NES, SNES, N64, Game Boy, GBA, DS
- Genesis, Master System, Game Gear, Sega CD, Saturn, Dreamcast
- PS1, PSP, PC Engine, Neo Geo, Atari 2600/7800

### Create RetroAchievements Account

```bash
# 1. Go to: https://retroachievements.org/
# 2. Click "Register"
# 3. Create account (free)
# 4. Verify email
```

### Configure in RetroArch

```bash
# 1. Launch RetroArch
~/Applications/RetroArch.AppImage

# 2. Settings -> Achievements
# - Enable Achievements: ON
# - Enable Hardcore Mode: ON (optional, disables save states/cheats)
# - Enable Test Mode: OFF
# - Username: <your RetroAchievements username>
# - Password: <your password>

# 3. Save configuration
# Main Menu -> Configuration File -> Save Current Configuration

# 4. Test with a game
# Load a game that has achievements
# Quick Menu -> Achievements -> View Achievement List
```

### Configure in Standalone Emulators

**DuckStation (PS1)**:

```bash
# Settings -> Achievements
# - Enable: ON
# - Username: <RetroAchievements username>
# - API Key: <from https://retroachievements.org/controlpanel.php>
# - Rich Presence: ON
# - Hardcore Mode: ON (optional)
```

**PPSSPP (PSP)**:

```bash
# Settings -> Tools -> RetroAchievements
# - Enable: ON
# - Username: <username>
# - Token: <API key>
```

### Verify Achievements Working

```bash
# 1. Load a game with achievements
# Example: Super Mario World (SNES)

# 2. Play and trigger an achievement
# Example: Collect first Yoshi coin

# 3. Check achievement notification
# Should see popup: "Achievement Unlocked: First Coin"

# 4. Verify on website
# Go to: https://retroachievements.org/user/<username>
# Should show unlocked achievement
```

### Troubleshooting Achievements

**"Invalid username or password"**:
- Double-check credentials on https://retroachievements.org/
- Use API key instead of password (found in Control Panel)

**"No achievements available for this game"**:
- Check if game has achievements: https://retroachievements.org/gameList.php
- Ensure using correct ROM version (USA ROMs preferred)

**Achievements not unlocking**:
- Disable "Enable Test Mode" in RetroArch
- Verify logged in (Quick Menu -> Achievements -> Show active challenges)
- Some games require specific emulator cores

---

## Steam ROM Manager Configuration

Steam ROM Manager (SRM) adds emulated games to your Steam Library with custom artwork.

### First-Time Setup

```bash
# 1. Launch Steam ROM Manager
# Desktop Mode -> EmuDeck -> Steam ROM Manager

# 2. Close Steam (REQUIRED)
# SRM cannot run while Steam is open

# 3. Configure Parsers
# Settings -> Parsers

# Enable parsers for systems you have ROMs for:
# ✓ Nintendo 64
# ✓ PlayStation 1
# ✓ SNES
# etc.

# 4. Test parsers
# Preview -> "Generate app list"
# Should show ROMs with artwork

# 5. Add to Steam
# "Save app list"
# Wait for completion

# 6. Restart Steam
# Gaming Mode -> Library
# Should see ROMs in "Non-Steam" category
```

### Parser Configuration

**Example: PlayStation 1**:

```yaml
Parser Type: Glob
Configuration Title: Sony PlayStation
Steam Category: ${Retro} PS1
Steam Directory: /home/deck/.steam/steam
ROMs Directory: /home/deck/Emulation/roms/psx
Executable:
  - /home/deck/Applications/DuckStation-x64.AppImage
Command Line Arguments:
  - -fullscreen "${filePath}"
ROMs File Filter:
  - *.chd
  - *.cue
  - *.pbp
Start In Directory: /home/deck/Emulation/roms/psx
```

**Customize Categories**:

```bash
# Settings -> Parsers -> <System> -> Steam Category

# Examples:
# - ${Retro} NES       -> Category: "Retro NES"
# - ${Platform} ${System} -> "Sony PlayStation 1"
# - Emulated Games     -> All in one category
```

### Artwork Sources

SRM automatically downloads artwork from:
1. **SteamGridDB** (primary, best quality)
2. **ConsoleGrid** (backup)
3. **Local files** (`~/Emulation/tools/downloaded_media/`)

**Custom Artwork**:

```bash
# Manual artwork placement
~/Emulation/tools/downloaded_media/
├── <ROM Name>/
│   ├── grid.png        # Grid view (600x900)
│   ├── hero.png        # Hero banner (1920x620)
│   ├── logo.png        # Game logo (transparent)
│   └── icon.png        # Icon (256x256)
```

**Artwork Optimization**:

```bash
# Settings -> Image Providers
# - SteamGridDB: Enabled
# - ConsoleGrid: Enabled (backup)
# - Priority: SteamGridDB first

# Settings -> Artwork Only
# - Grid: Best quality
# - Hero: Best quality
# - Logo: Best quality
# - Icon: Best quality
```

---

## Performance Settings by System

### Steam Deck (LCD/OLED)

| System | TDP | GPU Clock | Resolution | FPS | Notes |
|--------|-----|-----------|------------|-----|-------|
| **NES/SNES/GB/GBA** | 5W | Auto | Native | 60 | Battery: 6-8 hours |
| **N64** | 7W | Auto | 1.5x native | 60 | Most games full speed |
| **PS1** | 7W | Auto | 2x native | 60 | DuckStation upscaling |
| **PS2** | 12-15W | 1200 MHz | Native | 30-60 | Heavy games lag |
| **GameCube** | 10W | 1000 MHz | 1.5x native | 60 | Most games full speed |
| **Wii** | 10W | 1000 MHz | 1.5x native | 60 | Same as GameCube |
| **PSP** | 8W | Auto | 2x native | 60 | PPSSPP upscaling |
| **Dreamcast** | 8W | Auto | 2x native | 60 | Flycast upscaling |
| **DS** | 6W | Auto | 2x native | 60 | melonDS upscaling |
| **3DS** | 12W | 1200 MHz | Native | 30-60 | New 3DS titles lag |

**TDP Control**:
- Gaming Mode: Hold ... button -> Performance -> TDP Limit
- Desktop Mode: Use Decky PowerTools plugin

### Bazzite (AMD 7840HS + Radeon 780M)

Much more powerful than Steam Deck. Can handle:

| System | Resolution | FPS | Enhancements | Notes |
|--------|------------|-----|--------------|-------|
| **PS2** | 2x-3x native | 60 | Texture filtering, widescreen | Most games full speed |
| **GameCube/Wii** | 4x native (2880p) | 60 | HD textures, widescreen | Perfect emulation |
| **3DS** | 4x native | 60 | Texture filtering | New 3DS games smooth |
| **PSP** | 4x-5x native | 60 | HD textures, filtering | Near-perfect |
| **Switch** | 1080p-1440p | 30-60 | Graphics mods | Yuzu/Ryujinx (if available) |
| **PS1** | 4x-8x native | 60 | PGXP, HD textures | Crystal clear |
| **N64** | 4x native | 60 | HD textures, widescreen | ParaLLEl performance |

**TDP Settings** (see `BAZZITE_BOOTSTRAP.md` for details):

```bash
# Set to max performance (55W)
sudo ryzenadj --stapm-limit=55000 --fast-limit=55000 --slow-limit=55000

# Or use SimpleDeckyTDP plugin in Gaming Mode
```

### Per-Emulator Performance Tweaks

**RetroArch**:

```bash
# Settings -> Video
# - Threaded Video: ON (better performance)
# - Vsync: ON (eliminate tearing)
# - Max Swapchain Images: 2
# - Hard GPU Sync: OFF

# Settings -> Frame Throttle
# - Fast-Forward Rate: 2x (for slow games)
# - Rewind: OFF (saves performance)
```

**PCSX2 (PS2)**:

```bash
# Settings -> Graphics
# - Renderer: Vulkan (best for AMD)
# - Upscale Multiplier: 2x-3x (Bazzite), 1x-2x (Deck)
# - Texture Filtering: Bilinear (PS2)
# - Anisotropic Filtering: 16x
# - Mipmapping: Basic (Fast)

# Settings -> Speedhacks
# - Enable all recommended speedhacks
# - MTVU (Multi-Threaded microVU1): ON
# - Instant VU1: ON
```

**Dolphin (GameCube/Wii)**:

```bash
# Graphics -> General
# - Backend: Vulkan
# - Adapter: AMD Radeon (auto)
# - Fullscreen Resolution: Auto (Native)
# - Enable "Render to Main Window"

# Graphics -> Enhancements
# - Internal Resolution: 2x-4x (Bazzite), 1.5x-2x (Deck)
# - Anisotropic Filtering: 16x
# - Anti-Aliasing: None (saves performance)
# - Scaled EFB Copy: ON

# Graphics -> Hacks
# - Skip EFB Access from CPU: ON (major speedup)
# - Ignore Format Changes: ON
# - Store EFB Copies to Texture Only: ON

# Graphics -> Advanced
# - Enable Progressive Scan: ON
# - Backend Multithreading: ON
```

**DuckStation (PS1)**:

```bash
# Settings -> Graphics
# - Renderer: Vulkan
# - Resolution Scale: 4x-8x (Bazzite), 2x-4x (Deck)
# - Texture Filtering: JINC2 (best quality)
# - True Color Rendering: ON
# - Scaled Dithering: ON
# - Widescreen Hack: ON (for 16:9)
# - PGXP Geometry Correction: ON (fixes wobbling)
# - Force NTSC Timings: ON (60 Hz)

# Settings -> Enhancements
# - Resolution Scale: 4x-8x
# - Texture Filtering: JINC2
# - Display Linear Filtering: ON
# - Display Integer Scaling: OFF
```

**PPSSPP (PSP)**:

```bash
# Settings -> Graphics
# - Backend: Vulkan
# - Rendering Resolution: 4x-5x (Bazzite), 2x-3x (Deck)
# - Anisotropic Filtering: 16x
# - Texture Filtering: Auto
# - Display Resolution: Window Size
# - Upscale Level: 5x (XBRZ)
# - Deposterize: ON
# - Lazy Texture Caching: ON
# - Retain Changed Textures: ON (speedup)
```

---

## Controller Configuration

### Gaming Mode (Automatic)

In Gaming Mode, Steam Input handles all controller mapping automatically.

**Default Layout**:
- A/B/X/Y: Face buttons
- L1/R1: Shoulder buttons
- L2/R2: Triggers
- Left Stick: Movement
- Right Stick: Camera
- D-Pad: D-Pad
- Select/Start: Menu buttons

**Per-Game Customization**:

```bash
# 1. Launch game in Gaming Mode
# 2. Press Steam button
# 3. Controller Settings
# 4. Edit Layout
# 5. Customize buttons
# 6. Save as new layout
```

### Desktop Mode (Per-Emulator)

**RetroArch**:

```bash
# Settings -> Input
# - Input Device: Steam Virtual Gamepad
# - Auto-Configuration: ON (default)

# Per-Core Remapping:
# Quick Menu -> Controls -> Port 1 Controls
# Remap buttons as desired
# Save Core Remap File
```

**Dolphin (GameCube/Wii)**:

```bash
# Controllers -> GameCube Controllers
# - Port 1: Standard Controller
# - Device: evdev/0/Steam Virtual Gamepad

# Configure buttons:
# Click "Configure"
# Click field, press button on Deck
# Map all buttons
# Save profile
```

**PCSX2 (PS2)**:

```bash
# Settings -> Controllers
# - Controller Type: DualShock 2
# - Device: Steam Virtual Gamepad

# Button Mapping:
# Click "Automatic Mapping"
# Or manually map each button
```

### External Controller Support

**Bluetooth Controllers**:

```bash
# Desktop Mode
# 1. Settings -> Bluetooth
# 2. Enable Bluetooth
# 3. Put controller in pairing mode
# 4. Select controller from list
# 5. Pair

# Gaming Mode
# 1. Steam button -> Settings -> Bluetooth
# 2. Same pairing process
```

**Supported Controllers**:
- Xbox One/Series X/S controllers
- PlayStation 4/5 DualShock/DualSense
- Nintendo Switch Pro Controller
- 8BitDo controllers
- Generic USB/Bluetooth gamepads

---

## Artwork Scraping

### Automatic Scraping (Steam ROM Manager)

SRM automatically downloads artwork when you add games. But you can manually scrape:

```bash
# 1. Open Steam ROM Manager
# 2. Settings -> Image Providers
# 3. SteamGridDB API Key (optional, increases rate limit):
#    - Go to: https://www.steamgriddb.com/profile/preferences/api
#    - Generate API key
#    - Paste in SRM settings
# 4. Preview -> "Generate app list"
# 5. Missing artwork will be downloaded automatically
```

### Manual Artwork Sources

**SteamGridDB** (best source):
- https://www.steamgriddb.com/
- Search for game
- Download: Grid, Hero, Logo, Icon
- Place in `~/Emulation/tools/downloaded_media/<Game Name>/`

**EmulationStation Artwork**:

```bash
# Install EmulationStation-DE (optional frontend)
# Desktop Mode -> EmuDeck -> EmulationStation-DE

# Scrape artwork:
# 1. Launch EmulationStation-DE
# 2. Start button -> Scraper
# 3. Select systems to scrape
# 4. Scraper source: ScreenScraper (best)
# 5. Start scraping
# 6. Wait for completion (can take 30+ minutes for large libraries)
```

**Bulk Download Scripts**:

```bash
# Skyscraper (advanced scraper)
# Install via Flatpak
flatpak install flathub org.kde.skyscraper

# Scrape ROMs for specific system
flatpak run org.kde.skyscraper -p snes -s screenscraper

# Generate EmulationStation gamelist
flatpak run org.kde.skyscraper -p snes
```

---

## Troubleshooting

### Game Won't Launch

**Symptom**: Game appears in Steam Library but doesn't launch

**Diagnosis**:

```bash
# 1. Check ROM file exists
ls -lh ~/Emulation/roms/<system>/<game file>

# 2. Check file permissions
chmod +r ~/Emulation/roms/<system>/<game file>

# 3. Check emulator exists
ls -lh ~/Applications/<emulator>.AppImage

# 4. Test emulator manually
~/Applications/RetroArch.AppImage ~/Emulation/roms/nes/game.nes
```

**Common Fixes**:
- Regenerate app list in Steam ROM Manager
- Verify ROM file format is supported
- Check BIOS files (for PS1/PS2/Saturn/etc.)
- Update emulator: EmuDeck app -> "Update Emulators"

### Poor Performance / Lag

**Symptom**: Game runs slowly, stutters, or drops frames

**Quick Fixes**:

```bash
# 1. Increase TDP (Gaming Mode)
# Hold ... button -> Performance -> TDP Limit -> 15W

# 2. Lower resolution (RetroArch)
# Quick Menu -> Options -> Internal GPU Resolution -> 1x

# 3. Disable enhancements (Dolphin/PCSX2)
# Graphics -> Enhancements -> Internal Resolution -> 1x
# Graphics -> Hacks -> Skip EFB Access from CPU -> ON

# 4. Use faster emulator core (RetroArch)
# Quick Menu -> Core -> Switch to alternative core
# Example: Switch from bsnes to Snes9x for SNES
```

**Bazzite-Specific** (see `BAZZITE_BOOTSTRAP.md`):

```bash
# Set max TDP (55W)
sudo ryzenadj --stapm-limit=55000 --fast-limit=55000 --slow-limit=55000

# Force high performance mode
powerprofilesctl set performance
```

### Black Screen on Launch

**Symptom**: Game launches but shows black screen

**Common Causes**:
1. **Missing BIOS** (PS1/PS2/Saturn/etc.)
2. **Wrong video backend** (Vulkan vs OpenGL)
3. **Corrupted ROM file**

**Fixes**:

```bash
# 1. Verify BIOS (for PS1 example)
md5sum ~/Emulation/bios/scph5501.bin
# Should match: 490f666e1afb15b7362b406ed1cea246

# 2. Switch video backend (RetroArch)
# Settings -> Video -> Driver -> gl (or vulkan)
# Restart RetroArch

# 3. Test ROM in different emulator
# If using RetroArch, try standalone emulator
# If PS1: Try DuckStation instead of Beetle PSX
```

### Save States Not Working

**Symptom**: Cannot create or load save states

**RetroArch**:

```bash
# 1. Check save state directory permissions
chmod -R u+w ~/Emulation/saves/RetroArch/states/

# 2. Verify save state enabled
# Quick Menu -> Save State
# Should show: "State #0" (or other slot)

# 3. Check disk space
df -h ~/Emulation/
# Ensure sufficient free space
```

**Standalone Emulators**:

```bash
# Each emulator has different save state location
# Check: Settings -> Paths -> Save States

# Dolphin
~/Emulation/saves/dolphin/StateSaves/

# PCSX2
~/Emulation/saves/pcsx2/sstates/

# DuckStation
~/Emulation/saves/duckstation/savestates/
```

### Syncthing Not Syncing Saves

**Symptom**: Saves don't sync between Steam Deck and Bazzite

**Diagnosis**:

```bash
# 1. Check Syncthing status
systemctl --user status syncthing
# Should show: active (running)

# 2. Check web UI: http://localhost:8385
# Both devices should show "Up to Date"

# 3. Check .stignore rules
cat ~/Emulation/saves/.stignore
# Ensure not ignoring .sav or .srm files

# 4. Force rescan
# Syncthing UI -> Emulation-saves -> Rescan
```

**Common Issues**:
- **Port conflict**: Ensure using port 8385, not 8384 (Decky uses 8384)
- **Firewall**: Allow port 22000 (TCP/UDP) and 21027 (UDP)
- **Different username**: Ensure ~/Emulation/saves/ path is identical on both devices

### ROM Not Showing in Steam Library

**Symptom**: ROM exists but doesn't appear after running Steam ROM Manager

**Fixes**:

```bash
# 1. Verify parser enabled
# SRM -> Settings -> Parsers -> <System> -> Enabled: ON

# 2. Check ROM file extension
# SRM -> Settings -> Parsers -> <System> -> ROMs File Filter
# Ensure your file extension is listed (e.g., *.chd, *.iso)

# 3. Check ROMs directory path
# SRM -> Settings -> Parsers -> <System> -> ROMs Directory
# Should match: /home/deck/Emulation/roms/<system>/

# 4. Remove exceptions
# SRM -> Preview -> Exceptions tab
# Remove any accidentally excluded games

# 5. Regenerate
# Preview -> Remove all entries -> Generate app list -> Save
```

### RetroAchievements Not Unlocking

**Symptom**: Playing game but achievements don't trigger

**Diagnosis**:

```bash
# 1. Verify logged in (RetroArch)
# Quick Menu -> Achievements -> Show active challenges
# Should show achievement list

# 2. Check game has achievements
# Go to: https://retroachievements.org/gameList.php
# Search for game

# 3. Verify correct ROM version
# USA ROMs are preferred
# Some achievements require specific ROM revision
```

**Common Issues**:
- **Test Mode enabled**: Settings -> Achievements -> Test Mode -> OFF
- **Wrong ROM**: Download USA version from trusted source
- **Hardcore mode**: Some achievements require Hardcore mode (no save states)

### Audio Crackling / Distortion

**Symptom**: Sound crackles, pops, or distorts during gameplay

**RetroArch Fixes**:

```bash
# Settings -> Audio
# - Audio Driver: pipewire (or try pulse)
# - Audio Latency: 64ms (increase if crackling persists)
# - Audio Sync: ON
# - Dynamic Rate Control: ON
```

**Bazzite Fixes**:

```bash
# Restart PipeWire
ujust restart-pipewire

# Or manually:
systemctl --user restart pipewire pipewire-pulse wireplumber
```

**Steam Deck Fixes**:

```bash
# Desktop Mode -> Settings -> Audio
# Change sample rate: 48000 Hz

# Or use Decky plugin:
# Install "Audio Loader" from Decky store
# Change audio profile
```

---

## Additional Resources

### Official Documentation

- **EmuDeck**: https://emudeck.github.io/
- **RetroArch**: https://docs.libretro.com/
- **PCSX2**: https://pcsx2.net/docs/
- **Dolphin**: https://dolphin-emu.org/docs/
- **PPSSPP**: https://www.ppsspp.org/docs/
- **RetroAchievements**: https://docs.retroachievements.org/

### ROM Management Tools

- **Romcenter**: https://www.romcenter.com/ (ROM organization)
- **CLRMAMEPro**: https://mamedev.emulab.it/clrmamepro/ (ROM verification)
- **Skyscraper**: https://github.com/muldjord/skyscraper (artwork scraper)

### Community Resources

- **r/EmuDeck**: https://reddit.com/r/EmuDeck
- **r/SteamDeck**: https://reddit.com/r/SteamDeck
- **EmuDeck Discord**: https://discord.gg/b9F7GpXtFP
- **RetroAchievements Discord**: https://discord.gg/dq2E4hE

### BIOS & ROM Sources (Legal)

**Dumping Your Own**:
- **PS1/PS2 BIOS**: FreeMcBoot + BIOS Dumper
- **DS/3DS**: GodMode9 (requires hacked 3DS)
- **GameCube/Wii**: CleanRip (Wii homebrew)

**Archive.org** (abandonware, legal gray area):
- https://archive.org/details/redump.psx
- https://archive.org/details/retroachievements_collection

---

## Related Documentation

- **BAZZITE_BOOTSTRAP.md** - Full Bazzite setup including EmuDeck installation
- **STEAM_DECK_SETUP.md** - Steam Deck development environment setup
- **QUICKSTART_NEW_MACHINE.md** - General machine bootstrap guide
- **TROUBLESHOOTING.md** - General troubleshooting for dotfiles and tools

---

## Quick Command Cheat Sheet

```bash
# Install EmuDeck (Bazzite)
ujust install-emudeck

# Update EmuDeck
~/Applications/EmuDeck.AppImage

# Launch RetroArch
~/Applications/RetroArch.AppImage

# Backup saves
tar -czf ~/emudeck-saves-backup.tar.gz ~/Emulation/saves/

# Restore saves
tar -xzf ~/emudeck-saves-backup.tar.gz -C ~/

# Convert ROM to CHD
chdman createcd -i game.cue -o game.chd

# Verify BIOS
md5sum ~/Emulation/bios/scph5501.bin

# Start Syncthing
systemctl --user start syncthing

# Check Syncthing status
systemctl --user status syncthing

# Force Syncthing rescan
# Web UI: http://localhost:8385 -> Rescan

# Set TDP to 15W (Steam Deck Gaming Mode)
# Hold ... button -> Performance -> TDP Limit -> 15W

# Set TDP to 55W (Bazzite)
sudo ryzenadj --stapm-limit=55000 --fast-limit=55000 --slow-limit=55000
```

---

**Last Updated**: 2025-12-05
**Tested On**: Steam Deck (LCD/OLED), Bazzite (AMD 7840HS + Radeon 780M)
**EmuDeck Version**: 2.2.x
**Maintained By**: Aristoddle

---

**Pro Tip**: Bookmark this guide in your shell:

```bash
# Add to ~/.config/zsh/aliases/emulation.zsh
alias emudeck-guide='glow ~/.local/share/chezmoi/docs/EMULATION_SETUP.md'
```

Then run: `emudeck-guide` to view this documentation anytime.

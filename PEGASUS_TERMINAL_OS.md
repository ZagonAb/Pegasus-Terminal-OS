# 🖥️ Pegasus Terminal OS - Command Reference

<div align="center">

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Pegasus_Frontend-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A terminal-based interface for Pegasus Frontend that emulates a Linux command-line environment**

[Quick Start](#quick-start) • [Commands](#commands) • [Tips & Tricks](#tips-and-tricks)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Commands](#-commands)
  - [Navigation](#1-navigation-commands)
  - [File System](#2-file-system-commands)
  - [Game Management](#3-game-management-commands)
  - [Collections](#4-collection-management)
  - [Favorites](#5-favorites-management)
  - [System Information](#6-system-information-commands)
  - [Search](#7-search-commands)
  - [History](#8-history-commands)
  - [System Control](#9-system-control-commands)
  - [Customization](#10-customization-commands)
  - [Visual Effects](#11-visual-effects)
  - [Game Notes](#12-game-notes-system)
  - [Utilities](#13-utility-commands)
- [Tips & Tricks](#-tips-and-tricks)
- [State Management](#-state-management)

---

## 🎯 Overview

Pegasus Terminal OS transforms Pegasus Frontend into a powerful terminal interface, giving you complete control over your game library through familiar Linux-style commands. Navigate collections, search games, manage favorites, and launch titles—all from the command line.

## 🚀 Quick Start

```bash
# Show system information
neofetch

# List all collections
collections

# Navigate to a collection
use snes

# Get game info
info @snes:5

# Launch a game
launch @snes:5
```

---

## 📦 Commands

### 1. Navigation Commands

<details>
<summary><b>cd</b> - Change Directory</summary>

**Description:** Change the current working directory

**Syntax:**
```bash
cd [path]
```

**Arguments:**
| Argument | Description | Default |
|----------|-------------|---------|
| `path` | Directory path to navigate to | `/` (root) |

**Special Paths:**
- `~` or empty → Navigate to home directory (`/home/<username>`)
- `All-Games` → All games collection
- `Favorites` → Favorite games
- `MostPlayed` → Most played games
- `LastPlayed` → Recently played games
- `/Collections/<shortName>/games` → Specific collection directory

**Examples:**
```bash
cd all-games
cd favorites
cd /Collections/snes/games
cd ~
```

**Aliases:** `chdir`

</details>

<details>
<summary><b>pwd</b> - Print Working Directory</summary>

**Description:** Display the current working directory with user-friendly path translation

**Syntax:**
```bash
pwd
```

**Output Examples:**
```
/home/user/All-Games
/home/user/Favorites
/home/user/Collections/snes/games
```

**Aliases:** None

</details>

---

### 2. File System Commands

<details>
<summary><b>ls</b> - List Directory Contents</summary>

**Description:** List files and directories in the current or specified location

**Syntax:**
```bash
ls [path] [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--limit=<n>` | Limit output to N items |
| `--head=<n>` | Show first N items |
| `--tail=<n>` | Show last N items |
| `--wide` | Display in column format |

**Examples:**
```bash
ls                          # List current directory
ls all-games --limit=20    # Show 20 games
ls --head=10               # Show first 10 items
ls --wide                  # Column format
```

**Aliases:** `dir`

</details>

<details>
<summary><b>ll</b> - List Directory Contents (Wide Format)</summary>

**Description:** List contents in wide column format with numbered game indices

**Syntax:**
```bash
ll [path]
```

**Features:**
- ✓ Automatically numbers games for easy reference
- ✓ Displays in 4-column format
- ✓ Shows collection names without prefixes

**Examples:**
```bash
ll                  # List current directory
ll all-games       # List all games in wide format
```

**Aliases:** None

</details>

<details>
<summary><b>head</b> - Show First N Items</summary>

**Description:** Display the first N items from a directory

**Syntax:**
```bash
head [n] [path]
```

**Arguments:**
| Argument | Description | Default |
|----------|-------------|---------|
| `n` | Number of items to show | 10 |
| `path` | Directory path | Current directory |

**Examples:**
```bash
head 2                # Show first 2 items
head 5 all-games     # Show first 5 games
```

**Aliases:** None

</details>

<details>
<summary><b>tail</b> - Show Last N Items</summary>

**Description:** Display the last N items from a directory

**Syntax:**
```bash
tail [n] [path]
```

**Arguments:**
| Argument | Description | Default |
|----------|-------------|---------|
| `n` | Number of items to show | 10 |
| `path` | Directory path | Current directory |

**Examples:**
```bash
tail 2                # Show last 2 items
tail 5 favorites     # Show last 5 favorites
```

**Aliases:** None

</details>

---

### 3. Game Management Commands

<details>
<summary><b>games</b> - List Games</summary>

**Description:** List games with flexible filtering options

**Syntax:**
```bash
games [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--collection=<name>` | List games from specific collection |
| `--limit=<n>` | Limit output to N games |

**Examples:**
```bash
games                              # List all games
games --collection=snes           # SNES games only
games --collection=all --limit=50 # First 50 games
```

**Aliases:** `list`, `g`

</details>

<details>
<summary><b>use</b> - Navigate to Collection</summary>

**Description:** Quickly navigate to a collection directory with detailed information

**Syntax:**
```bash
use <collection_shortName>
```

**Supported Collections:**
- `all` or `all-games` → All games directory
- `favorites` or `fav` → Favorites directory
- `mostplayed` or `most` → Most played games
- `lastplayed` or `last` → Recently played games
- Any collection short name (e.g., `snes`, `mame`, `nes`)

**Output Includes:**
- ℹ️ Collection information
- 🎮 Game count
- 💡 Quick command suggestions

**Examples:**
```bash
use snes          # Navigate to SNES collection
use favorites     # Navigate to favorites
use all          # Navigate to all games
```

**Aliases:** `goto`, `collection`

</details>

<details>
<summary><b>info</b> - Game Information</summary>

**Description:** Display detailed information about a game

**Syntax:**
```bash
info <identifier> [options]
```

**Identifier Formats:**
1. **Game title:** `info "Super Mario World"`
2. **Global index:** `info 25`
3. **Collection reference:** `info @snes:5`
4. **Flag format:** `info --collection=snes --index=5`

**Options:**
| Option | Description |
|--------|-------------|
| `-d`, `--description` | Include game description |
| `-a`, `--ascii` | Display with ASCII visualizations |

**Information Displayed:**
- 🎮 Title, developer, publisher
- 🎨 Genre, release date, players
- 📊 Play statistics (count, time, last played)
- ⭐ Favorite status
- 📁 Collection membership

**Examples:**
```bash
info @snes:5                           # By collection reference
info "The Legend of Zelda" --description   # By title with description
info 42                                # By global index
info "Super Metroid" -a               # With ASCII visualization
info @nes:12 --ascii --description    # Combined flags
```

**Aliases:** `show`, `detail`

</details>

<details>
<summary><b>launch</b> - Launch Game</summary>

**Description:** Launch a game using various identification methods

**Syntax:**
```bash
launch <identifier> [options]
```

**Identifier Formats:**
1. **Game title:** `launch "Super Metroid"`
2. **Global index:** `launch 33`
3. **Collection reference:** `launch @mame:15`
4. **Flag format:** `launch --collection=snes --index=5`

**Special Features:**
- 💾 Remembers launch context
- 📈 Updates play statistics
- 🔄 Changes terminal state to `GAME_RUNNING`

**Examples:**
```bash
launch @mame:15           # Launch by collection reference
launch "Super Metroid"    # Launch by title
launch 33                 # Launch by global index
```

**Aliases:** `run`, `play`

</details>

---

### 4. Collection Management

<details>
<summary><b>collections</b> - List Collections</summary>

**Description:** Display all available game collections

**Syntax:**
```bash
collections [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--short` | Display in short format (name only) |

**Output Includes:**
- 📊 Collection count
- 📝 Full names and short names
- 🎮 Game counts per collection
- 📖 Descriptions (if available)

**Examples:**
```bash
collections           # Full format
collections --short   # Short format
```

**Aliases:** `cols`, `coll`

</details>

---

### 5. Favorites Management

<details>
<summary><b>favorites</b> - Manage Favorite Games</summary>

**Description:** Add, remove, list, or launch favorite games

**Syntax:**
```bash
favorites <action> <identifier>
```

**Actions:**
| Action | Description |
|--------|-------------|
| `list` | Show all favorite games |
| `add` | Add game to favorites (context-aware) |
| `remove` | Remove game from favorites |
| `launch` | Launch a favorite game |

**Identifier Formats:**
- Game index from last listing
- Game title (with quotes if multi-word)

**Examples:**
```bash
favorites list                          # List all favorites
favorites add 5                         # Add game #5 to favorites
favorites remove "Super Mario World"    # Remove by title
favorites launch 2                      # Launch favorite #2
```

**Aliases:** `fav`, `f`

</details>

---

### 6. System Information Commands

<details>
<summary><b>neofetch</b> - System Information with ASCII Art</summary>

**Description:** Display system information with optional ASCII art

**Syntax:**
```bash
neofetch [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--no-art` | Display information without ASCII art |

**Information Displayed:**
- 👤 User and hostname
- 💻 OS and kernel version
- 📅 Date and time
- 🎮 Game library statistics
- 🔋 Battery status
- 📂 Current directory

**Examples:**
```bash
neofetch           # With ASCII art
neofetch --no-art  # Text only
```

**Aliases:** `fetch`, `sysinfo`

</details>

<details>
<summary><b>stats</b> - Gaming Statistics</summary>

**Description:** Display comprehensive gaming statistics with optional ASCII visualization

**Syntax:**
```bash
stats [options]
```

**Modes:**
| Command | Description |
|---------|-------------|
| `stats` | Quick text output |
| `stats -a` | ASCII graphics mode |
| `stats --ascii-true` | ASCII graphics mode (alternative) |

**Statistics Included:**
- 📚 Library size and favorites count
- 🎮 Play statistics (games played, total launches)
- ⏱️ Total playtime
- 🏆 Top played games
- 📊 Play frequency analysis

**Examples:**
```bash
stats              # Text output
stats -a          # With ASCII graphics
```

**Aliases:** `statistics`, `s`

</details>

<details>
<summary><b>device</b> - Device Information</summary>

**Description:** Display detailed device and battery information

**Syntax:**
```bash
device
```

**Information Displayed:**
- 📱 Device model and type
- 💾 Screen resolution
- 🔋 Battery level and status
- ⚡ Charging state

**Aliases:** `deviceinfo`, `dev`

</details>

<details>
<summary><b>whoami</b> - Current User</summary>

**Description:** Display the currently logged-in user

**Syntax:**
```bash
whoami
```

**Output:** Current username

**Aliases:** None

</details>

---

### 7. Search Commands

<details>
<summary><b>search</b> - Advanced Game Search</summary>

**Description:** Search games with advanced filtering and field-specific queries

**Syntax:**
```bash
search <query> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--collection=<name>` | Search within specific collection |
| `--field=<field>` | Search in specific field (title, developer, genre, etc.) |
| `--precise` | Enable exact matching (case-sensitive) |
| `--limit=<n>` | Limit results to N games |

**Searchable Fields:**
- `title` - Game title
- `developer` - Developer name
- `publisher` - Publisher name
- `genre` - Game genre
- `description` - Game description

**Examples:**
```bash
search zelda                                   # Basic search
search "Super Mario" --collection=snes        # Collection-specific
search "zelda" --precise --field=title        # Precise title search
search platformer --field=genre --limit=10    # Genre search
```

**Aliases:** `find`, `grep`

</details>

---

### 8. History Commands

<details>
<summary><b>history</b> - Command History</summary>

**Description:** Display, search, and manage command history

**Syntax:**
```bash
history [action] [options]
```

**Actions:**
| Action | Description |
|--------|-------------|
| `list` | Show all commands (default) |
| `search <query>` | Search in history |
| `clear` | Clear history |
| `last [n]` | Show last N commands |

**Options:**
| Option | Description |
|--------|-------------|
| `--limit=<n>` | Limit output to N items |

**Examples:**
```bash
history                      # Show all history
history list --limit=20      # Show last 20 commands
history search launch        # Search for 'launch' commands
history last 5              # Show last 5 commands
history clear               # Clear all history
```

**Keyboard Shortcuts:**
- `↑` / `↓` - Navigate history
- `Ctrl+R` - Reverse search (if supported)

**Aliases:** `hist`, `h`

</details>

---

### 9. System Control Commands

<details>
<summary><b>clear</b> - Clear Screen</summary>

**Description:** Clear the terminal screen and reset scroll position

**Syntax:**
```bash
clear
```

**Keyboard Shortcut:** `Ctrl+L`

**Aliases:** `cls`

</details>

<details>
<summary><b>logout</b> - Log Out</summary>

**Description:** Log out of the current session and return to login screen

**Syntax:**
```bash
logout
```

**Aliases:** `exit`, `quit`, `bye`

</details>

<details>
<summary><b>reboot</b> - Reboot Terminal</summary>

**Description:** Restart the terminal system

**Syntax:**
```bash
reboot [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--soft` | Soft reboot (maintain session) |
| `--hard` | Hard reboot (full restart) |

**Examples:**
```bash
reboot           # Standard reboot
reboot --soft    # Soft reboot
```

**Aliases:** `restart`

</details>

---

### 10. Customization Commands

<details>
<summary><b>theme</b> - Theme Management</summary>

**Description:** Change terminal color scheme and theme

**Syntax:**
```bash
theme <theme_name>
theme list
```

**Available Themes:**
- `default` - Default terminal theme
- `retro` - Classic retro theme
- `cyberpunk` - Neon cyberpunk theme
- `matrix` - Matrix green theme
- `dracula` - Dracula theme
- `nord` - Nord theme

**Examples:**
```bash
theme list         # List available themes
theme cyberpunk   # Apply cyberpunk theme
theme default     # Restore default theme
```

**Aliases:** `colors`, `scheme`

</details>

---

### 11. Visual Effects

<details>
<summary><b>scanline</b> - Enhanced CRT Effect Control</summary>

**Description:** Advanced CRT/scanline overlay system with full interface distortion. Applies authentic CRT effects including scanlines, curvature, chromatic aberration, phosphor glow, and VHS tape distortion.

**Syntax:**
```bash
scanline [command] [options]
```

**Commands:**
| Command | Description |
|---------|-------------|
| `on` | Enable CRT effect |
| `off` | Disable CRT effect |
| `toggle` | Toggle effect on/off |
| `status` | Show current settings |
| `reset` | Reset to factory defaults |
| `default` | Apply default preset |
| `list`, `presets` | List available presets |
| `<preset_name>` | Apply specific preset |

**Available Presets:**
| Preset | Description |
|--------|-------------|
| `default` | Clean balanced CRT (no curve) |
| `vhs` | VHS tape with heavy distortion |
| `retro` | Classic 90s gaming monitor |

**Basic Parameters:**
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `--intensity` | 0.0-0.3 | 0.01 | Scanline darkness |
| `--count` | 800-2000 | 1600 | Number of scanlines |
| `--curvature` | 0.0-1.0 | 0.0 | Screen barrel distortion |
| `--flicker` | 0.0-1.0 | 0.0 | Screen flicker amount |
| `--fade` | 0.0-0.1 | 0.0 | Edge fade softness |
| `--fadeopacity` | 0.0-1.0 | 0.0 | Edge fade color blend |

**Quality Parameters:**
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `--brightness` | 0.1-1.5 | 1.0 | Overall brightness |
| `--temperature` | 0.1-5.0 | 1.0 | Color warmth |
| `--chroma` | 0.0-3.0 | 0.0 | Chromatic aberration |
| `--noise` | 0.0-1.0 | 0.0 | Film grain/noise |
| `--glow` | 0.0-3.0 | 0.0 | Phosphor glow/bloom |
| `--glowspread` | 0.0-1.0 | 0.0 | Glow spread/saturation |
| `--zoom` | 1.0-1.2 | 1.0 | Screen zoom |

**VHS Effect:**
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `--vhs` | 0.0-1.0 | 0.0 | VHS tape distortion |

**VHS Effect Features:**
- Horizontal tracking errors and shifts
- Color bleeding and banding
- Tracking noise lines
- Vertical jitter and instability
- Additional chromatic aberration
- Warm color temperature shift

**Examples:**
```bash
# Apply presets
scanline retro
scanline vhs

# Enable/disable
scanline on
scanline toggle

# VHS distortion
scanline --vhs 0.5
scanline retro --vhs 0.3

# Custom settings
scanline --intensity=0.15 --curvature=0.2
scanline --temperature=1.1 --chroma=0.8 --brightness=0.95
scanline --glow=1.5 --glowspread=0.3 --vhs=0.2

# View configuration
scanline status
scanline list
```

**Important Notes:**
- 💾 All settings persist across sessions
- ⚡ Changes apply instantly
- 🔄 Effect is OFF by default on first run
- ⚠️ Curvature distorts the ENTIRE interface
- 🎨 VHS effect can be combined with any preset
- 🔧 Use `reset` if experiencing visual issues

**Aliases:** `crt`, `scan`

</details>

---

### 12. Game Notes System

<details>
<summary><b>journal</b> - Game Notes System</summary>

**Description:** Create, view, edit, and delete personal notes for your games

**Syntax:**
```bash
journal <@collection:identifier> [options]
journal <action> [arguments]
```

**Actions:**
| Action | Description |
|--------|-------------|
| `list` | List all saved notes |
| `show <id>` | Display specific note by ID |
| `show "title"` | Show all notes for a game |
| `edit <id>` | Modify existing note |
| `rm <id>` | Delete specific note |
| `clear` | Delete all notes (requires `--force`) |

**Options:**
| Option | Description |
|--------|-------------|
| `--title="text"` | Custom title for note |
| `--comment="text"` | Note content |

**Identifier Format** (`@collection:identifier`):
- **Collection:** Real collection shortname or virtual collection
  - Real: `snes`, `genesis`, `mame`, etc.
  - Virtual: `all`, `all-games`, `favorites`, `fav`, `mostplayed`, `most`, `lastplayed`, `last`
- **Identifier:** Numeric index or game title in quotes

**Examples:**
```bash
# Create notes
journal @snes:12 --title="Zelda Progress" --comment="Found Master Sword"
journal @nes:"Super Mario Bros 3" --comment="World 8 is tough"

# List and show notes
journal list
journal show 3
journal show "Zelda"

# Edit and delete
journal edit 3 --title="Updated" --comment="New progress"
journal rm 3
journal clear --force
```

**Note Display Includes:**
- 🆔 Note ID
- 🎮 Game title
- 📁 Collection
- 📝 Note title
- 📅 Date created
- 💬 Comment preview/full text

**Aliases:** `notes`, `note`

</details>

---

### 13. Utility Commands

<details>
<summary><b>help</b> - Command Help</summary>

**Description:** Display help information for commands

**Syntax:**
```bash
help [command]
```

**Usage:**
- `help` - List all available commands
- `help <command>` - Detailed help for specific command

**Examples:**
```bash
help              # List all commands
help launch       # Help for launch command
help search       # Help for search command
```

**Aliases:** `?`, `man`

</details>

<details>
<summary><b>echo</b> - Echo Text</summary>

**Description:** Display text or arguments to the terminal

**Syntax:**
```bash
echo <text>
```

**Examples:**
```bash
echo Hello World
echo "Multiple arguments are concatenated"
```

**Aliases:** None

</details>

<details>
<summary><b>date</b> - Date and Time</summary>

**Description:** Display current date and time

**Syntax:**
```bash
date
```

**Output Format:**
```
Tue Jan 14 2025
14:30:22 GMT-0300
```

**Aliases:** None

</details>

---

## 💡 Tips and Tricks

### Game Indexing
Use `ll` or `ls --wide` to see numbered games, then reference them with:
```bash
launch <number>
info <number>
```

### Collection References
Use the `@collection:index` format for precise game targeting:
```bash
info @snes:5
launch @mame:15
journal @nes:12 --comment="Great game!"
```

### Command History
Navigate efficiently through your command history:
- `↑` / `↓` - Browse previous commands
- `Ctrl+R` - Reverse search (if supported)
- `history search <term>` - Find specific commands

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Clear screen |
| `Ctrl+C` | Cancel current command |
| `Tab` | Path/collection completion |

### Advanced Filtering
Combine flags for powerful queries:
```bash
ls --limit=20 --wide
search "zelda" --precise --field=title --collection=snes
games --collection=all --limit=50
```

### Quick Navigation
```bash
cd ~                    # Home directory
use favorites           # Jump to favorites
use lastplayed         # Recent games
```

---

## 🔧 State Management

The terminal operates in different states that affect command availability:

| State | Description | Commands Available |
|-------|-------------|-------------------|
| `BOOTING` | System initialization | Limited |
| `LOGIN` | User authentication | Login only |
| `SHELL` | Normal operation | All commands |
| `GAME_RUNNING` | Game is active | Limited |
| `LOCKED` | System locked | None |

> **Note:** Most commands require `SHELL` state and proper authentication.

---

## 💾 Persistence

The system maintains data across sessions:

- ✅ User preferences and settings
- ✅ Command history (user-specific)
- ✅ Game notes and journals
- ✅ Visual effects configuration
- ✅ Favorite games list
- ✅ Play statistics (maintained by Pegasus Frontend)

---

## 📚 Command Reference Quick Guide

<table>
<tr>
<td valign="top" width="50%">

**Navigation & Files**
- `cd` - Change directory
- `pwd` - Show directory
- `ls` - List contents
- `ll` - Wide list
- `head`/`tail` - First/last items

**Game Management**
- `games` - List games
- `use` - Go to collection
- `info` - Game details
- `launch` - Start game
- `favorites` - Manage favorites

**Search & Info**
- `search` - Find games
- `collections` - List collections
- `neofetch` - System info
- `stats` - Gaming stats

</td>
<td valign="top" width="50%">

**History & Control**
- `history` - Command history
- `clear` - Clear screen
- `logout` - Log out
- `reboot` - Restart

**Customization**
- `theme` - Change colors
- `scanline` - CRT effects
- `journal` - Game notes

**Utilities**
- `help` - Get help
- `echo` - Display text
- `date` - Show date/time
- `whoami` - Current user
- `device` - Device info

</td>
</tr>
</table>

---

<div align="center">

**Pegasus Terminal OS v1.0**

Created by **Gonzalo Abbate**

---

⭐ If you find this useful, consider starring the repository!

</div>

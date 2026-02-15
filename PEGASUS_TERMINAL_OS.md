# Pegasus Terminal OS - Command Reference

## Overview
Pegasus Terminal OS is a terminal-based interface for Pegasus Frontend that emulates a Linux command-line environment. This document provides a comprehensive reference for all available commands.

## Command Categories

### 1. Navigation Commands

#### `cd` - Change Directory
**Description:** Change the current working directory.

**Usage:**
```bash
cd <path>
```

**Arguments:**
- `<path>` - Directory path to navigate to (optional, defaults to `/`)

**Special Paths:**
- `~` or empty - Navigate to user's home directory (`/home/<username>`)
- `All-Games`, `Favorites`, `MostPlayed`, `LastPlayed` - Special collections
- `/Collections/<shortName>/games` - Specific collection directory

**Examples:**
```bash
cd all-games
```

**Aliases:** `chdir`

---

#### `pwd` - Print Working Directory
**Description:** Display the current working directory with user-friendly path translation.

**Usage:**
```bash
pwd
```

**Output Examples:**
- `/home/user/All-Games`
- `/home/user/Favorites`
- `/home/user/Collections/snes/games`

**Aliases:** None

---

### 2. File System Commands

#### `ls` - List Directory Contents
**Description:** List files and directories in the current or specified location.

**Usage:**
```bash
ls [path] [options]
```

**Options:**
- `--limit=<n>` - Limit output to N items
- `--head=<n>` - Show first N items
- `--tail=<n>` - Show last N items
- `--wide` - Display in column format

**Examples:**
```bash
ls
ls all-games --limit=20
ls --head=10
ls --wide
```

**Aliases:** `dir`

---

#### `ll` - List Directory Contents (Wide Format)
**Description:** List contents in wide column format with numbered game indices.

**Usage:**
```bash
ll [path]
```

**Features:**
- Automatically numbers games for easy reference
- Displays in 4-column format
- Shows collection names without prefixes

**Aliases:** None

---

#### `head` - Show First N Items
**Description:** Display the first N items from a directory.

**Usage:**
```bash
head [n] [path]
```

**Arguments:**
- `n` - Number of items to show (default: 10)
- `path` - Directory path (optional)

**Examples:**
```bash
head 2
head 5 all-games
```

**Aliases:** None

---

#### `tail` - Show Last N Items
**Description:** Display the last N items from a directory.

**Usage:**
```bash
tail [n] [path]
```

**Arguments:**
- `n` - Number of items to show (default: 10)
- `path` - Directory path (optional)

**Examples:**
```bash
tail 2
tail 5 favorites
```

**Aliases:** None

---

### 3. Game Management Commands

#### `games` - List Games
**Description:** List games with flexible filtering options.

**Usage:**
```bash
games [options]
```

**Options:**
- `--collection=<name>` - List games from specific collection
- `--limit=<n>` - Limit output to N games

**Examples:**
```bash
games
games --collection=snes
games --collection=all --limit=50
```

**Aliases:** `list`, `g`

---

#### `use` - Navigate to Collection
**Description:** Quickly navigate to a collection directory with detailed information.

**Usage:**
```bash
use <collection_shortName>
```

**Supported Collections:**
- `all` or `all-games` - All games directory
- `favorites` or `fav` - Favorites directory
- `mostplayed` or `most` - Most played games
- `lastplayed` or `last` - Recently played games
- Any collection short name (e.g., `snes`, `mame`)

**Output Includes:**
- Collection information
- Game count
- Quick command suggestions

**Aliases:** `goto`, `collection`

---

#### `info` - Game Information
**Description:** Display detailed information about a game.

**Usage:**
```bash
info <identifier> [options]
```

**Identifier Formats:**
- Game title (e.g., `info "Super Mario World"`)
- Global index (e.g., `info 25`)
- Collection reference (e.g., `info @snes:5`)
- Use with flags: `info --collection=snes --index=5`

**Options:**
- `-d` or `--description` - Include game description

**Information Displayed:**
- Title, developer, publisher
- Genre, release date, players
- Play statistics (count, time, last played)
- Favorite status
- Collection membership

**Examples:**
```bash
info @snes:5
info "The Legend of Zelda" --description
info 42
```

**Aliases:** `show`, `detail`

---

#### `launch` - Launch Game
**Description:** Launch a game using various identification methods.

**Usage:**
```bash
launch <identifier> [options]
```

**Identifier Formats:**
- Game title
- Global index
- Collection reference (e.g., `@snes:5`)
- Use with flags: `launch --collection=snes --index=5`

**Special Features:**
- Remembers launch context
- Updates play statistics
- Changes terminal state to `GAME_RUNNING`

**Examples:**
```bash
launch @mame:15
launch "Super Metroid"
launch 33
```

**Aliases:** `run`, `play`

---

### 4. Collection Management

#### `collections` - List Collections
**Description:** Display all available game collections.

**Usage:**
```bash
collections [options]
```

**Options:**
- `--short` - Display in short format (name only)

**Output Includes:**
- Collection count
- Full names and short names
- Game counts
- Descriptions (if available)

**Aliases:** `cols`, `coll`

---

### 5. Favorites Management

#### `favorites` - Manage Favorite Games
**Description:** Add, remove, list, or launch favorite games.

**Usage:**
```bash
favorites <action> <identifier>
```

**Actions:**
- `list` - Show all favorite games
- `add` - Add game to favorites (context-aware)
- `remove` - Remove game from favorites
- `launch` - Launch a favorite game

**Identifier Formats:**
- Game index from last listing
- Game title

**Examples:**
```bash
favorites list
favorites add 5
favorites remove "Super Mario World"
favorites launch 2
```

**Aliases:** `fav`, `f`

---

### 6. System Information Commands

#### `neofetch` - System Information with ASCII Art
**Description:** Display system information with optional ASCII art.

**Usage:**
```bash
neofetch [options]
```

**Options:**
- `--no-art` - Display information without ASCII art

**Information Displayed:**
- User and hostname
- OS and kernel version
- Date and time
- Game library statistics
- Battery status
- Current directory

**Aliases:** `fetch`, `sysinfo`

---

#### `stats` - Gaming Statistics
**Description:** Display comprehensive gaming statistics with optional ASCII visualization.

**Usage:**
- `stats`                - Quick text output
- `stats -a`             - ASCII graphics mode
- `stats --ascii-true`   - ASCII graphics mode (alternative)

**Statistics Included:**
- Library size and favorites count
- Play statistics (games played, total launches)
- Total and average play time
- Top 5 games by playtime (ASCII mode only)
- Last played game with detailed timing, global index, and collection
- Rating statistics

**Display Modes:**
- **Normal mode** (`stats`): Fast, clean text output
- **ASCII mode** (`stats -a` or `stats --ascii-true`): Enhanced visualization with:
  - Box-drawn frames and sections
  - Progress bars for percentages
  - Top 5 games table with playtime rankings
  - Visual dashboard layout

**Aliases:** `stat`, `statistics`

---

#### `device` - Device Information
**Description:** Show hardware and device information.

**Usage:**
```bash
device
```

**Information Displayed:**
- Battery percentage and status
- Estimated remaining battery time
- Current date and time

**Aliases:** `dev`, `hw`

---

#### `whoami` - Current User
**Description:** Display the currently logged-in user.

**Usage:**
```bash
whoami
```

**Output:**
- Username or "guest" if not logged in

**Aliases:** None

---

### 7. Search Commands

#### `search` - Advanced Game Search
**Description:** Search games with flexible filtering and scoring.

**Usage:**
```bash
search <term> [options]
```

**Options:**
- `--field=<field>` - Search in specific field (title|developer|genre|year|all)
- `--limit=<n>` - Limit results to N items
- `--precise` - Sort results by relevance score

**Search Fields:**
- `title` - Search only in game titles
- `developer` - Search in developer names
- `genre` - Search in genres
- `year` - Search in release years
- `all` - Search in all fields

**Scoring System:**
- Exact match: 100 points
- Starts with term: 80 points
- Contains whole word: 60 points
- Partial match: 40 points

**Examples:**
```bash
search "mario" --field=title
search "nintendo" --field=developer --precise
search "1996" --field=year --limit=20
```

**Aliases:** `find`, `grep`

---

### 8. History Management

#### `history` - Command History
**Description:** View and manage command history.

**Usage:**
```bash
history [options]
```

**Options:**
- `n` - Show last N commands (e.g., `history 50`)
- `--limit=<n>` - Show last N commands
- `--all` - Show entire command history
- `--clear` - Clear command history

**Features:**
- Timestamps for each command
- User and directory context
- Persistent across sessions (per user)

**Examples:**
```bash
history
history 30
history --all
history --clear
```

**Aliases:** `hist`

---

### 9. System Control Commands

#### `clear` - Clear Screen
**Description:** Clear the terminal screen and display fresh prompt.

**Usage:**
```bash
clear
```

**Keyboard Shortcut:** `Ctrl+L`

**Aliases:** `cls`

---

#### `logout` - Log Out
**Description:** Log out the current user and return to login screen.

**Usage:**
```bash
logout
```

**Effects:**
- Clears user session
- Saves command history
- Returns to login state

**Aliases:** None

---

#### `reboot` - Reboot Terminal
**Description:** Reboot the terminal interface.

**Usage:**
```bash
reboot
```

**Effects:**
- Clears all buffers
- Reinitializes kernel
- Returns to boot sequence

**Aliases:** None

---

### 10. `Theme` - Terminal Theme, Prompt and Font Management
**Description:** Manage terminal color schemes, prompt styles and fonts.
**Usage:**
```bash
theme [subcommand] [options]
```
**Color Scheme Subcommands:**
- `theme list` - List available color schemes
- `theme set <scheme>` - Set active color scheme
- `theme current` - Show current color scheme, prompt and font
- `theme reset` - Reset to default color scheme

**Prompt Style Subcommands:**
- `theme prompt list` - List available prompt styles
- `theme prompt set <style>` - Set prompt style
- `theme prompt current` - Show current prompt style
- `theme prompt reset` - Reset to default prompt style

**Font Subcommands:**
- `theme font list` - List available fonts
- `theme font set <font>` - Set terminal font
- `theme font current` - Show current font
- `theme font reset` - Reset to default font

**Available Color Schemes (14 total):**
- `default` - Classic terminal colors
- `matrix` - Green on black Matrix style
- `cyberpunk` - Cyan and magenta neon colors
- `dracula` - Popular Dracula theme palette
- `monokai` - Classic Monokai editor theme
- `amber` - Vintage amber monochrome
- `gruvbox` - Retro groove color scheme
- `nord` - Arctic inspired palette
- `material-dark` - Google Material Design dark theme
- `solarized-dark` - Classic developer color scheme
- `one-dark` - Popular Atom/VS Code theme
- `tokyo-night` - Modern Japanese neon aesthetic
- `synthwave-84` - Retrowave/Outrun 80s style
- `rose-pine` - Elegant minimalist theme

**Available Prompt Styles (14 total):**
- `default` - Standard user@host:path$ format
- `minimal` - Clean > prompt
- `powerline` - Styled with powerline separators
- `arrow` - Simple arrow prompt →
- `retro` - C:\> style DOS prompt
- `fish` - Fish shell style prompt
- `zsh` - Oh-my-zsh style with git info
- `hacker` - Matrix-style hacker prompt
- `root` - Superuser/admin style prompt
- `unix` - Classic Unix/BSD style prompt
- `session` - Interactive console with session info
- `clock` - Shows current time in prompt
- `date` - Shows current date in prompt
- `geometric` - Styled with ◢◤◥◣ geometric symbols

**Available Fonts (11 total):**
- `default` - System default monospace font
- `dotgothic16` - Pixel-style gothic font
- `firacode` - Developer font with ligatures
- `pressstart2p` - Classic 8-bit arcade font
- `spacemono` - Fixed-width typewriter style
- `specialelite` - Vintage typewriter aesthetic
- `synemono` - Modern geometric monospace
- `vt323` - Classic CRT terminal font
- `terminus` - Clean bitmap font for terminals
- `ubuntumono` - Ubuntu's monospace companion font
- `cascadiacode` - Microsoft's coding font with ligatures
- `ibmplexmono` - IBM's modern monospace typeface

**Examples:**
```bash
# Color scheme management
theme list
theme set cyberpunk
theme current
theme reset

# Prompt style management
theme prompt list
theme prompt set arrow
theme prompt set retro
theme prompt current
theme prompt reset

# Font management
theme font list
theme font set vt323
theme font set pressstart2p
theme font set firacode
theme font current
theme font reset

# Combined use
theme set dracula
theme prompt set powerline
theme font set cascadiacode

# Reset individual elements
theme reset
theme reset prompt
theme reset font
```
**Aliases:** `colors`, `scheme`

---

### 11. `scanline` - Enhanced CRT Effect Control

**Description:** Advanced CRT/scanline overlay system with full interface distortion. Applies authentic CRT effects including scanlines, curvature, chromatic aberration, phosphor glow, and VHS tape distortion to all UI elements. All settings are saved automatically and persist across sessions.

**Aliases:** `crt`, `scan`

**Usage:**
```bash
scanline [command] [options]
```

**Commands:**
- `on` - Enable CRT effect
- `off` - Disable CRT effect
- `toggle` - Toggle effect on/off
- `status` - Show current settings and parameters
- `reset` - Reset all settings to factory defaults
- `default` - Apply default preset
- `list`, `presets` - List all available presets
- `<preset_name>` - Apply a specific preset

**Available Presets:**
- `default` - Clean balanced CRT (no curve)
- `vhs` - VHS tape with heavy distortion & chromatic aberration
- `retro` - Classic 90s gaming monitor

**Basic Parameters:**
- `--intensity <0.0-0.3>` - Scanline darkness (default: 0.01)
- `--count <800-2000>` - Number of scanlines (default: 1600)
- `--curvature <0.0-1.0>` - Screen barrel distortion (default: 0.0)
  - Affects entire interface! 0.2-0.4 recommended
- `--flicker <0.0-1.0>` - Screen flicker amount (default: 0.0)
- `--fade <0.0-0.1>` - Edge fade softness (default: 0.0)
  - Controls smooth brightness fade at curved edges
- `--fadeopacity <0.0-1.0>` - Edge fade color blend (default: 0.0)
  - 0.0=fade to black, 1.0=fade to theme color

**Quality Parameters:**
- `--brightness <0.1-1.5>` - Overall brightness (default: 1.0)
- `--temperature <0.1-5.0>` - Color warmth, higher=warmer (default: 1.0)
- `--chroma <0.0-3.0>` - Chromatic aberration/RGB shift (default: 0.0)
- `--noise <0.0-1.0>` - Film grain/noise amount (default: 0.0)
- `--glow <0.0-3.0>` - Phosphor glow/bloom on bright elements (default: 0.0)
  - Simulates CRT phosphor bloom around lit text
- `--glowspread <0.0-1.0>` - Glow spread/saturation (default: 0.0)
  - 0.0=soft diffuse halo, 1.0=solid bright core
- `--zoom <1.0-1.2>` - Screen zoom for curvature (default: 1.0)

**VHS Effect:**
- `--vhs <0.0-1.0>` - VHS tape distortion effect (default: 0.0)
  - Adds authentic VHS artifacts:
    - Horizontal tracking errors and shifts
    - Color bleeding and banding
    - Tracking noise lines
    - Vertical jitter and instability
    - Additional chromatic aberration
    - Warm color temperature shift
  - 0.0 = off, 0.3-0.5 = subtle, 1.0 = maximum
  - Independent from 'vhs' preset - can be combined with any preset!

**Examples:**
```bash
# Apply a preset
scanline retro
scanline vhs

# Enable/disable effect
scanline on
scanline toggle

# VHS distortion effect
scanline --vhs 0.5
scanline retro --vhs 0.3    
scanline --vhs 1.0
scanline default --vhs 0.4

# Custom settings
scanline --intensity=0.15 --curvature=0.2
scanline --intensity=0.0 --count=1800
scanline retro --intensity=0.12 --vhs=0.4

# View current configuration
scanline status
scanline list

# Fine-tune appearance
scanline --temperature=1.1 --chroma=0.8 --brightness=0.95
scanline --glow=1.5 --glowspread=0.3 --vhs=0.2
```

**Notes:**
- Effect is OFF by default on first run
- Curvature distorts the ENTIRE interface (ShaderEffectSource)
- Edge fade creates smooth blend at curved borders (no hard edges)
- VHS effect is independent from 'vhs' preset and can be combined with any settings
- All settings persist across sessions via api.memory
- Changes apply instantly without restart
- Higher curvature values may affect readability
- High VHS values (≥0.7) create heavy distortion
- Use `reset` if experiencing visual issues
- Custom adjustments override preset values and mark preset as "custom"

---

### 12. Utility Commands

#### `help` - Command Help
**Description:** Display help information for commands.

**Usage:**
```bash
help [command]
```

**Examples:**
```bash
help
help launch
help search
```

**Output:**
- Without arguments: List all available commands
- With command name: Detailed help for specific command

**Aliases:** `?`, `man`

---

#### `echo` - Echo Text
**Description:** Display text or arguments.

**Usage:**
```bash
echo <text>
```

**Examples:**
```bash
echo Hello World
echo "Multiple arguments are concatenated"
```

**Aliases:** None

---

#### `date` - Date and Time
**Description:** Display current date and time.

**Usage:**
```bash
date
```

**Output Format:**
```
Tue Jan 14 2025
14:30:22 GMT-0300
```

**Aliases:** None

---

## Command Reference Quick Guide

### Navigation
- `cd` - Change directory
- `pwd` - Show current directory

### File Operations
- `ls` - List directory (with options)
- `ll` - List with game numbers
- `cols` - Simple column list
- `head`/`tail` - Show first/last items

### Game Management
- `games` - List games
- `use` - Go to collection
- `info` - Game details
- `launch` - Start game
- `favorites` - Manage favorites

### Collections
- `collections` - List collections

### Search
- `search` - Advanced game search

### System Info
- `neofetch` - System info with art
- `stats` - Gaming statistics
- `device` - Device info
- `whoami` - Current user

### History
- `history` - Command history

### System Control
- `clear` - Clear screen
- `logout` - Log out
- `reboot` - Reboot terminal

### Utilities
- `help` - Command help
- `echo` - Display text
- `date` - Show date/time

## Tips and Tricks

### 1. Game Indexing
- Use `ll` or `ls --wide` to see numbered games
- Use these numbers with `launch <number>` or `info <number>`

### 2. Collection References
- Format: `@collection:index` (e.g., `@snes:5`)
- Works with `info`, `launch`, and other commands

### 3. Command History
- Press `↑`/`↓` to navigate history
- Use `Ctrl+R` to search history (if supported)

### 4. Keyboard Shortcuts
- `Ctrl+L` - Clear screen
- `Ctrl+C` - Cancel current command

### 5. Path Completion
- Tab completion is available for directories and collections
- Use `~` for home directory

### 6. Advanced Filtering
- Combine flags: `ls --limit=20 --wide`
- Use precise search: `search "zelda" --precise --field=title`

## State Management
The terminal operates in several states:
- `BOOTING` - System initialization
- `LOGIN` - User authentication
- `SHELL` - Normal operation (most commands available)
- `GAME_RUNNING` - Game is active
- `LOCKED` - System locked

Most commands require `SHELL` state and authentication.

## Persistence
- User data is saved between sessions
- Command history is user-specific
- Game statistics are maintained by Pegasus Frontend
---

*Pegasus Terminal OS v1.0 - Created by Gonzalo Abbate*

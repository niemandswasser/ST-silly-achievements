<p align="center">
  <img src="https://renri-shitpost.neocities.org/avch.jpg" alt="ST Silly Achievements" width="100%">
</p>

# ST Silly Achievements

An extension for [SillyTavern](https://github.com/SillyTavern/SillyTavern) that adds a Steam-style achievement system right into your chats. The AI itself decides when to reward you for a standout roleplay moment - an unexpected plot twist, a great line, a heroic act, or an epic fail.

## How it works

The extension injects a prompt into the context that explains the achievement format to the AI. When the AI decides something worthy has happened, it appends a special marker to the end of its reply:

```
[ACHIEVEMENT: 💀 | No Room for Error | Faced the boss one-on-one and didn't flinch | epic]
```

The extension parses this marker, hides it from the chat, and displays a nice popup notification. All achievements are saved in the chat metadata and accessible via a floating button.

## Features

**Rarity system** - four tiers: common, rare, epic, legendary. Each tier has its own visual styling and glow.

**Steam-like toasts** - popup notifications when you earn an achievement. Configurable: screen corner, scale, number of lines for title and description, sharp/rounded corners.

**Themed presets** - 7 built-in color themes (Soft, Pink, Lavender, Mint, Peach, Night, Blackout) + the ability to create your own with 4 customizable colors (primary, secondary, accent, text).

**Prompt presets** - built-in prompts in Russian and English. You can create, edit, save, and switch between your own presets. Separate presets for the main prompt and the negative prompt (sent during cooldown).

**Cooldown** - configurable interval between achievements (in messages). During cooldown, the negative prompt is injected instead of the main one, forbidding the AI from handing out rewards.

**Local validation** - the extension additionally checks the cooldown on the client side and filters out exact duplicates (both options can be disabled).

**Achievements panel** - a floating (draggable) button with a counter; clicking it opens a panel listing all achievements in the current chat, rarity statistics, and cooldown info. Achievements can be deleted one at a time or all at once.

**Flexible injection** - configurable position (before/after the prompt, at a depth), role (system/user/assistant), and how often the prompt is inserted.

**Debug** - built-in tools for manually granting achievements with arbitrary parameters.

**Localization** - full Russian and English interface support (detected automatically from the SillyTavern locale).

## Installation

1. Open SillyTavern
2. Go to **Extensions** -> **Install Extension**
3. Paste the repository link:
   ```
   https://github.com/niemandswasser/ST-silly-achievements
   ```
4. Click **Install** and reload the page

Or clone it manually into the extensions folder:

```bash
cd [path to SillyTavern]/data/default-user/extensions/third-party/
git clone https://github.com/niemandswasser/ST-silly-achievements
```

## Settings

After installation the extension appears in the SillyTavern extensions panel. Settings are split into sections:

**General** - enable/disable, cooldown, local filtering, deduplication.

**Prompt injection** - position, depth, role, insertion frequency, presets for the main and negative prompts with a full-text editor.

**Toast appearance** - enable notifications, rarity glow, screen corner, scale, number of lines, sharp corners, themed presets with color customization.

**Debug** - manually grant and delete achievements, open the panel.

## Marker format

```
[ACHIEVEMENT: emoji | Title (up to 96 chars) | Description (up to 220 chars) | rarity]
```

Rarities: `common`, `rare`, `epic`, `legendary`

## Compatibility

Works with any model capable of following instructions and outputting a structured marker. Tested with Claude and Gemini.

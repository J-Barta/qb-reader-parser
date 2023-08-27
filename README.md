# Obsidian QB Reader Plugin

Automatically parse tossups from QB Reader into a format readable by the [Obsidian_to_Anki](https://github.com/Pseudonium/Obsidian_to_Anki) plugin.

## Installation
- Download and install Obsidian
- Download the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) plugin in Anki (id `2055492159`)
- Enable Community Plugins in Obsidian and install the Obsidian_to_Anki plugin
  - Enable the plugin and go to its settings
  - Set the deck for your obsidian cards to go to
  - Enable Cloze Paragraph styling - See [To Use](##To Use) section 
- Download `main.js`, `manifest.json`, and `styles.css` from the latest [Release](https://github.com/J-Barta/obsidian-qb-reader/releases).
  - Place these files into a single folder labeled `obsidian-qb-reader`
  - Move this folder into `{Your Obsidian Vault}/.obsidian/plugins/`
  - Restart Obsidian (probably).
  - Go to your community plugins tab and enable Obsidian QB Reader
  - Set your categories in the settings menu for the plugin. These are the categories that will be selected by default when you open the Obsidian QB Reader Window

## To Use
Run the "QB Reader" command (Ctrl + P) to open a dialog that will allow you to query the QB Reader API. Sentences will automatically be separated by highlights. Clicking on sentences will automatically parse them into a format ready for Anki-ification!

The default parsing method for converting clues to cards is using highlighting, because it is easiest to read in Obsidian. This necessitates that you use the [Cloze Paragraph Styles](https://github.com/Pseudonium/Obsidian_to_Anki/wiki/Cloze-Paragraph-style) feature of the Obsidian_to_Anki plugin with this regex: 

```
((?:\n)*(?:.*(?:{|={2}).*)(?:(\^.{1,3}$|^.{4}(?<!<!--).*))*)
```

## Caveats
- QB Reader's subcategory behavior is strange when retrieving tossups. I'm not entirely sure why it is the way it is, but having any major category (Lit, Hist, Sci, FA) enabled will currently stop all minor categories from returning tossups. Only select minor categories to get minor category results.
- At this time, the plugin does not support bonuses. This may be added in the future.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.



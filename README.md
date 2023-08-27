# Obsidian QB Reader Plugin

Automatically parse tossups from QB Reader into a format readable by the [Obsidian_to_Anki](https://github.com/Pseudonium/Obsidian_to_Anki) plugin.

## To Use
Run the "QB Reader" command to open a dialog that will allow you to query the QB Reader API. Sentences will automatically be separated by highlights. Clicking on sentences will automatically parse them into a format ready for Anki-ification!

The default parsing method for converting clues to cards is using highlighting, because it is easiest to read in Obsidian. This necessitates that you use the [Cloze Paragraph Styles](https://github.com/Pseudonium/Obsidian_to_Anki/wiki/Cloze-Paragraph-style) feature of the Obsidian_to_Anki plugin with this regex: 

```
((?:\n)*(?:.*(?:{|={2}).*)(?:(\^.{1,3}$|^.{4}(?<!<!--).*))*)
```

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.



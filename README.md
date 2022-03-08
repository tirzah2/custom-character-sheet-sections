![All Downloads](https://img.shields.io/github/downloads/jessev14/custom-character-sheet-sections/total?style=for-the-badge)

![Latest Release Download Count](https://img.shields.io/github/downloads/jessev14/custom-character-sheet-sections/latest/CCSS.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fcustom-character-sheet-sections&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=custom-character-sheet-sections)

Donations help fund updates and new modules!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/jessev14)

# Custom Character Sheet Sections (CCSS)

This module implements easily adding custom character sheet sections.

## Usage
To define a custom section for an item, open the item sheet and input the custom section name on the details. All items with the same custom section will be organized together.

Only Feature-type items and items in the inventory tab will be affected. Class-subtype Feature items will not be affected.

<img src="/img/ccss.png">


## Compatibility
### Systems
Currently, CCSS is only compatible with the dnd5e system, as it uses the system's sheet template to actually render custom sections (see Technical Notes below).

Compatibility with other systems is theoretically possible, but I would need some input from someone familiar with the system. Please open an issue if you would like to assist with implement compatibililty with your system.

### Modules
- [Tidy5e Sheet](https://foundryvtt.com/packages/tidy5e-sheet)


## Technical Notes
A text input field is added to item sheets (via `renderItemSheet` hook). The value of this input is saved as a flag on the item.

The `getData` method of the `ActorSheet5eCharacter` class is patched (via libWrapper). The original function returns a data object that is used to render the character sheet template. This original data object contains sections of items. The implemented wrapper function re-organizes these sections using the flag data on the relevant items. Items flagged with a custom section are removed from their original section and are placed into newly created sections. This edited data object is returned and used to render the character sheet as normal. The character sheet template then does the heavy lifting in actually creating the custom section elements.

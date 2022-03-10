import { libWrapper } from "../lib/shim.js";

const moduleName = "custom-character-sheet-sections";


Hooks.once("ready", () => {
    libWrapper.register(moduleName, "CONFIG.Actor.sheetClasses.character['dnd5e.ActorSheet5eCharacter'].cls.prototype.getData", customSectionGetData, "WRAPPER");
});


Hooks.on("renderItemSheet", (app, html, appData) => {
    const custom2 = `
        <div class="form-group" style="border: 1px solid var(--faint-color); border-radius: 5px; flex-direction: column;">
            <label>${game.i18n.localize(`${moduleName}.customSection`)}</label>
            <input style="text-align: left;" type="text" name="flags.${moduleName}.sectionName" value="${app.object.data.flags[moduleName]?.sectionName || ""}" />
        </div>
    `;
    html.find(`div.item-properties`).append(custom2);

    return;

    // Inject input element into Item sheets to input custom section name
    const customSectionInput = `
        <h3 class="form-header">${game.i18n.localize(`${moduleName}.customSection`)}</h3>
        <div class="form-group">
            <label>${game.i18n.localize(`${moduleName}.sectionName`)}</label>
            <div class="form-fields">
                <input type="text" name="flags.${moduleName}.sectionName" value="${app.object.data.flags[moduleName]?.sectionName || ""}" />
            </div>
        </div>
    `;

    html.find(`div.tab.details`).append(customSectionInput);
});

Hooks.on("renderActorSheet5eCharacter", (app, html, appData) => {
    // Remove "Add Item" buttons from custom sections on character sheet
    const addButtons = html.find(`a.item-create`);
    addButtons.each(function() {
        // Default dnd5e sheet
        const firstItemLi = $(this).closest(`li.items-header`).next(`ol.item-list`).find(`li.item`);
        const firstItem = app.object.items.get(firstItemLi?.data("itemId"));

        // Tidy5e sheet
        const prevItemLi = $(this).closest(`li.items-footer`).prev(`li.item`);
        const prevItem = app.object.items.get(prevItemLi?.data("itemId"));

        const item = firstItem || prevItem;
        const customSectionName = item?.getFlag(moduleName, "sectionName");
        if (!customSectionName) return;

        $(this).remove();
        return;

        /*
        // Add Item buttons create new item with pre-set custom section // Only works for Features; Inventory items pull a type from the header element
        $(this).click(function(event) {
            Hooks.once("preCreateItem", (item, data, options, userID) => {
                item.data.update({
                    flags: {
                        [moduleName]: { sectionName: customSectionName }
                    }
                });
            });
        });
        */
    });
});


function customSectionGetData(wrapped) {
    // Call wrapped function to get appData
    const data = wrapped();
    
    // Loop for Feature-type items, Inventory items, and Spell-type items
    for (const type of ["features", "inventory", "spellbook"]) {
        const itemsSpells = type === "spellbook" ? "spells" : "items";

        // Create array containing all items of current type
        const items = data[type].reduce((acc, current) => {
            if (current.isclass) return acc;

            return acc.concat(current[itemsSpells]);
        }, []);

        
        // Get items flagged with a custom section
        const customSectionItems = items.filter(i => i.flags[moduleName]?.sectionName);
        // Create array of custom section names
        const customSections = [];
        for (const item of customSectionItems) {
            if (!customSections.includes(item.flags[moduleName].sectionName)) customSections.push(item.flags[moduleName].sectionName);
        }

        // For items flagged with a custom section, remove them from their original section
        for (const section of data[type]) {
            section[itemsSpells] = section[itemsSpells].filter(i => !customSectionItems.includes(i));
        }

        // Create new custom sections and add to parent array
        for (const customSection of customSections) {
            const newSection = {
                label: customSection,
                [itemsSpells]: customSectionItems.filter(i => i.flags[moduleName].sectionName === customSection)
            };
            if (type === "features") {
                newSection.hasActions = false;
                newSection.isClass = false;
                newSection.dataset = { type: "feat" };
            } else if (type === "inventory") {

            } else if (type === "spellbook") {
                //newSection.spells = customSectionItems.filter(i => i.flags[moduleName].sectionName === customSection);
                newSection.canCreate = false;
                newSection.canPrepare = true;
                newSection.dataset = {
                    "preparation.mode": "prepared",
                    type: "spell"
                };
                newSection.usesSlots = false;
            }

            data[type].push(newSection);
        }
    }

    // Return updated data for sheet rendering
    return data;
}

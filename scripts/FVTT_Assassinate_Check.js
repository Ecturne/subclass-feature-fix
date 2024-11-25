// This code should run whenever a target is selected.
import {getSubclass, stopCodeUndefined, main, checkCombatStart, checkAssassin} from './fvtt_rogue_assassin.js';

export function removeAdvantage(actor){
    const advantageEffect = actor.effects.find(effect =>
        effect.label.toLowerCase().includes("advantage")
        );

    if (!advantageEffect) {
        ui.notifications.info(`${actor.name} does not have advantage.`);
        return;
    }

    advantageEffect.delete().then(() => {
        ui.notifications.info(`Advantage removed from ${actor.name}.`);
      }).catch(err => {
        console.error(err);
        ui.notifications.error("Failed to remove advantage.");
      });
}

export function compareInitiative(player, target){
    const playerInitiative = player.document.combatant.initiative
    const targetInitiative = target.document.combatant.initiative
    
    if (playerInitiative > targetInitiative){
        dnd5e.documents.macro.rollItem("Assassinate")
        let actor = player.actor;
        // Apply the Advantage condition
        actor.createEmbeddedDocuments("ActiveEffect", [{
            label: "Advantage",
            icon: "icons/svg/upgrade.svg", // You can customize the icon
            changes: [
            {
                key: "flags.dnd5e.advantage.all",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: true,
                priority: 10,
            },
            ],
            duration: { rounds: 1 }, // Set duration as needed
        }]);
    }
}

export function combatMain(){
    if (checkCombatStart() === false){
        return
    }

    const selectToken= canvas.tokens.controlled;    // Gets selected token
    const targets = Array.from(game.user.targets);  // Gets targeted Token
    const tokenTarget = targets[0]; // Grabs selected token info

    const mySubclass = getSubclass(selectToken) // Grabs Subclass of selected controlled player
    const mySelectedChar = selectToken[0]   // Isolates your selected controlled character

    const combat = game.combat;
    const round = combat.round

    if (stopCodeUndefined(mySelectedChar) === false){   // Checks if a controlled character is selected
        return
    }

    // Runs secondary check: Is a target selected?
    if (stopCodeUndefined(targets) === false){
        return
    } else if (stopCodeUndefined(tokenTarget) === false){
        return
    } else if (checkAssassin(mySubclass, mySelectedChar, 'Assassin') === false){    // Runs check: is character an assassin?
        return
    }

    if (round === 1){
        compareInitiative(mySelectedChar, tokenTarget)
    } else {
        main()
    }
}

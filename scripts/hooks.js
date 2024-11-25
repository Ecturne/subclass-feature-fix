import { getSubclass, main } from "./fvtt_rogue_assassin.js"; // Gets subclass
import { combatMain, removeAdvantage } from "./fvtt_assassinate_check.js";

// Hook runs when a character is controlled, selected, and a token it targeted
Hooks.on("targetToken", (user, target, targeted) => {
    // Check if the user targeting is the current player
    if (user.id != game.user.id) return;
  
    // Ensure the action happens during combat
    if (!game.combat) {
      // console.log("Not in combat; skipping hook.");
      return;
    }
    const controlledToken = canvas.tokens.controlled[0];
    if (!controlledToken) {
      // console.log("No token controlled by the user.");
      return;
    }
  
    const actor = controlledToken.actor;
  
    // Check if the actor's subclass is "Assassin"
    const subclass = getSubclass(canvas.tokens.controlled); // Adjust path for your system

    if (subclass != "Assassin") {
      // console.log(`${actor.name} is not an Assassin.`);
      return;
    }

    if (targeted) {
        combatMain()    // Code to execute when a target is selected
      console.log(`${user.name} has targeted ${target.name}.`);
      ui.notifications.info(`${user.name} has targeted ${target.name}.`);
    } else {
        removeAdvantage(actor)  // Code to execute when a target is unselected
        console.log(`${user.name} has untargeted ${target.name}.`);
    }
  });

  Hooks.on("dnd5e.preRollAttack", () => {
    Hooks.once("dnd5e.preRollDamage", () => {
      Hooks.once("midi-qol.RollComplete", () => {
        main()
      });
  });
});
function surpriseValue(choice, target) {
	if (choice === true){
        console.log(`${target['name']} was surprised`)
        return true
	} else if (choice === false){
        console.log(`${target['name']} was not surprised`)
        return false
	} else {
        console.log(`ERROR: surpriseVal function returned: ${choice}`)
        return
	}
}

function delay(ms){
    return new Promise(resolve =>
        setTimeout(() => {
            resolve();
        })
    )

}

function grabChatAttackData(player, target){
    const lastInputLength = game.messages.contents.length
    const chatlog = game.messages.contents

    if (lastInputLength === 0){
        return false

    }  else {
        for (let i = chatlog.length - 1; i >= 0; i--){
            // console.log(i)
            var parseChatLog = chatlog[i];
            console.log('iteration: ' + i)
            // console.log(parseChatLog)
            // console.log(parseChatLog.rolls)
            if (typeof parseChatLog != 'undefined'){
                if (parseChatLog.rolls && parseChatLog.rolls.length === 2) {
                    var lastInput = parseChatLog
                    console.log("BREAK")
                    break
                                     
                
                }
            }
        }
    }

    console.log(lastInput)
    if (!lastInput){
        console.log('No Attack Data Found')
        return false
    }
     
    const attacks = {damage:lastInput.rolls[1].product, rollData:lastInput.flags['midi-qol']}
    console.log(attacks)

    const rollData = lastInput.flags['midi-qol']
    const firstRollData = lastInput.rolls[0]
    const otherRollData = lastInput.rolls[1]
    console.log(otherRollData)

    var attackRoll =  rollData.d20AttackRoll  // Attack Roll
    var attackRollTotal = lastInput.rolls[1].product  // Attack Roll plus modifiers
    if (lastInput.rolls.length > 1 && (attackRoll != 1 &&
        attackRollTotal >= lastInput.rolls[0].options.targetValue)){
        var damageRoll =  otherRollData['_formula'] // Damage Roll
    } else {
        console.log(`${player['name']} failed to beat ${target['name']}'s AC`)
        return false
    }

    const crit = firstRollData.isCritical
    const advantageCheck = firstRollData.hasAdvantage
    const disadvantageCheck = firstRollData.hasDisadvantage
    var weapon = firstRollData.options.flavor
    let firstWord = weapon.split(" ")[0];
    const weaponType = otherRollData.options.type

    var combatData = {damageFormula: damageRoll, isCrit: crit, isAdvantage: advantageCheck,
                      isDisadvantage: disadvantageCheck, surprised: false, weapon:firstWord, weaponType:weaponType}
    return combatData
    
}

export function getSubclass(selectToken){ // Get Subclass info
    if (selectToken.length > 0){
        var mySelectedChar = selectToken[0]
        var mySubclass = mySelectedChar.actor.items.filter(item => item.type === 'subclass')

        mySubclass = mySubclass[0]['name'] // Actual Subclass

        console.log(`${mySelectedChar.name}'s subclass: ${mySubclass}`)
        return mySubclass
    } else {
         console.log('No Token Controlled')
        return false
    }
}

export function checkAssassin(mySubclass, mySelectedChar, desiredSubclass){ // Stops code if player is not an assassin
    if (mySubclass != desiredSubclass){
        // console.log(`${mySelectedChar.name} is not a(n) ${desiredSubclass}`);
        return false
    }
}

// Stops code if no target is selected
export function stopCodeUndefined(testVal){
    if (typeof testVal === 'undefined'){
        console.log('No targets selected!');
        return false
    }
}

export function checkCombatStart(){    // Checks to see if combat is active
    if (game.combat && game.combat.started === true) {
        return true;
    } else {
        return false;
    }
}

function surprisedCheck(){
    return new Promise((resolve) => {
        new Dialog({
            title: 'Target Surprise Check',
            content: "<p>Is the Target Surprised?</p>",
            buttons: {
                option1: {
                    label: 'Yes',
                    callback: () => resolve(true)
                },
                option2: {
                    label: 'No',
                    callback: () => resolve(false)
                }
            },
            default: 'option1,'
        }).render(true)
    });
}

function parseDiceRoll(diceRoll) {
    // Regular expression to match dice notation (e.g., '1d6', '10d5')
    const regex = /^(\d+)d(\d+)$/;
  
    // Test if the string matches the dice format
    const match = diceRoll.match(regex);
  
    if (match) {
      // Extract and parse the numbers
      const numDice = parseInt(match[1], 10); // The number before 'd'
      const diceType = parseInt(match[2], 10); // The number after 'd'
      return {numDice, diceType};
    } else {
      throw new Error("Invalid dice roll format. Use the format XdY (e.g., '1d6').");
    }
  }

function doDamage(player, target, data, level, round){
    // Conditions
    let surprised = data.surprised
    let crit = data.isCrit
    let adv = data.isAdvantage
    let disAdv = data.isDisadvantage

    if (disAdv === true){
        console.log('Secondary Disadvantage check, I should be skipped!')
        return // No effects are applied because you have disadvantage
    }

    let damage = data.damageFormula // Pulls formula of attack used
    
    // Strip damage to values
    const regex = /(\d+d\d+)\s*(.*)/;
    const match = damage.match(regex);
    if (match) {
        // The dice roll part (e.g., '1d6')
        var diceRoll = match[1];
        // console.log(`Dice Roll: ${diceRoll}`);
    } else {
        console.log("Invalid damage string.");
        return
    }

    let rolls = parseDiceRoll(diceRoll)
    console.log(rolls)

    if (surprised === true && crit === true){   // As far as I know, this changes nothing
        console.log('Congratulations! You hit a crit on a surprised target!')
    }
    
    if (crit === true){
        rolls.numDice /= 2
    }
    
    if (surprised === true && crit != true){  // If an attack is a surprised attack, then crits are automatically applied.
        crit = true
        // rolls.numDice *= 2
        const critRoll = new dnd5e.dice.DamageRoll(`${rolls.numDice}d${rolls.diceType}`, {}, {type:data.weaponType})
        console.log('CritRoll: ' + critRoll)
        /// critRoll.toMessage({
        //     flavor: "Blood Blitz",
        //     speaker: ChatMessage.implementation.getSpeaker({actor: token.actor})
        //   });
        // const weapon = data.weapon
        const weaponType = data.weaponType
        // console.log(critRoll['_formula'])
        let addedCritDamage = new Promise((resolve) => {
            resolve(ui.chat.processMessage('/r ' + critRoll['_formula']));
        });
        addedCritDamage.then(value => {
            let damage = value.content
            console.log(damage);
            target.actor.applyDamage(damage)
            // let targetHP = target.actor.system.hp.value
            // const damages = [{value: damage, type: weaponType}];
            // new Promise((resolve, reject) => {
            //     const total = target.calculateDamage(damages).reduce((acc, k) => acc + k.value, 0);
                
            // });
            
        });
        
        setTimeout(() => {
            }, 2800)
    }

    if (adv === true){

    }

    if (crit === true){
        dnd5e.documents.macro.rollItem("Sneak Attack")
        setTimeout(() => {
        dnd5e.documents.macro.rollItem("Sneak Attack");
        }, 4000)
    } else {
        dnd5e.documents.macro.rollItem("Sneak Attack")
    }
}

// Begin running code here
export function main(){
    const selectToken= canvas.tokens.controlled;    // Gets selected token
    const targets = Array.from(game.user.targets);  // Gets targeted Token
    const tokenTarget = targets[0]; // Grabs selected token info

    // console.log(tokenTarget); // Shares Target Token info in console

    const mySubclass = getSubclass(selectToken) // Grabs Subclass of selected controlled player
    const mySelectedChar = selectToken[0]   // Isolates your selected controlled character

    if (stopCodeUndefined(mySelectedChar) === false){   // Checks if a controlled character is selected
        return
    }

    const myLevel = mySelectedChar.actor.system.details.level   // Grab your Character's level

    console.log('Character Level: ' + myLevel)

    // Runs secondary check: Is a target selected?
    if (stopCodeUndefined(targets) === false){
        return
    } else if (stopCodeUndefined(tokenTarget) === false){
        return
    } else if (checkAssassin(mySubclass, mySelectedChar, 'Assassin') === false){    // Runs check: is character an assassin?
        return
    }

    var attackData = grabChatAttackData(mySelectedChar, tokenTarget) // Checks if an attack rolled and grabs data
      
    if (attackData === false || !attackData){
        return
    }

    const combatActive = checkCombatStart()  // Checks if combat is active
    // If Combat is active, run general combat rules, otherwise run surprised check
    if(combatActive === true){  // Surprised is not possible during combat
        console.log("Combat is active.");
        doDamage(mySelectedChar, tokenTarget, attackData, myLevel)
    } else if (combatActive === false){
        let surprised = null;
        console.log("Combat is not active.");
        surprisedCheck().then((result) => {
            surprised = surpriseValue(result, tokenTarget)
            if (surprised === true) {
                attackData['surprised'] = true
                doDamage(mySelectedChar, tokenTarget, attackData, myLevel)
            } else {
                doDamage(mySelectedChar, tokenTarget, attackData, myLevel)
            }
        })
    }
}

# Subclass Automator
> Version 1.0.0 INITIAL LAUNCH :^)
> #### Foundry Compatibility: 
>  - Min: 11
>  - Tested: 12.331

# About
The Subclass Automator function servers to automate certain subclass features and attacks that Foundry VTT or MIDI-QOL seem to not have built in.

## Version ChangeLog

 - Only contains automation for **Rogue Assassin** subclass
    - Automates **Sneak Attack**.
    - Determines whether the **Assassinate** conditions are met.
    - Critical damage is calculated.

## Current Known Bugs

 1. Players do not have permissions to damage critical damage on target token. Gamemaster is able to do so.

## Wishlist

 - Create a module menu in module settings for Gamemaster to select which subclass automations to run (currently only Rogue Assassin is available).
 - Optimize calls, hooks, and functions.
 - Reduce Chat Log spam.

### NOTE
The Subclass Automator module requires MIDI-QOL, preferably set to total automation.
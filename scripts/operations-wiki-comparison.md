# Operations JSON vs Wiki Comparison

Comparing operations.json attributes with https://dunespicewars.fandom.com/wiki/Operations

## Common Operations

### Probe Setup ✓
- **Wiki**: "Reveals all information and units in the region. Advances detection of any Sietch in the region"
- **JSON**: Has 4 attributes including the wiki content + extra details
- **Status**: OK (has more detail than wiki)

### Defense Sabotage ⚠️
- **Wiki**: "Missile Batteries and Main Base suffer -30% Power"
- **JSON**: "[Missile Batterys] and [Main Base] suffer: -30% [Power]"
- **Issues**: 
  - "Batterys" should be "Batteries" (typo)
  - Formatting difference (minor)

### Leave Order ✓
- **Wiki**: "Lose 100 Solari per unit in the Region at the end of the operation"
- **JSON**: "Lose 100 [Solari] per unit in the Region at the end of the operation"
- **Status**: OK

### Supply Drop ✓
- **Wiki**: "Ally non-mechanical units receive: Gain +80 Supply daily This unit will not lose Supply"
- **JSON**: "Ally non-mechanical units receive: Gain +80 [Supply] daily, Grants [Supply] protected"
- **Status**: OK (equivalent)

### Scavenger Team ✓
- **Wiki**: "Converts 25% of the max Health of any dying Military Units into Solari +20% resources from pillaging a village"
- **JSON**: "Gain 25% of the maximum [Health] of Military Units that die in the region as [Solari]", "+20% [pillage] gain"
- **Status**: OK

### Decoy Thumper ✓
- **Wiki**: "Call a Sandworm to this region Protect neighboring regions from a Sandworm attacks"
- **JSON**: "A [Sandworm] has been called in this region", "Neighboring Region are protected from [Sandworm] attacks"
- **Status**: OK

### EMP Bomb ⚠️
- **Wiki**: "Mechanical units, Missile Batteries and Main Bases suffer: -50% attack speed -20% Speed"
- **JSON**: Has "-0.5 attack speed" and "-0.2 Speed" (equivalent) but also has extra messy attributes: "Grants t building gain t trait2", "-0.5 attack speed ranged"
- **Issues**: Has unresolved placeholders/technical attributes

### Administrative Burden ✓
- **Wiki**: "Target faction Military Units are trained at -60% speed Target Main Base constructs Buildings at -60% speed"
- **JSON**: "Target faction Military Units are trained at -60% speed", "Target Main Base constructs at -60% speed"
- **Status**: OK

### Defense Breaches ✓
- **Wiki**: "+50% damage received by the target Main Base -3 Armor to target Main Base"
- **JSON**: "+50% damage received by the target Main Base", "-3 [Armor] to target Main Base"
- **Status**: OK

## Atreides Operations

### Support Intelligence ⚠️
- **Wiki**: "Gives -5% damage received to Atreides and allies per launched operation on the zone"
- **JSON**: "[Units] gains -5% [damage] received by [operations] in the region"
- **Issues**: Formatting/wording difference, but meaning seems similar

### Arrakis Diplomacy ✓
- **Wiki**: "Disbands rebellions and raids +200% increased relation gain and resources received from trade with Sietch"
- **JSON**: "Disband all rebellions and raids", "+200% increased relation gain and resources received from trade with [Sietch]"
- **Status**: OK

### Cease Fire ✓
- **Wiki**: "Interrupts and prevents battles in target Region for 2 days."
- **JSON**: "Interrupts and prevents battles in target Region for 2 days."
- **Status**: OK

## Harkonnen Operations

### Combat Drugs ⚠️
- **Wiki**: "Ally non-mechanical units gain: -10% Health per day +10% Speed Attacks deal +30% damage"
- **JSON**: "-0.1 health decay per day", "+10% [Speed]", "+30% damage", "0 health regen m ratio"
- **Issues**: 
  - "-10% Health per day" vs "-0.1 health decay per day" (equivalent but different format)
  - Has extra "0 health regen m ratio" attribute
  - Missing explicit "Attacks deal" wording

### Sleeper Agent ✓
- **Wiki**: "Any non-temporary non-mechanical unit has a 50% chance to spawn a Sleeper Agent upon death in combat"
- **JSON**: "Any non-temporary non-mechanical units has a 50% chance to spawn a [Sleeper Agent] upon death in combat"
- **Status**: OK (minor grammar: "units" vs "unit")

### Toxic Vapors ✓
- **Wiki**: "Any non-mechanical units suffer: No Health regeneration -30% Health per day"
- **JSON**: "Any non-mechanical unit suffers: No health regeneration", "-0.3 health decay per day"
- **Status**: OK (equivalent, different format)

## Smuggler Operations

### Poison the Reserves ❌
- **Wiki**: "Units losing supply suffer: -20% Speed -5% Health per day"
- **JSON**: "Grants losing supply gain t trait, Grants losing supply gain t trait, Units losing supply suffer: +80% speed m ratio, -0.05 health decay per day"
- **Issues**: 
  - **CRITICAL**: Says "+80% speed m ratio" instead of "-20% Speed"
  - Has duplicate "Grants losing supply gain t trait" 
  - Has unresolved technical attributes

### Extraction Network ✓
- **Wiki**: "Every unit around the Region's Village is extracted to Sietch Tuek instantly"
- **JSON**: "Every unit around the Region's is extracted to [Sietch Tuek] instantly for the duration"
- **Status**: OK (minor wording difference)

### Communication Jamming ⚠️
- **Wiki**: "Cancels all current and blocks new operations in the Region for 3 days"
- **JSON**: "Grants operation block"
- **Issues**: Missing duration (3 days) and "cancels all current" part

## Fremen Operations

### Hiding Tracks ⚠️
- **Wiki**: "Allied units in the region and its neighbors get Stealth Enemy units in the region and its neighbors suffer -10% Speed"
- **JSON**: Has duplicates: "Ally units in the region and its neighbors get [Sneak]" (x2), "Enemy units in the region and its neighbors suffer -0.1 Speed" (x2)
- **Issues**: Duplicate attributes, "-10% Speed" vs "-0.1 Speed" (equivalent but inconsistent format)

### Hidden Thumpers ⚠️
- **Wiki**: "Riding Sandworms to or from this region does not consume Thumper Military Units in the region gain Stealth"
- **JSON**: "Grants wormriding no cost", "Military units in the region gain [?]"
- **Issues**: Has unresolved placeholder "[?]" instead of "Stealth"

### Awake the People ✓
- **Wiki**: "Start a rebellion in the village"
- **JSON**: "Start a rebellion in the village"
- **Status**: OK

## Corrino Operations

### Consolidation ⚠️
- **Wiki**: "+2 Armor to mechanical units and structures"
- **JSON**: "+2 [Armor] to mechanical units and structures", "+100% building armor", "+100% main base armor"
- **Issues**: Has extra attributes not mentioned in wiki (may be correct but more detailed)

### Interdiction Zone ✓
- **Wiki**: "Carryalls cannot be used Airfield cannot be used"
- **JSON**: "Grants carryall stopped", "[Airfield] cannot be used"
- **Status**: OK (equivalent)

### Orbital Strike ⚠️
- **Wiki**: "Missiles strike from orbit targeting all ground enemy units, Villages and Main Bases, dealing heavy damage at the are of impact to ally and enemy units"
- **JSON**: "Missiles strike from orbit targetting all ground enemy units, , and Main Bases, dealing heavy damage at the area of impact to ally and enemies units.", "+1 C_MissileShip"
- **Issues**: 
  - Has double comma ", ,"
  - Has extra "+1 C_MissileShip" attribute
  - "targetting" should be "targeting" (typo)

## Ecaz Operations

### Epic Quest ⚠️
- **Wiki**: "Attacks of the Military Unit with the most Power in the region deal +100% damage"
- **JSON**: "+100% damage m ratio", "Attacks of the Military Unit with the most [Power] in the region deal +100% damage"
- **Issues**: Has duplicate/technical attribute "+100% damage m ratio"

### Live Performance ⚠️
- **Wiki**: "Gain 5 Influence upon killing enemy units Lose 5 Influence upon units dying or leaving the Region"
- **JSON**: "Gain 5 [Influence] upon killing enemy units", "Lose 5 [Influence] upon units dying or leaving the Region", "+400% Influence"
- **Issues**: Has extra "+400% Influence" attribute (may be correct but not in wiki)

### Elacca Fog ✓
- **Wiki**: "In combat, non-mechanical units cannot be controlled"
- **JSON**: "Grants human in combat uncontrollable"
- **Status**: OK (equivalent, different wording)

## Vernius Operations

### Ambient Connection ⚠️
- **Wiki**: "Ally mechanical units are Tethered remotely"
- **JSON**: "Ally mechanical units are [Tethered] remotely" (appears twice)
- **Issues**: Duplicate attribute

### Empirical Data ✓
- **Wiki**: "+1 Knowledge per units of any faction in combat in the region"
- **JSON**: "+1 [Knowledge]", "+1 [Knowledge] per units of any faction in combat in the region"
- **Status**: OK (has base +1 Knowledge which may be correct)

### Hidden Backdoor ✓
- **Wiki**: "Enemy mechanical units cannot be controlled and attack their allies"
- **JSON**: "Enemy mechanical units cannot be controlled and attack their allies"
- **Status**: OK

## Summary of Issues

### Critical Issues:
1. **Poison the Reserves**: Wrong value (+80% instead of -20% Speed)
2. **Hidden Thumpers**: Unresolved placeholder "[?]"
3. **EMP Bomb**: Has unresolved technical attributes

### Minor Issues:
1. **Defense Sabotage**: Typo "Batterys" → "Batteries"
2. **Orbital Strike**: Typo "targetting" → "targeting", double comma
3. **Sleeper Agent**: Grammar "units" → "unit"
4. **Hiding Tracks**: Duplicate attributes
5. **Ambient Connection**: Duplicate attribute
6. **Poison the Reserves**: Duplicate "Grants losing supply gain t trait"
7. **Communication Jamming**: Missing duration and "cancels all current" part

### Formatting/Consistency Issues:
- Some use "-10% Speed", others use "-0.1 Speed" (inconsistent)
- Some have extra technical attributes not in wiki (may be correct)
- Some have unresolved placeholders or technical trait references

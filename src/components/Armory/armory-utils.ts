import type { FactionLabel } from "../../store"
import unitsData from "../Units/units.json"
import armoryData from "./armory.json"

export interface GearItem {
  name: string
  unit: string[]
  faction: string[]
  attributes: (string | { desc: string; target_effects_list: string[] })[]
  image: string
}

export interface UnitData {
  id: string
  name: string
  desc: string
  equipment: string[]
  flags: number
}

const gearItems = armoryData as GearItem[]

/** Maps store faction label to units.json key */
const factionToUnitsKey: Record<FactionLabel, keyof typeof unitsData> = {
  harkonnen: "Harkonnen",
  atreides: "Atreides",
  ecaz: "Ecaz",
  smuggler: "Smugglers",
  vernius: "Vernius",
  fremen: "Fremen",
  corrino: "Corrino",
}

/** Get units for a faction */
export function getUnitsForFaction(faction: FactionLabel): UnitData[] {
  const key = factionToUnitsKey[faction]
  return (unitsData[key] as UnitData[]) || []
}

/** Get gear item by name */
export function getGearByName(name: string): GearItem | undefined {
  return gearItems.find((g) => g.name === name)
}

/** Maps equipment ID (from units.json) to gear name (in armory.json) */
const equipmentIdToGearName: Record<string, string> = {
  // Atreides
  FrontLineTactics: "Front Line Tactics",
  OffensiveMindset: "Offensive Mindset",
  ParryingArmguards: "Parrying Armguards",
  PranaBindu: "Prana Bindu",
  CrossfireTactics: "Crossfire Tactics",
  SniperRifles: "Long Rifle",
  AutomaticWeapons: "Automatic Weapons",
  WarMemoir: "War Memoir",
  DistractingFlashes: "Distracting Flashes",
  HeavyLoads: "Heavy Loads",
  WhistlingAmmo: "Whistling Ammo",
  KrakenProtocols: "Kraken Protocols",
  SupportingField: "Supporting Field",
  EvasionBooster: "Evasion Booster",
  OptmizedBedArrangement: "Optimized Bed Arrangement",
  CoverTactics: "Cover Tactics",
  LastStandProtocols: "Last Stand Protocols",
  // Harkonnen
  ScarringArmor: "Scarring Armor",
  MorbidClimax: "Morbid Climax",
  FixupKit: "Fix-up Kit",
  RedFluid: "Red Fluid",
  BloodThinner: "Blood Thinner",
  BirdSlayer: "Bird Slayer",
  ElaccaInjector: "Elacca Injector",
  AssassinArmors: "Stealth Gear",
  EndocrineArouser: "Endocrine Arouser",
  TortureTools: "Torture Tools",
  MountedExplosives: "Mounted Explosives",
  OpticCamouflage: "Optic Camouflage",
  VirtualBlackBox: "Virtual Black Box",
  HibernationBreastplate: "Hibernation Breastplate",
  MeatArmor: "Meat Armor",
  // Fremen
  DryTraining: "Dry Training",
  SandCover: "Sand Cover",
  ConfusingTactics: "Confusing Tactics",
  ShelterMaps: "Shelter Maps",
  CamouflageFabric: "Camouflage Fabric",
  ScatterGrenades: "Scatter Grenades",
  AntiPersonalShrapnels: "Anti-personnel Shrapnels",
  LoudBang: "Loud Bang",
  ElectronicScrambler: "Electronic Scrambler",
  ChasingStance: "Chasing Stance",
  FocusedMind: "Focused Mind",
  FoldingFrame: "Folding Frame",
  AmbushCamouflage: "Ambush Camouflage",
  ShadowScan: "Shadow Scan",
  PreLoadedWeapons: "Pre-Loaded Weapons",
  MakersEffigy: "Maker's Effigy",
  DevastatingStrikes: "Devastating Strikes",
  SelfSufficiency: "Self-sufficiency",
  // Smugglers
  GnarlyRecyclers: "Gnarly Recyclers",
  HeavyArmor: "Heavy Armor",
  DismantlingTools: "Dismantling Tools",
  ConcentratedToxins: "Concentrated Toxins",
  Bazookas: "Bazooka",
  TraumaticRepeater: "Traumatic Repeater",
  StingingGaz: "Stinging Gas",
  PropellingAmmo: "Propelling Ammo",
  RecursiveLense: "Recursive Lens",
  BarrelCleaner: "Barrel Cleaner",
  ShieldingStraightener: "Shielding Straightener",
  ShockDampener: "Shock Dampener",
  MotivationalCashbox: "Motivational Cashbox",
  RunningSandshoes: "Running Sandshoes",
  DualGuns: "Dual Guns",
  // Corrino
  SmallFormation: "Small Formation",
  SupportingTactics: "Supporting Tactics",
  LiveReformation: "Live Reformation",
  WideNozzle: "Wide Nozzle",
  ExoticCompounds: "Exotic Compounds",
  PhosphorusMix: "Phosphorus Mix",
  TerrifyingMask: "Terrifying Mask",
  LongCannons: "Long Cannons",
  IncendiaryAmmo: "Incendiary Ammo",
  FrighteningReputation: "Frightening Reputation",
  SardaukarCleaver: "Sardaukar's Cleaver",
  BattlefieldFrenzy: "Battlefield Frenzy",
  // Ecaz
  KnightlyProtector: "Knightly Protector",
  SoberingMedication: "Sobering Medication",
  PricklySpear: "Prickly Spear",
  JumpingBoot: "Jumping Boot",
  PersonalMantlet: "Personal Mantlet",
  DistractingLights: "Distracting Lights",
  MarchingColors: "Marching Colors",
  PropagandaMachine: "Propaganda Machine",
  BigBanner: "Big Banner",
  VowOfBravery: "Vow of Bravery",
  VowOfFervor: "Vow of Fervor",
  VowOfHeroism: "Vow of Heroism",
  VowOfHonor: "Vow of Honor",
  // Vernius
  MaterialPreProcessor: "Material Pre-processor",
  HeavyShielding: "Heavy Shielding",
  AnatomicalScanner: "Anatomical Scanner",
  SmartLens: "Learning Transistors",
  TinkeringGear: "Tinkering Gear",
  DIYKit: "DIY Kit",
  WarmMagnets: "Strong Magnets",
  DisruptiveField: "Fractal Frequencies",
  FeedbackGate: "Feedback Gate",
  SmartArmor: "Deep Signals",
  RepeaterNode: "Repeater Node",
  WorkShelter: "Work Shelter",
  MultiParts: "Multi Parts",
  MemoryImplant: "Memory Implant",
}

/** Get available gear for a unit (based on equipment array) */
export function getGearOptionsForUnit(unit: UnitData): GearItem[] {
  return unit.equipment
    .map((equipId) => {
      const gearName = equipmentIdToGearName[equipId]
      if (!gearName) return undefined
      return getGearByName(gearName)
    })
    .filter((g): g is GearItem => g !== undefined)
}

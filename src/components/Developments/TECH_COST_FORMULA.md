# Tech learning time/cost – investigation

## Summary

The game uses a **path-dependent** development (tech) cost formula. Cost is in **Knowledge**; time to complete a tech is **cost ÷ research rate** (Knowledge per day), where research rate is not a single constant in data—it depends on Research Hubs, treaties, etc.

This doc ties together: (1) the formula from `res/assets/data.cdb`, (2) the community analysis (Discord “shallow vs deep” comparison), and (3) possible future integrations

---

## 1. Formula from `data.cdb`

### Constants (sheet `constant`)

| Constant | Value | Notes |
|----------|--------|--------|
| `Development_BaseCost` | **10** | Base cost factor |
| `Development_ScalePerStep` | **1.036** | Multiplier per “step” (close to Discord’s 1.04) |
| `Development_StepsPerTier` | **[2, 3, 4, 5]** | Steps for tier 0, 1, 2, 3 |

### Official cost formula (from constant comment)

```
cost(dev) = BaseCost × (ScalePerStep ^ TotalStepResearched) × (ScalePerStep^StepForCurrentDev - 1) / (ScalePerStep - 1)
```

- **TotalStepResearched**: sum of the **steps** of all developments already researched (order matters).
- **StepForCurrentDev**: number of steps for the development being researched = `Development_StepsPerTier[tier]`.

So:

- Tier 0 → 2 steps  
- Tier 1 → 3 steps  
- Tier 2 → 4 steps  
- Tier 3 → 5 steps  

The fraction `(ScalePerStep^StepForCurrentDev - 1) / (ScalePerStep - 1)` is the sum of a geometric progression (1 + r + r² + … + r^(n−1)) for `n = StepForCurrentDev`, i.e. the “cost weight” of that tech’s steps.

### Relation to Discord – simple version with examples

**What the Discord comparison showed:** If you research **shallow techs first** (low tiers), you get **more techs for the same total cost** than if you go **deep first** (high tiers). Same formula, different order = different “tempo”.

**Concrete examples (using the game formula):**

- **Your 1st tech** (any tier 0): you’ve researched 0 steps so far → cost ≈ **20.4 Knowledge**.
- **Your 2nd tech** (another tier 0): you’ve now 2 steps (from the first tech) → cost ≈ **21.1 Knowledge**.
- **Your 2nd tech** (tier 1 instead): still 2 steps so far → cost ≈ **32.0 Knowledge** (tier 1 = 3 steps, so pricier).

So the **same 2nd slot** costs more if you pick a higher-tier tech. If you keep picking high-tier techs early, your total cost grows faster and you unlock fewer techs for the same amount of Knowledge. That’s the “shallow first = more tempo” idea from Discord. The game formula (with steps per tier and ScalePerStep 1.036) matches the numbers from that analysis (e.g. first tech ≈ 20.36).

---

## 2. Data in the app and CDB

### `developments.json` (built from `data.cdb` sheet `development`)

- **id**, **name**, **desc**, **domain**, **tier** (0–3), **gridX**, **gridY**, **requires**, **replaces**, **faction**, **gfx**, **attributes**.
- **tier** is what we need for `Development_StepsPerTier[tier]`.
- **requires** (and effective requires via **replaces**) define the tree; we can compute a **prerequisite path** to any tech.

### `data.cdb` development sheet

- Same fields; `tier` is documented as: “Defines the development default cost (cost per tier are defined in the constant sheet)”.
- No separate “time” or “days” field; time = cost / (Knowledge per day).

### Build scripts

- `scripts/build-developments.js` reads `res/assets/data.cdb` and writes `src/components/Developments/developments.json`. If the game adds new cost-related fields to the development sheet, the build can be extended to expose them.

---

## 3. What we can implement

### Cost (Knowledge)

- **Inputs**: development id (or entry with `tier`), and a **research order** (list of development ids already researched before this one).
- **Steps**: from `Development_StepsPerTier[tier]` (0→2, 1→3, 2→4, 3→5).
- **TotalStepResearched**: sum of steps of all devs in the chosen order.
- **Cost** = `BaseCost × ScalePerStep^TotalStepResearched × (ScalePerStep^steps - 1) / (ScalePerStep - 1)`.

We can support:

1. **Current build order**: use `selectedDevelopments` as the order; cost of a tech = cost when researched at the position it appears (or “next” if not yet in the list).
2. **Minimum path**: topological order of prerequisites only (e.g. BFS from roots, then required chain to target). Gives “cost to research this tech if you only ever research prerequisites”.
3. **Custom order**: user picks an order (e.g. for a “simulator” or planning view).

### Time (days)

- **Time = cost ÷ (Knowledge per day)**.
- Knowledge per day is **not** in the CDB (it depends on Research Hubs, treaties, etc.). We use a **default of 5 Knowledge/day** for all estimates so we can show "~X days" in the UI. Example: 100 Knowledge → 100 ÷ 5 = **20 days**.

### UI hooks

- **Development detail tooltip**: show “Research cost: ~N Knowledge” (and optionally “~M days at K Knowledge/day”).
- **Developments panel**: e.g. “Total cost of current selection” or “Cost to add this tech next”.
- **Future**: path optimizer (“cheapest order for these techs”), or “time to 4× T4 from 3 trees” style goals.

---

## 4. Constants to keep in sync

| Constant | Value | Where |
|----------|--------|--------|
| `Development_BaseCost` | 10 | data.cdb → `src/utils/techCost.ts` |
| `Development_ScalePerStep` | 1.036 | data.cdb → `src/utils/techCost.ts` |
| `Development_StepsPerTier` | [2, 3, 4, 5] | data.cdb → `src/utils/techCost.ts` |
| **Default Knowledge/day** | **5** | Not in CDB; used for “time in days” estimates in the app |

If the game patches and changes balance, update the first three in `src/utils/techCost.ts`.

---

## 5. References

- **CDB**: `res/assets/data.cdb` → sheet `constant` (Development_BaseCost, Development_ScalePerStep, Development_StepsPerTier), sheet `development` (tier, requires, replaces).
- **App**: `src/components/Developments/developments.json`, `DevelopmentsPicker.tsx` (selectedDevelopments order), `DevelopmentDetailTooltip.tsx` (per-dev tooltip).
- **Discord**: “Shallow techs first” vs “deep techs first” comparison; formula `10 * Base^(P[[i]] - 1)`; finding that same total cost yields more techs (tempo) with shallow-first.

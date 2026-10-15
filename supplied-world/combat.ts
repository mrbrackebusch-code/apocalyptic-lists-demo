// AL-IMPLEMENTATION-1.0. No Sprite construction, mutation, side effects or frame scheduling.
namespace apocCombat {
    function copyStrings(a: string[]): string[] { return a ? a.slice() : []; }
    function copyNumbers(a: number[]): number[] { return a ? a.slice() : []; }
    function copySprites(a: Sprite[]): Sprite[] { return a ? a.slice() : []; }
    function copyPower(p: apocTypes.PowerSource): apocTypes.PowerSource {
        if (!p) return null;
        const q = new apocTypes.PowerSource();
        q.side = p.side; q.index = p.index; q.isAll = p.isAll;
        q.bonus = copyPower(p.bonus);
        return q;
    }
    function copyActor(a: apocTypes.ActorState): apocTypes.ActorState {
        const b = new apocTypes.ActorState();
        b.id = a.id; b.sprite = a.sprite; b.side = a.side;
        b.hp = a.hp; b.maxHP = a.maxHP; b.ability = a.ability;
        b.trait = a.trait; b.present = a.present; b.held = a.held;
        b.ward = copyPower(a.ward); b.venom = copyPower(a.venom);
        b.empower = copyPower(a.empower);
        return b;
    }
    function copyLists(a: apocTypes.CombatLists): apocTypes.CombatLists {
        const b = new apocTypes.CombatLists();
        b.allyMoves = copyStrings(a.allyMoves);
        b.allyValues = copyNumbers(a.allyValues);
        b.allyTargets = copySprites(a.allyTargets);
        b.enemyMoves = copyStrings(a.enemyMoves);
        b.enemyValues = copyNumbers(a.enemyValues);
        b.enemyTargets = copySprites(a.enemyTargets);
        return b;
    }
    export function cloneTrial(value: apocTypes.TrialSnapshot): apocTypes.TrialSnapshot {
        if (!value) return null;
        const t = new apocTypes.TrialSnapshot();
        t.lists = value.lists ? copyLists(value.lists) : null;
        t.actors = [];
        if (value.actors) for (let i = 0; i < value.actors.length; i++) {
            if (value.actors[i]) t.actors.push(copyActor(value.actors[i]));
            else t.actors.push(null);
        }
        t.roster = copySprites(value.roster); t.sourceMoves = copyStrings(value.sourceMoves);
        t.goal = value.goal; t.requiredIDs = copyStrings(value.requiredIDs);
        return t;
    }
    function validMove(m: string): boolean {
        return m === "Strike" || m === "Flurry" || m === "Mend" ||
            m === "Ward" || m === "Venom" || m === "Reap" || m === "Empower";
    }
    function validTrait(m: string): boolean {
        return m === "Plain" || m === "Piercer" || m === "Cleanser" || m === "Steadfast" || m === "Leech";
    }
    // Disallow NaN and infinities as invalid authored numbers (Infinity - Infinity is NaN).
    function integer(v: number): boolean {
        return typeof v === "number" && v - v === 0 && v === Math.floor(v) && v >= 0;
    }
    function validPower(p: apocTypes.PowerSource, t: apocTypes.TrialSnapshot, depth: number): boolean {
        if (!p) return true;
        if (depth > 12 || (p.side !== apocTypes.Side.Ally && p.side !== apocTypes.Side.Enemy)) return false;
        const values = p.side === apocTypes.Side.Ally ? t.lists.allyValues : t.lists.enemyValues;
        return integer(p.index) && p.index < values.length && typeof p.isAll === "boolean" &&
            validPower(p.bonus, t, depth + 1);
    }
    function markHasOwner(t: apocTypes.TrialSnapshot, p: apocTypes.PowerSource, move: string): boolean {
        if (!p) return true;
        let found = false;
        for (let i = 0; i < t.actors.length; i++) {
            const a = t.actors[i];
            if (a && a.side === p.side && a.ability === move) found = true;
        }
        return found && (!p.bonus || markHasOwner(t, p.bonus, "Empower"));
    }
    // Keep every list statically typed. Reading .length through an `any` cell
    // emits a PXT interface lookup, but native Array objects are not interfaces.
    function validateStrings(a: string[], name: string, e: string[]): void {
        if (!a || !Array.isArray(a)) { e.push(name + " must be an array"); return; }
        if (a.length > 10) e.push(name + " capacity");
        for (let i = 0; i < a.length; i++) if (typeof a[i] !== "string") e.push(name + " invalid move type at " + i);
    }
    function validateNumbers(a: number[], name: string, e: string[]): void {
        if (!a || !Array.isArray(a)) { e.push(name + " must be an array"); return; }
        if (a.length > 10) e.push(name + " capacity");
        for (let i = 0; i < a.length; i++) if (!integer(a[i]) || a[i] > 9) e.push(name + " invalid number at " + i);
    }
    function validateTargets(a: Sprite[], name: string, e: string[]): void {
        if (!a || !Array.isArray(a)) { e.push(name + " must be an array"); return; }
        if (a.length > 10) e.push(name + " capacity");
    }
    export function validate(value: apocTypes.TrialSnapshot, allTarget: Sprite): string[] {
        const e: string[] = [];
        if (!value || !value.lists || !value.actors || !value.roster || !value.sourceMoves || !value.requiredIDs) {
            e.push("missing trial fields"); return e;
        }
        if (!Array.isArray(value.actors) || !Array.isArray(value.roster) ||
            !Array.isArray(value.sourceMoves) || !Array.isArray(value.requiredIDs)) {
            e.push("invalid snapshot collection type"); return e;
        }
        const l = value.lists;
        validateStrings(l.allyMoves, "allyMoves", e);
        validateNumbers(l.allyValues, "allyValues", e);
        validateTargets(l.allyTargets, "allyTargets", e);
        validateStrings(l.enemyMoves, "enemyMoves", e);
        validateNumbers(l.enemyValues, "enemyValues", e);
        validateTargets(l.enemyTargets, "enemyTargets", e);
        if (e.length) return e;
        if (value.actors.length < 4 || value.actors.length > 8) e.push("invalid actor count");
        if (value.roster.length > 10 || value.sourceMoves.length > 10) e.push("teaching list capacity");
        for (let i = 0; i < value.sourceMoves.length; i++) if (typeof value.sourceMoves[i] !== "string") e.push("source move type");
        if (!allTarget || typeof allTarget !== "object") e.push("missing or invalid ALL_TARGET identity");
        let allies = 0; let enemies = 0;
        for (let i = 0; i < value.actors.length; i++) {
            const a = value.actors[i];
            if (!a || typeof a.id !== "string" || a.id.length === 0 ||
                !a.sprite || typeof a.sprite !== "object" || a.sprite === allTarget) {
                e.push("invalid actor/identity at " + i); continue;
            }
            if (a.side === apocTypes.Side.Ally) allies++;
            else if (a.side === apocTypes.Side.Enemy) enemies++;
            else e.push("invalid side: " + a.id);
            if (!integer(a.hp) || !integer(a.maxHP) || a.maxHP < 1 || a.hp > a.maxHP) e.push("invalid HP: " + a.id);
            if (!validMove(a.ability)) e.push("invalid ability: " + a.id);
            if (!validTrait(a.trait) || (a.side === apocTypes.Side.Ally && a.trait === "Plain")) e.push("invalid trait: " + a.id);
            if (typeof a.present !== "boolean" || typeof a.held !== "boolean") e.push("invalid actor flags: " + a.id);
            if (!validPower(a.ward, value, 0) || !validPower(a.venom, value, 0) || !validPower(a.empower, value, 0) ||
                !markHasOwner(value, a.ward, "Ward") || !markHasOwner(value, a.venom, "Venom") ||
                !markHasOwner(value, a.empower, "Empower")) e.push("invalid mark: " + a.id);
            for (let j = 0; j < i; j++) {
                const b = value.actors[j];
                if (b && (b.id === a.id || b.sprite === a.sprite)) e.push("duplicate actor identity: " + a.id);
                if (b && b.side === a.side && b.ability === a.ability) e.push("duplicate side ability: " + a.ability);
            }
        }
        if (allies < 3 || allies > 4 || enemies < 1 || enemies > 4) e.push("invalid team size");
        if (value.goal !== "defeat_all" && value.goal !== "survive_pass") e.push("unknown battle goal");
        for (let i = 0; i < value.requiredIDs.length; i++) {
            let present = false;
            for (let j = 0; j < value.actors.length; j++) if (value.actors[j] && value.actors[j].id === value.requiredIDs[i] && value.actors[j].side === apocTypes.Side.Ally) present = true;
            if (!present) e.push("unknown required ally: " + value.requiredIDs[i]);
        }
        for (let k = 0; k < 2; k++) {
            const targets = k === 0 ? l.allyTargets : l.enemyTargets;
            for (let i = 0; i < targets.length; i++) {
                let found = targets[i] === allTarget;
                for (let j = 0; j < value.actors.length; j++) if (value.actors[j] && targets[i] === value.actors[j].sprite) found = true;
                if (!found) e.push("foreign target at " + k + ":" + i);
            }
        }
        for (let i = 0; i < value.roster.length; i++) {
            let found = false;
            for (let j = 0; j < value.actors.length; j++) if (value.actors[j] && value.roster[i] === value.actors[j].sprite) found = true;
            if (!found) e.push("foreign roster actor at " + i);
        }
        return e;
    }
    function makeEvent(out: apocTypes.BattleResult, kind: string, side: apocTypes.Side, index: number,
                       actor: Sprite, target: Sprite, amount: number, hp: number,
                       mark: apocTypes.PowerSource, move: string, reason: string): void {
        const x = new apocTypes.TraceEvent();
        x.kind = kind; x.side = side; x.index = index; x.actor = actor; x.target = target;
        x.amount = amount; x.hp = hp; x.mark = copyPower(mark); x.move = move; x.reason = reason;
        out.trace.push(x);
    }
    function actorAt(t: apocTypes.TrialSnapshot, sprite: Sprite): apocTypes.ActorState {
        for (let j = 0; j < t.actors.length; j++) if (t.actors[j].sprite === sprite) return t.actors[j];
        return null;
    }
    function actorByID(t: apocTypes.TrialSnapshot, id: string): apocTypes.ActorState {
        for (let j = 0; j < t.actors.length; j++) if (t.actors[j].id === id) return t.actors[j];
        return null;
    }
    function power(t: apocTypes.TrialSnapshot, p: apocTypes.PowerSource): number {
        if (!p) return 0;
        const v = p.side === apocTypes.Side.Ally ? t.lists.allyValues[p.index] : t.lists.enemyValues[p.index];
        return (p.isAll ? Math.idiv(v + 1, 2) : v) + power(t, p.bonus);
    }
    function source(side: apocTypes.Side, index: number, all: boolean,
                    bonus: apocTypes.PowerSource): apocTypes.PowerSource {
        const p = new apocTypes.PowerSource();
        p.side = side; p.index = index; p.isAll = all; p.bonus = copyPower(bonus);
        return p;
    }
    function outcome(t: apocTypes.TrialSnapshot): string {
        let allies = 0; let enemies = 0;
        for (let j = 0; j < t.actors.length; j++) {
            const a = t.actors[j];
            if (a.hp > 0 && a.present) {
                if (a.side === apocTypes.Side.Ally) allies++; else enemies++;
            }
        }
        if (!allies) return "defeat";
        for (let i = 0; i < t.requiredIDs.length; i++) {
            const a = actorByID(t, t.requiredIDs[i]);
            if (!a || !a.present || a.hp <= 0) return "defeat";
        }
        if (t.goal === "defeat_all" && enemies === 0) return "victory";
        return "";
    }
    function finish(out: apocTypes.BattleResult, status: string, side: apocTypes.Side, index: number, why: string): void {
        out.status = status;
        makeEvent(out, "result", side, index, null, null, 0, -1, null, "", status + ":" + why);
    }
    function boundary(t: apocTypes.TrialSnapshot, out: apocTypes.BattleResult,
                      side: apocTypes.Side, index: number, phase: string): boolean {
        makeEvent(out, "cursor", side, index, null, null, 0, -1, null, "", phase);
        const status = outcome(t);
        if (status) { finish(out, status, side, index, phase); return true; }
        return false;
    }
    function hit(t: apocTypes.TrialSnapshot, out: apocTypes.BattleResult, target: apocTypes.ActorState,
                 damage: number, caster: apocTypes.ActorState, side: apocTypes.Side,
                 index: number, move: string, tick: boolean): void {
        if (damage <= 0 || target.hp <= 0 || !target.present) return;
        if (target.ward && (tick || caster.trait !== "Piercer")) {
            const blocked = Math.min(damage, power(t, target.ward));
            damage -= blocked;
            makeEvent(out, "ward-consumed", side, index, caster.sprite, target.sprite,
                      blocked, -1, target.ward, move, "one damage instance");
            target.ward = null;
        }
        if (damage > 0) {
            const actual = Math.min(damage, target.hp);
            target.hp -= actual;
            makeEvent(out, "damage", side, index, caster.sprite, target.sprite,
                      actual, target.hp, null, move, tick ? "venom" : "direct");
            if (!tick && caster.trait === "Leech" && caster.hp > 0 && caster.present && actual > 0) {
                const before = caster.hp;
                caster.hp = Math.min(caster.maxHP, caster.hp + 1);
                makeEvent(out, "leech", side, index, caster.sprite, caster.sprite,
                          caster.hp - before, caster.hp, null, move, "direct hit healed caster");
            }
        }
    }
    function venom(t: apocTypes.TrialSnapshot, out: apocTypes.BattleResult,
                   side: apocTypes.Side, index: number): void {
        for (let i = 0; i < t.actors.length; i++) {
            const a = t.actors[i];
            if (a.side !== side || !a.present || a.hp <= 0 || !a.venom || a.trait === "Steadfast") continue;
            const p = a.venom;
            const potency = power(t, p);
            let caster: apocTypes.ActorState = null;
            for (let j = 0; j < t.actors.length; j++) {
                const c = t.actors[j];
                if (c.side === p.side && c.ability === "Venom") { caster = c; break; }
            }
            // Mark provenance outlives its caster; validation guarantees the original unique owner.
            if (!caster) continue;
            makeEvent(out, "venom-tick", side, index, caster.sprite, a.sprite,
                      potency, -1, p, "Venom", "start of afflicted half-turn");
            hit(t, out, a, potency, caster, side, index, "Venom", true);
        }
    }
    function action(t: apocTypes.TrialSnapshot, out: apocTypes.BattleResult,
                    side: apocTypes.Side, index: number, allTarget: Sprite): void {
        const moves = side === apocTypes.Side.Ally ? t.lists.allyMoves : t.lists.enemyMoves;
        const values = side === apocTypes.Side.Ally ? t.lists.allyValues : t.lists.enemyValues;
        let reason = "";
        if (index >= moves.length) reason = "no move entry";
        else if (moves[index] === "Wait") reason = "Wait";
        else if (!validMove(moves[index])) reason = "unknown move";
        else if (index >= values.length) reason = "no numeric entry";
        else if (values[index] === 0) reason = "zero power";
        let caster: apocTypes.ActorState = null;
        const move = index < moves.length ? moves[index] : "";
        if (!reason) {
            for (let i = 0; i < t.actors.length; i++) {
                const a = t.actors[i];
                if (a.side === side && a.ability === move) { caster = a; break; }
            }
            if (!caster) reason = "move lacks unique owner";
            else if (!caster.present || caster.hp <= 0 || caster.held) reason = "owner inactive";
        }
        const helpful = move === "Mend" || move === "Ward" || move === "Empower";
        const targetSide = helpful ? side : (side === apocTypes.Side.Ally ? apocTypes.Side.Enemy : apocTypes.Side.Ally);
        const targetList = targetSide === apocTypes.Side.Ally ? t.lists.allyTargets : t.lists.enemyTargets;
        let targetSprite: Sprite = null;
        let isAll = false;
        const chosen: apocTypes.ActorState[] = [];
        if (!reason) {
            if (index >= targetList.length) reason = "missing target entry";
            else {
                targetSprite = targetList[index]; isAll = targetSprite === allTarget;
                if (isAll) {
                    for (let i = 0; i < t.actors.length; i++) {
                        const a = t.actors[i];
                        if (a.side === targetSide && a.present && a.hp > 0) chosen.push(a);
                    }
                } else {
                    const a = actorAt(t, targetSprite);
                    if (!a) reason = "unknown Sprite reference";
                    else if (a.side !== targetSide) reason = "wrong side Sprite reference";
                    else if (a.present && a.hp > 0) chosen.push(a);
                }
                if (!reason && chosen.length === 0) reason = "no living eligible target";
            }
        }
        if (reason) {
            // Retain a known attempted target identity for the world's fizzle animation.
            makeEvent(out, "skip", side, index, caster ? caster.sprite : null,
                      targetSprite, 0, -1, null, move, reason);
            return;
        }
        let potency = isAll ? Math.idiv(values[index] + 1, 2) : values[index];
        let bonus: apocTypes.PowerSource = null;
        if (caster.empower && move !== "Empower") {
            bonus = copyPower(caster.empower);
            potency += power(t, bonus);
            makeEvent(out, "empower-used", side, index, caster.sprite, caster.sprite,
                      power(t, bonus), -1, bonus, move, "next eligible cast");
            caster.empower = null;
        }
        const mark = source(side, index, isAll, bonus);
        for (let j = 0; j < chosen.length; j++) {
            const target = chosen[j];
            makeEvent(out, "action", side, index, caster.sprite, target.sprite,
                      potency, -1, null, move, isAll ? "ALL recipient" : "exact target");
            if (!target.present || target.hp <= 0) continue;
            if (move === "Strike") hit(t, out, target, 2 * potency, caster, side, index, move, false);
            else if (move === "Flurry") {
                for (let k = 0; k < potency && target.hp > 0; k++) hit(t, out, target, 1, caster, side, index, move, false);
            } else if (move === "Reap") {
                hit(t, out, target, potency * (target.maxHP - target.hp), caster, side, index, move, false);
            } else if (move === "Mend") {
                const before = target.hp;
                target.hp = Math.min(target.maxHP, target.hp + potency);
                makeEvent(out, "heal", side, index, caster.sprite, target.sprite,
                          target.hp - before, target.hp, null, move, "no resurrection");
                if (caster.trait === "Cleanser" && target.venom) {
                    makeEvent(out, "venom-cleared", side, index, caster.sprite, target.sprite,
                              0, -1, target.venom, move, "Cleanser Mend");
                    target.venom = null;
                }
            } else if (move === "Ward") {
                target.ward = copyPower(mark);
                makeEvent(out, "ward-set", side, index, caster.sprite, target.sprite,
                          power(t, mark), -1, mark, move, "mark replaced");
            } else if (move === "Venom") {
                target.venom = copyPower(mark);
                makeEvent(out, "venom-set", side, index, caster.sprite, target.sprite,
                          power(t, mark), -1, mark, move, "mark replaced");
            } else if (move === "Empower") {
                target.empower = source(side, index, isAll, null);
                makeEvent(out, "empower-set", side, index, caster.sprite, target.sprite,
                          power(t, target.empower), -1, target.empower, move, "mark replaced");
            }
        }
    }
    export function resolve(value: apocTypes.TrialSnapshot, allTarget: Sprite): apocTypes.BattleResult {
        const out = new apocTypes.BattleResult();
        out.trace = [];
        out.errors = validate(value, allTarget);
        if (out.errors.length > 0) {
            out.finalActors = [];
            finish(out, "invalid", apocTypes.Side.Ally, -1, "validation"); return out;
        }
        const t = cloneTrial(value);
        out.finalActors = t.actors;
        const l = t.lists;
        // MakeCode Math.max takes exactly two arguments (unlike JavaScript varargs).
        // Keep independent lengths: short/missing companion cells deliberately fizzle.
        let count = Math.max(l.allyMoves.length, l.allyValues.length);
        count = Math.max(count, l.allyTargets.length);
        count = Math.max(count, l.enemyMoves.length);
        count = Math.max(count, l.enemyValues.length);
        count = Math.max(count, l.enemyTargets.length);
        if (boundary(t, out, apocTypes.Side.Ally, 0, "pass entry")) return out;
        for (let i = 0; i < count; i++) {
            if (boundary(t, out, apocTypes.Side.Ally, i, "before ally half-turn")) return out;
            venom(t, out, apocTypes.Side.Ally, i);
            if (boundary(t, out, apocTypes.Side.Ally, i, "after ally venom")) return out;
            action(t, out, apocTypes.Side.Ally, i, allTarget);
            if (boundary(t, out, apocTypes.Side.Ally, i, "after ally action")) return out;
            if (boundary(t, out, apocTypes.Side.Enemy, i, "before enemy half-turn")) return out;
            venom(t, out, apocTypes.Side.Enemy, i);
            if (boundary(t, out, apocTypes.Side.Enemy, i, "after enemy venom")) return out;
            action(t, out, apocTypes.Side.Enemy, i, allTarget);
            if (boundary(t, out, apocTypes.Side.Enemy, i, "after enemy action")) return out;
        }
        if (boundary(t, out, apocTypes.Side.Ally, count, "pass exit")) return out;
        finish(out, t.goal === "survive_pass" ? "victory" : "incomplete", apocTypes.Side.Ally, count, "pass finished");
        return out;
    }
}

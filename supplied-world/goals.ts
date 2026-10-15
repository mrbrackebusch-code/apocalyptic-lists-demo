// Generated expected() below is literal puzzle data, never executed as learner code.
// The checker judges real arrays, actor identities and station snapshots only.
namespace apocGoals {
    class Expect {
        constructor() {}
        lists: apocTypes.BattleSpec = null;
        rosterIDs: string[] = [];
        sourceMoves: string[] = [];
        heldChoices: string[][] = [];
        banishedChoices: string[][] = [];
        histBefore: apocTypes.BattleSpec[] = [];
        histAfter: apocTypes.BattleSpec[] = [];
    }
    function sameStrings(a: string[], b: string[]): boolean {
        if (!a || !b || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }
    function sameNumbers(a: number[], b: number[]): boolean {
        if (!a || !b || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }
    function samePower(a: apocTypes.PowerSource, b: apocTypes.PowerSource, depth: number): boolean {
        if (!a || !b) return a === b;
        if (depth > 12) return false;
        return a.side === b.side && a.index === b.index && a.isAll === b.isAll &&
            samePower(a.bonus, b.bonus, depth + 1);
    }
    function stateFor(t: apocTypes.TrialSnapshot, id: string): apocTypes.ActorState {
        if (!t || !t.actors) return null;
        for (let i = 0; i < t.actors.length; i++) if (t.actors[i] && t.actors[i].id === id) return t.actors[i];
        return null;
    }
    function specFor(s: apocTypes.RoomSpec, id: string): apocTypes.ActorSpec {
        if (!s || !s.battle || !s.battle.actors) return null;
        for (let i = 0; i < s.battle.actors.length; i++) if (s.battle.actors[i] && s.battle.actors[i].id === id) return s.battle.actors[i];
        return null;
    }
    function isReal(t: apocTypes.TrialSnapshot, s: Sprite): boolean {
        if (!t || !t.actors) return false;
        for (let i = 0; i < t.actors.length; i++) if (t.actors[i] && t.actors[i].sprite === s) return true;
        return false;
    }
    function sentinel(t: apocTypes.TrialSnapshot, known: apocTypes.BattleSpec): Sprite {
        if (!t || !t.lists || !known) return null;
        const actual: Sprite[][] = [t.lists.allyTargets, t.lists.enemyTargets];
        const ids: string[][] = [known.allyTargetIDs, known.enemyTargetIDs];
        for (let k = 0; k < 2; k++) {
            if (!actual[k] || !Array.isArray(actual[k]) || !ids[k]) return null;
            for (let i = 0; i < ids[k].length && i < actual[k].length; i++) {
            if (ids[k][i] === "ALL" && !isReal(t, actual[k][i])) return actual[k][i];
            }
        }
        return null;
    }
    function matchingTarget(t: apocTypes.TrialSnapshot, sprite: Sprite, id: string,
                            allTarget: Sprite): boolean {
        if (id === "ALL") return !!allTarget && sprite === allTarget;
        const actor = stateFor(t, id);
        return !!actor && sprite === actor.sprite;
    }
    function matchingTargets(t: apocTypes.TrialSnapshot, a: Sprite[], ids: string[],
                             allTarget: Sprite): boolean {
        if (!a || !ids || a.length !== ids.length) return false;
        for (let i = 0; i < a.length; i++) if (!matchingTarget(t, a[i], ids[i], allTarget)) return false;
        return true;
    }
    function matchingLists(t: apocTypes.TrialSnapshot, expected: apocTypes.BattleSpec,
                           allTarget: Sprite): boolean {
        if (!t || !t.lists || !expected) return false;
        const l = t.lists;
        return sameStrings(l.allyMoves, expected.allyMoves) &&
            sameNumbers(l.allyValues, expected.allyValues) &&
            matchingTargets(t, l.allyTargets, expected.allyTargetIDs, allTarget) &&
            sameStrings(l.enemyMoves, expected.enemyMoves) &&
            sameNumbers(l.enemyValues, expected.enemyValues) &&
            matchingTargets(t, l.enemyTargets, expected.enemyTargetIDs, allTarget);
    }
    function matchingRoster(t: apocTypes.TrialSnapshot, ids: string[]): boolean {
        if (!t || !t.roster || !ids || t.roster.length !== ids.length) return false;
        for (let i = 0; i < ids.length; i++) if (!matchingTarget(t, t.roster[i], ids[i], null)) return false;
        return true;
    }
    function contains(a: string[], item: string): boolean {
        for (let i = 0; i < a.length; i++) if (a[i] === item) return true;
        return false;
    }
    function matchingActors(s: apocTypes.RoomSpec, before: apocTypes.TrialSnapshot,
                            after: apocTypes.TrialSnapshot, held: string[], banished: string[]): boolean {
        if (!s.battle || !before.actors || !after.actors ||
            before.actors.length !== s.battle.actors.length || after.actors.length !== before.actors.length) return false;
        for (let i = 0; i < before.actors.length; i++) {
            const b = before.actors[i];
            if (!b) return false;
            const a = stateFor(after, b.id);
            const base = specFor(s, b.id);
            // Actor order is the room's stable display/iteration order, not a learner list.
            if (!a || !base || !b.sprite || a.sprite !== b.sprite ||
                b.id !== s.battle.actors[i].id || after.actors[i] !== a) return false;
            if (b.side !== base.side || b.ability !== base.ability || b.trait !== base.trait ||
                b.maxHP !== base.maxHP || b.hp !== base.hp || b.present !== base.present ||
                b.held !== base.held || !samePower(b.ward, base.ward, 0) ||
                !samePower(b.venom, base.venom, 0) || !samePower(b.empower, base.empower, 0)) return false;
            if (a.side !== b.side || a.ability !== b.ability || a.trait !== b.trait ||
                a.hp !== b.hp || a.maxHP !== b.maxHP ||
                !samePower(a.ward, b.ward, 0) || !samePower(a.venom, b.venom, 0) ||
                !samePower(a.empower, b.empower, 0)) return false;
            // Hold and Banish may only turn flags on/off in their intended direction.
            if (a.held !== (b.held || contains(held, b.id))) return false;
            if (a.present !== (b.present && !contains(banished, b.id))) return false;
        }
        // No extra or duplicated actor references by id/sprite.
        for (let i = 0; i < after.actors.length; i++) {
            const a = after.actors[i];
            if (!a || !stateFor(before, a.id)) return false;
            for (let j = 0; j < i; j++) if (after.actors[j].id === a.id || after.actors[j].sprite === a.sprite) return false;
        }
        return true;
    }
    function snapshotAncillary(a: apocTypes.TrialSnapshot, b: apocTypes.TrialSnapshot): boolean {
        if (!a || !b || !a.actors || !b.actors || !a.roster || !b.roster ||
            a.goal !== b.goal || !sameStrings(a.requiredIDs, b.requiredIDs) ||
            a.actors.length !== b.actors.length || a.roster.length !== b.roster.length ||
            !sameStrings(a.sourceMoves, b.sourceMoves)) return false;
        for (let i = 0; i < a.roster.length; i++) if (a.roster[i] !== b.roster[i]) return false;
        for (let i = 0; i < a.actors.length; i++) {
            const x = a.actors[i], y = b.actors[i];
            if (!x || !y || x.id !== y.id || x.sprite !== y.sprite ||
                x.hp !== y.hp || x.maxHP !== y.maxHP || x.ability !== y.ability ||
                x.trait !== y.trait || x.side !== y.side || x.held !== y.held || x.present !== y.present ||
                !samePower(x.ward, y.ward, 0) || !samePower(x.venom, y.venom, 0) ||
                !samePower(x.empower, y.empower, 0)) return false;
        }
        return true;
    }
    function historyR24(records: apocTypes.StationRecord[], before: apocTypes.TrialSnapshot,
                        after: apocTypes.TrialSnapshot, e: Expect, allTarget: Sprite): boolean {
        if (!records || records.length !== 2 || e.histBefore.length !== 2 || e.histAfter.length !== 2) return false;
        for (let i = 0; i < 2; i++) {
            const r = records[i];
            if (!r || r.station !== i + 1 || r.error || !r.before || !r.after ||
                (r.effects && r.effects.length > 0)) return false;
            if (!matchingLists(r.before, e.histBefore[i], allTarget) ||
                !matchingLists(r.after, e.histAfter[i], allTarget) ||
                !snapshotAncillary(r.before, r.after)) return false;
            if (i === 0) {
                if (!matchingLists(before, e.histBefore[0], allTarget) || !snapshotAncillary(before, r.before)) return false;
            } else {
                if (!matchingLists(records[0].after, e.histBefore[1], allTarget) ||
                    !snapshotAncillary(records[0].after, r.before)) return false;
            }
        }
        return matchingLists(after, e.histAfter[1], allTarget) && snapshotAncillary(records[1].after, after);
    }
    export function assess(spec: apocTypes.RoomSpec, before: apocTypes.TrialSnapshot,
                           after: apocTypes.TrialSnapshot, records: apocTypes.StationRecord[]): apocTypes.GoalResult {
        const out = new apocTypes.GoalResult(); out.met = false; out.messages = [];
        if (!spec || !spec.battle || !before || !after || !before.lists || !after.lists) {
            out.messages.push("Missing room or snapshots"); return out;
        }
        const e = expected(spec.room, spec.variant);
        if (!e) { out.messages.push("Unknown room/variant goal"); return out; }
        const target = sentinel(before, spec.battle);
        if (!matchingLists(before, spec.battle, target) ||
            !matchingRoster(before, spec.rosterIDs) || !sameStrings(before.sourceMoves, spec.sourceMoves) ||
            before.goal !== spec.battle.goal || !sameStrings(before.requiredIDs, spec.battle.requiredIDs)) {
            out.messages.push("Initial snapshot does not match authored room"); return out;
        }
        if (!matchingLists(after, e.lists, target) || !matchingRoster(after, e.rosterIDs) ||
            !sameStrings(after.sourceMoves, e.sourceMoves) ||
            after.goal !== before.goal || !sameStrings(after.requiredIDs, before.requiredIDs)) {
            out.messages.push("Visible lists or sources do not match the task"); return out;
        }
        let goodEffects = false;
        for (let i = 0; i < e.heldChoices.length; i++) {
            if (matchingActors(spec, before, after, e.heldChoices[i], e.banishedChoices[i])) goodEffects = true;
        }
        if (!goodEffects) { out.messages.push("Actor effects or protected properties differ"); return out; }
        if (spec.room === apocTypes.Room.R24 && !historyR24(records, before, after, e, target)) {
            out.messages.push("Required Primary then Secondary station states not observed"); return out;
        }
        out.met = true; out.messages.push("Visible objective met"); return out;
    }
    // BEGIN DETERMINISTIC GENERATED GOALS
    function expectedGroup0(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 1: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [4, 3, 4, 1];
                b.enemyMoves = ["Strike", "Strike", "Wait", "Wait"];
                b.enemyValues = [3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Decoy", "E-Decoy", "E-Raider", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 2: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [1, 3, 3, 5, 1];
                b.enemyMoves = ["Wait", "Strike", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Decoy", "E-Decoy", "E-Raider", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 3: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [1, 1, 5, 3, 6, 1];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Decoy", "E-Decoy", "E-Raider", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 4: {
                b.allyMoves = ["Ward", "Mend", "Strike"];
                b.allyValues = [1, 2, 2];
                b.enemyMoves = ["Strike", "Wait", "Wait"];
                b.enemyValues = [3, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Shaman", "E-Raider", "E-Wisp"];
                e.rosterIDs = ["E-Raider", "E-Shaman", "E-Wisp"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Raider"]); e.banishedChoices.push([]);
                return e;
            }
            case 5: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 2, 2];
                b.enemyMoves = ["Wait", "Flurry", "Wait", "Wait"];
                b.enemyValues = [1, 5, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Shaman", "E-Raider", "E-Wisp"];
                e.rosterIDs = ["E-Shaman", "E-Wisp", "E-Raider"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
            case 6: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 1, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 3, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Shaman", "E-Raider", "E-Wisp"];
                e.rosterIDs = ["E-Wisp", "E-Raider", "E-Shaman"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Raider"]); e.banishedChoices.push([]);
                return e;
            }
            case 7: {
                b.allyMoves = ["Ward", "Mend", "Strike"];
                b.allyValues = [1, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait"];
                b.enemyValues = [3, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Wisp", "E-Raider", "E-Wisp"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 8: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 4, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Wisp", "E-Raider", "E-Wisp"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 9: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 1, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 4, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Wisp", "E-Raider", "E-Wisp"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expectedGroup1(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 10: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 3, 1, 1, 3];
                b.enemyMoves = ["Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 11: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 1, 3, 1, 1, 4];
                b.enemyMoves = ["Wait", "Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 12: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 1, 1, 3, 1, 1, 5];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 13: {
                b.allyMoves = ["Strike", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [2, 6, 2, 2, 1];
                b.enemyMoves = ["Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Decoy", "E-Decoy", "E-Boss", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 14: {
                b.allyMoves = ["Wait", "Strike", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [1, 2, 6, 2, 2, 1];
                b.enemyMoves = ["Wait", "Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Decoy", "E-Decoy", "E-Boss", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 15: {
                b.allyMoves = ["Wait", "Wait", "Strike", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [1, 1, 2, 6, 2, 2, 1];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Boss", "E-Decoy", "E-Decoy", "E-Boss", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 16: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [1, 6, 1, 2, 2];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [3, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 17: {
                b.allyMoves = ["Wait", "Ward", "Strike", "Mend", "Strike"];
                b.allyValues = [1, 6, 2, 1, 3];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [3, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 18: {
                b.allyMoves = ["Wait", "Ward", "Strike", "Strike", "Mend", "Strike"];
                b.allyValues = [1, 6, 1, 2, 1, 3];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [3, 3, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expectedGroup2(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 19: {
                b.allyMoves = ["Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [2, 3, 3, 2];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [4, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Boss", "E-Shaman", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 20: {
                b.allyMoves = ["Wait", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [1, 2, 3, 3, 2];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 5, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Boss", "E-Boss", "E-Shaman", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 21: {
                b.allyMoves = ["Wait", "Wait", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [1, 1, 2, 3, 3, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 6, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Boss", "E-Boss", "E-Boss", "E-Shaman", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 22: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 3, 1, 1, 3];
                b.enemyMoves = ["Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 23: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 1, 3, 1, 1, 4];
                b.enemyMoves = ["Wait", "Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 24: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 1, 1, 3, 1, 1, 5];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 25: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [4, 1, 3, 2, 2];
                b.enemyMoves = ["Strike", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [2, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 26: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Strike", "Wait"];
                b.allyValues = [6, 1, 3, 3, 2, 1];
                b.enemyMoves = ["Strike", "Strike", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [3, 1, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 27: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Strike", "Wait", "Wait"];
                b.allyValues = [4, 1, 3, 4, 2, 1, 1];
                b.enemyMoves = ["Strike", "Strike", "Wait", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [2, 1, 1, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expectedGroup3(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 28: {
                b.allyMoves = ["Ward", "Mend", "Wait", "Wait"];
                b.allyValues = [1, 1, 1, 1];
                b.enemyMoves = ["Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 5, 3];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 29: {
                b.allyMoves = ["Ward", "Mend", "Wait", "Wait", "Wait"];
                b.allyValues = [1, 1, 1, 1, 1];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 5, 4];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 30: {
                b.allyMoves = ["Ward", "Mend", "Wait", "Wait", "Wait", "Wait"];
                b.allyValues = [1, 1, 1, 1, 1, 1];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1, 5, 5];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 31: {
                b.allyMoves = ["Ward", "Mend", "Strike"];
                b.allyValues = [1, 2, 8];
                b.enemyMoves = ["Strike", "Wait", "Wait"];
                b.enemyValues = [3, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Wisp", "ALL"];
                e.rosterIDs = ["E-Wisp", "E-Shaman"]; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push(["E-Raider"]);
                return e;
            }
            case 32: {
                b.allyMoves = ["Ward", "Mend", "Strike"];
                b.allyValues = [1, 2, 8];
                b.enemyMoves = ["Flurry", "Wait", "Wait"];
                b.enemyValues = [6, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Wisp", "ALL"];
                e.rosterIDs = ["E-Raider", "E-Shaman"]; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push(["E-Wisp"]);
                return e;
            }
            case 33: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 2, 8];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 3, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Wisp", "ALL"];
                e.rosterIDs = ["E-Shaman", "E-Wisp"]; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push(["E-Raider"]);
                return e;
            }
            case 34: {
                b.allyMoves = ["Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [2, 3, 3, 2];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [4, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Boss", "E-Shaman", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 35: {
                b.allyMoves = ["Wait", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [1, 2, 3, 3, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 5, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Boss", "E-Boss", "E-Shaman", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 36: {
                b.allyMoves = ["Wait", "Wait", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [1, 1, 2, 3, 3, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 6, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Boss", "E-Boss", "E-Boss", "E-Boss", "E-Boss", "E-Shaman", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expectedGroup4(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 37: {
                b.allyMoves = ["Strike", "Reap", "Strike", "Flurry", "Reap", "Strike"];
                b.allyValues = [2, 1, 2, 9, 2, 2];
                b.enemyMoves = ["Strike", "Flurry", "Venom", "Wait", "Wait", "Wait"];
                b.enemyValues = [2, 4, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Plague", "ALL", "E-Plague", "E-Wisp"];
                e.rosterIDs = ["E-Raider", "E-Wisp", "E-Plague"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Plague", "E-Raider", "E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
            case 38: {
                b.allyMoves = ["Strike", "Reap", "Strike", "Flurry", "Reap", "Strike"];
                b.allyValues = [2, 1, 2, 9, 2, 2];
                b.enemyMoves = ["Venom", "Strike", "Flurry", "Wait", "Wait", "Wait"];
                b.enemyValues = [3, 2, 4, 1, 1, 1];
                b.allyTargetIDs = ["A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Plague", "ALL", "E-Plague", "E-Wisp"];
                e.rosterIDs = ["E-Plague", "E-Raider", "E-Wisp"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Plague", "E-Raider", "E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
            case 39: {
                b.allyMoves = ["Strike", "Reap", "Strike", "Flurry", "Reap", "Strike"];
                b.allyValues = [2, 1, 2, 9, 2, 2];
                b.enemyMoves = ["Flurry", "Venom", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [4, 3, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester", "A-Harvester"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Plague", "ALL", "E-Plague", "E-Wisp"];
                e.rosterIDs = ["E-Wisp", "E-Plague", "E-Raider"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Plague", "E-Raider", "E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
            case 40: {
                b.allyMoves = ["Strike", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 2, 4];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1];
                b.allyTargetIDs = ["A-Blade", "A-Medic", "A-Blade", "A-Blade"];
                b.enemyTargetIDs = ["E-Small", "E-Boss", "E-Boss", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 41: {
                b.allyMoves = ["Strike", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 2, 5];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1];
                b.allyTargetIDs = ["A-Blade", "A-Medic", "A-Blade", "A-Blade"];
                b.enemyTargetIDs = ["E-Small", "E-Boss", "E-Boss", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 42: {
                b.allyMoves = ["Strike", "Ward", "Mend", "Strike"];
                b.allyValues = [1, 1, 2, 6];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1];
                b.allyTargetIDs = ["A-Blade", "A-Medic", "A-Blade", "A-Blade"];
                b.enemyTargetIDs = ["E-Small", "E-Boss", "E-Boss", "E-Boss"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 43: {
                b.allyMoves = ["Venom", "Strike", "Mend", "Strike", "Strike"];
                b.allyValues = [2, 2, 1, 3, 2];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Flurry", "Wait"];
                b.enemyValues = [9, 1, 9, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Wisp", "E-Wisp", "E-Shaman"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 44: {
                b.allyMoves = ["Venom", "Wait", "Mend", "Wait", "Strike", "Strike"];
                b.allyValues = [2, 1, 3, 1, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Flurry", "Wait"];
                b.enemyValues = [1, 9, 1, 9, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Wisp", "E-Wisp", "E-Shaman"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 45: {
                b.allyMoves = ["Venom", "Wait", "Mend", "Strike", "Wait", "Strike", "Strike"];
                b.allyValues = [2, 1, 1, 2, 1, 3, 3];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Strike", "Wait", "Flurry", "Wait"];
                b.enemyValues = [1, 1, 9, 1, 9, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Wisp", "E-Wisp", "E-Shaman"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expectedGroup5(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 46: {
                b.allyMoves = ["Ward", "Strike", "Ward", "Strike", "Strike"];
                b.allyValues = [3, 3, 3, 3, 3];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [2, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 47: {
                b.allyMoves = ["Strike", "Ward", "Strike", "Ward", "Strike", "Strike"];
                b.allyValues = [3, 3, 3, 3, 3, 3];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 2, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 48: {
                b.allyMoves = ["Ward", "Strike", "Strike", "Ward", "Strike", "Strike"];
                b.allyValues = [3, 3, 3, 3, 3, 3];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [2, 1, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Strike", "Wait", "Wait", "Strike", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 49: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [2, 2, 2, 1, 5];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 50: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [2, 2, 2, 1, 6];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Mend", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 51: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Wait", "Reap"];
                b.allyValues = [2, 2, 2, 1, 7];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Ward", "Mend", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 52: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [2, 2, 1, 1, 5];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 53: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 2, 2, 1, 1, 6];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 54: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Mend", "Strike", "Wait", "Strike"];
                b.allyValues = [1, 1, 2, 2, 1, 1, 7];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expectedGroup6(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 55: {
                b.allyMoves = ["Ward", "Strike", "Mend", "Strike"];
                b.allyValues = [5, 2, 3, 2];
                b.enemyMoves = ["Strike", "Flurry", "Venom", "Wait"];
                b.enemyValues = [2, 2, 3, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = ["E-Raider", "E-Wisp"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Raider"]); e.banishedChoices.push([]);
                e.heldChoices.push(["E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
            case 56: {
                b.allyMoves = ["Ward", "Strike", "Mend", "Strike"];
                b.allyValues = [5, 2, 3, 2];
                b.enemyMoves = ["Flurry", "Strike", "Venom", "Wait"];
                b.enemyValues = [2, 2, 3, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = ["E-Wisp", "E-Raider"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Wisp"]); e.banishedChoices.push([]);
                e.heldChoices.push(["E-Raider"]); e.banishedChoices.push([]);
                return e;
            }
            case 57: {
                b.allyMoves = ["Wait", "Ward", "Strike", "Mend", "Strike"];
                b.allyValues = [1, 5, 2, 3, 2];
                b.enemyMoves = ["Wait", "Strike", "Flurry", "Venom", "Wait"];
                b.enemyValues = [1, 2, 2, 3, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = ["E-Wisp", "E-Raider"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Wisp"]); e.banishedChoices.push([]);
                e.heldChoices.push(["E-Raider"]); e.banishedChoices.push([]);
                return e;
            }
            case 58: {
                b.allyMoves = ["Wait", "Strike", "Flurry", "Reap", "Strike", "Reap"];
                b.allyValues = [1, 2, 2, 2, 1, 9];
                b.enemyMoves = ["Wait", "Wait", "Ward", "Wait", "Flurry", "Strike"];
                b.enemyValues = [4, 4, 2, 3, 3, 3];
                b.allyTargetIDs = ["A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Shaman", "E-Raider", "E-Wisp", "ALL"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 59: {
                b.allyMoves = ["Wait", "Strike", "Flurry", "Reap", "Strike", "Reap"];
                b.allyValues = [1, 2, 2, 2, 1, 9];
                b.enemyMoves = ["Wait", "Wait", "Ward", "Wait", "Strike", "Flurry"];
                b.enemyValues = [4, 4, 4, 3, 3, 3];
                b.allyTargetIDs = ["A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Shaman", "E-Raider", "E-Wisp", "ALL"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 60: {
                b.allyMoves = ["Wait", "Strike", "Flurry", "Reap", "Strike", "Reap"];
                b.allyValues = [1, 3, 2, 2, 1, 9];
                b.enemyMoves = ["Wait", "Wait", "Ward", "Wait", "Flurry", "Strike"];
                b.enemyValues = [4, 4, 2, 3, 3, 3];
                b.allyTargetIDs = ["A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger", "A-Ranger"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Shaman", "E-Raider", "E-Wisp", "ALL"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 61: {
                b.allyMoves = ["Strike", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [2, 6, 2, 2, 1];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Decoy", "E-Raider", "E-Raider", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = ["Wait", "Strike", "Wait", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 62: {
                b.allyMoves = ["Wait", "Strike", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [1, 2, 6, 2, 2, 1];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Decoy", "E-Raider", "E-Raider", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = ["Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 63: {
                b.allyMoves = ["Wait", "Wait", "Strike", "Ward", "Mend", "Strike", "Strike"];
                b.allyValues = [1, 1, 2, 6, 2, 2, 1];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 1, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Decoy", "E-Raider", "E-Raider", "E-Decoy"];
                e.rosterIDs = []; e.sourceMoves = ["Wait", "Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expectedGroup7(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 64: {
                b.allyMoves = ["Strike", "Empower", "Strike", "Mend", "Strike", "Strike"];
                b.allyValues = [4, 2, 2, 2, 2, 3];
                b.enemyMoves = ["Strike", "Ward", "Flurry", "Wait", "Wait", "Wait"];
                b.enemyValues = [4, 1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Blade", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Shaman", "E-Wisp", "E-Shaman", "E-Shaman", "E-Shaman"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 65: {
                b.allyMoves = ["Strike", "Empower", "Strike", "Mend", "Strike", "Strike"];
                b.allyValues = [5, 2, 2, 2, 2, 3];
                b.enemyMoves = ["Strike", "Ward", "Flurry", "Wait", "Wait", "Wait"];
                b.enemyValues = [4, 2, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Blade", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Shaman", "E-Wisp", "E-Shaman", "E-Shaman", "E-Shaman"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 66: {
                b.allyMoves = ["Strike", "Empower", "Strike", "Mend", "Strike", "Strike"];
                b.allyValues = [5, 2, 2, 2, 2, 3];
                b.enemyMoves = ["Strike", "Ward", "Flurry", "Wait", "Wait", "Wait"];
                b.enemyValues = [4, 3, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Blade", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Shaman", "E-Wisp", "E-Shaman", "E-Shaman", "E-Shaman"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 67: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Strike", "Strike"];
                b.allyValues = [3, 2, 2, 2, 2];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait"];
                b.enemyValues = [3, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Shaman", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 68: {
                b.allyMoves = ["Wait", "Ward", "Mend", "Strike", "Strike", "Strike"];
                b.allyValues = [1, 5, 2, 2, 3, 2];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Strike", "Wait"];
                b.enemyValues = [1, 4, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Shaman", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 69: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Mend", "Strike", "Strike", "Strike"];
                b.allyValues = [1, 1, 7, 2, 2, 4, 2];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Strike", "Wait"];
                b.enemyValues = [1, 1, 5, 3, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Shaman", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 70: {
                b.allyMoves = ["Ward", "Strike", "Strike", "Strike"];
                b.allyValues = [1, 2, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [4, 4, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 2, 2, 2];
                  b.enemyMoves = ["Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [4, 4, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histBefore.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [4, 4, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histAfter.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [4, 4, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histBefore.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Wait"];
                  b.enemyValues = [4, 4, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histAfter.push(b); }
                return e;
            }
            case 71: {
                b.allyMoves = ["Wait", "Ward", "Strike", "Strike", "Strike"];
                b.allyValues = [1, 1, 2, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 5, 5, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 5, 5, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histBefore.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 5, 5, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histAfter.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 5, 5, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histBefore.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 5, 5, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histAfter.push(b); }
                return e;
            }
            case 72: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Strike", "Strike", "Strike"];
                b.allyValues = [1, 1, 1, 2, 2, 2];
                b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [1, 1, 6, 6, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 1, 6, 6, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histBefore.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 1, 6, 6, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histAfter.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 1, 6, 6, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histBefore.push(b); }
                { const b = new apocTypes.BattleSpec();
                  b.allyMoves = ["Wait", "Wait", "Ward", "Strike", "Strike", "Strike"];
                  b.allyValues = [1, 1, 1, 2, 2, 2];
                  b.enemyMoves = ["Wait", "Wait", "Wait", "Wait", "Wait", "Wait", "Wait"];
                  b.enemyValues = [1, 1, 6, 6, 1, 1];
                  b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                  b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                  e.histAfter.push(b); }
                return e;
            }
        }
        return null;
    }
    function expectedGroup8(e: Expect, key: number): Expect {
        const b = e.lists;
        switch (key) {
            case 73: {
                b.allyMoves = ["Ward", "Strike", "Ward", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [6, 4, 6, 4, 6, 4, 4];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [4, 1, 4, 1, 4, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 74: {
                b.allyMoves = ["Wait", "Ward", "Strike", "Ward", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [1, 6, 4, 6, 4, 6, 4, 4];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 4, 1, 4, 1, 4, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 75: {
                b.allyMoves = ["Wait", "Wait", "Ward", "Strike", "Ward", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [1, 1, 6, 4, 6, 4, 6, 4, 4];
                b.enemyMoves = ["Wait", "Wait", "Strike", "Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 1, 4, 1, 4, 1, 4, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = [];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 76: {
                b.allyMoves = ["Ward", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [2, 2, 2, 2, 2];
                b.enemyMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [2, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Strike", "Wait", "Strike", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 77: {
                b.allyMoves = ["Strike", "Ward", "Mend", "Ward", "Strike", "Strike"];
                b.allyValues = [2, 2, 2, 2, 2, 2];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                b.enemyValues = [1, 2, 1, 2, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Wait", "Strike", "Wait", "Strike", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 78: {
                b.allyMoves = ["Ward", "Mend", "Strike", "Ward", "Strike", "Strike", "Strike"];
                b.allyValues = [2, 2, 2, 2, 2, 2, 2];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                b.enemyValues = [2, 1, 1, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider", "E-Raider"];
                e.rosterIDs = []; e.sourceMoves = ["Strike", "Wait", "Wait", "Strike", "Wait", "Wait", "Wait"];
                e.heldChoices.push([]); e.banishedChoices.push([]);
                return e;
            }
            case 79: {
                b.allyMoves = ["Mend", "Strike", "Strike", "Strike", "Strike", "Strike", "Flurry", "Strike"];
                b.allyValues = [1, 2, 2, 2, 2, 2, 8, 3];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Wait", "Flurry", "Wait", "Wait", "Wait"];
                b.enemyValues = [2, 3, 1, 2, 6, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-King", "E-King", "E-King", "E-King", "E-King", "E-King", "E-Raider", "E-Wisp"];
                e.rosterIDs = ["E-Raider", "E-Wisp"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Raider", "E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
            case 80: {
                b.allyMoves = ["Mend", "Strike", "Strike", "Strike", "Strike", "Strike", "Flurry", "Strike"];
                b.allyValues = [1, 2, 2, 2, 2, 2, 8, 3];
                b.enemyMoves = ["Strike", "Wait", "Wait", "Flurry", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [3, 2, 1, 6, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-King", "E-King", "E-King", "E-King", "E-King", "E-King", "E-Raider", "E-Wisp"];
                e.rosterIDs = ["E-Wisp", "E-Raider"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Raider", "E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
            case 81: {
                b.allyMoves = ["Mend", "Strike", "Strike", "Strike", "Strike", "Strike", "Flurry", "Strike"];
                b.allyValues = [1, 2, 2, 2, 2, 2, 8, 3];
                b.enemyMoves = ["Wait", "Strike", "Wait", "Flurry", "Wait", "Wait", "Wait", "Wait"];
                b.enemyValues = [2, 3, 1, 6, 2, 1, 1, 1];
                b.allyTargetIDs = ["A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic", "A-Medic"];
                b.enemyTargetIDs = ["E-King", "E-King", "E-King", "E-King", "E-King", "E-King", "E-Raider", "E-Wisp"];
                e.rosterIDs = ["E-Raider", "E-Wisp"]; e.sourceMoves = [];
                e.heldChoices.push(["E-Raider", "E-Wisp"]); e.banishedChoices.push([]);
                return e;
            }
        }
        return null;
    }
    function expected(room: apocTypes.Room, variant: number): Expect {
        if (room < 1 || room > 27 || variant < 1 || variant > 3 ||
            room !== Math.floor(room) || variant !== Math.floor(variant)) return null;
        const e = new Expect(); e.lists = new apocTypes.BattleSpec();
        const key = (room - 1) * 3 + variant;
        if (room <= 3) return expectedGroup0(e, key);
        if (room <= 6) return expectedGroup1(e, key);
        if (room <= 9) return expectedGroup2(e, key);
        if (room <= 12) return expectedGroup3(e, key);
        if (room <= 15) return expectedGroup4(e, key);
        if (room <= 18) return expectedGroup5(e, key);
        if (room <= 21) return expectedGroup6(e, key);
        if (room <= 24) return expectedGroup7(e, key);
        if (room <= 27) return expectedGroup8(e, key);
        return null;
    }
}

// AL-IMPLEMENTATION-1.0 — frozen lead-owned runtime types, 2026-10-12.
// Conserve usage. PXT Static TypeScript, no modules, no startup or learner solution.
namespace apocTypes {
    export enum Side { Ally = 0, Enemy = 1 }
    export enum Station { Primary = 1, Secondary = 2 }
    export enum Room {
        R01 = 1, R02 = 2, R03 = 3, R04 = 4, R05 = 5, R06 = 6, R07 = 7,
        R08 = 8, R09 = 9, R10 = 10, R11 = 11, R12 = 12, R13 = 13, R14 = 14,
        R15 = 15, R16 = 16, R17 = 17, R18 = 18, R19 = 19, R20 = 20, R21 = 21,
        R22 = 22, R23 = 23, R24 = 24, R25 = 25, R26 = 26, R27 = 27
    }
    export class PowerSource {
        constructor() {}
        side: Side = Side.Ally
        index: number = 0
        isAll: boolean = false
        bonus: PowerSource = null
    }
    export class ActorSpec {
        constructor() {}
        id: string = ""
        artKey: string = ""
        side: Side = Side.Ally
        hp: number = 1
        maxHP: number = 1
        ability: string = "Strike"
        trait: string = "Plain"
        present: boolean = true
        held: boolean = false
        ward: PowerSource = null
        venom: PowerSource = null
        empower: PowerSource = null
    }
    export class ActorState {
        constructor() {}
        id: string = ""
        sprite: Sprite = null
        side: Side = Side.Ally
        hp: number = 1
        maxHP: number = 1
        ability: string = "Strike"
        trait: string = "Plain"
        present: boolean = true
        held: boolean = false
        ward: PowerSource = null
        venom: PowerSource = null
        empower: PowerSource = null
    }
    export class CombatLists {
        constructor() {}
        allyMoves: string[] = []
        allyValues: number[] = []
        allyTargets: Sprite[] = []
        enemyMoves: string[] = []
        enemyValues: number[] = []
        enemyTargets: Sprite[] = []
    }
    // Build-time actor-ID transport; never substitute these strings for Sprite identity in combat.
    export class BattleSpec {
        constructor() {}
        actors: ActorSpec[] = []
        allyMoves: string[] = []
        allyValues: number[] = []
        allyTargetIDs: string[] = []
        enemyMoves: string[] = []
        enemyValues: number[] = []
        enemyTargetIDs: string[] = []
        goal: string = "defeat_all"
        requiredIDs: string[] = []
    }
    export class RoomSpec {
        constructor() {}
        room: Room = Room.R01
        variant: number = 1 // public variant is 1..3
        instruction: string = ""
        battle: BattleSpec = null
        rosterIDs: string[] = []
        sourceMoves: string[] = []
        editableLists: string[] = [] // six constant names plus roster/sourceMoves
        allowHold: boolean = false
        allowBanish: boolean = false
        twoStations: boolean = false
        primaryIndex: number = -1
        secondaryIndex: number = -1
        numberHint: number = 0 // R01 disclosed count of leading Wait cells
    }
    export class TrialSnapshot {
        constructor() {}
        lists: CombatLists = null
        actors: ActorState[] = []
        roster: Sprite[] = []
        sourceMoves: string[] = []
        goal: string = "defeat_all"
        requiredIDs: string[] = []
    }
    export class EffectEvent {
        constructor() {}
        kind: string = "" // hold | banish; actual accepted world call
        actor: Sprite = null
    }
    export class StationRecord {
        constructor() {}
        station: Station = Station.Primary
        before: TrialSnapshot = null
        after: TrialSnapshot = null
        effects: EffectEvent[] = []
        error: string = "" // empty for committed callback
    }
    export class TraceEvent {
        constructor() {}
        kind: string = ""
        side: Side = Side.Ally
        index: number = -1
        actor: Sprite = null // source/caster, null if none
        target: Sprite = null // affected actor, null if none
        amount: number = 0
        hp: number = -1 // target HP after this event, -1 if unchanged
        mark: PowerSource = null
        move: string = ""
        reason: string = ""
    }
    export class BattleResult {
        constructor() {}
        status: string = "incomplete" // victory | defeat | incomplete | invalid
        finalActors: ActorState[] = []
        trace: TraceEvent[] = []
        errors: string[] = []
    }
    export class GoalResult {
        constructor() {}
        met: boolean = false
        messages: string[] = []
    }
    export class Progress {
        constructor() {}
        schemaVersion: number = 1
        highestUnlocked: number = 1
        resumeRoom: number = 1
        completedMask: number = 0
    }
}

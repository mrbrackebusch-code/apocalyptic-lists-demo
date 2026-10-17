// AL-IMPLEMENTATION-1.0 runtime types; game-owned display metadata, v0.6.0.
// Conserve usage. PXT Static TypeScript, no modules, no startup or learner solution.
namespace apocTypes {
    export enum Side {
        //% block="our team"
        Ally = 0,
        //% block="enemies"
        Enemy = 1
    }
    export enum Station {
        //% block="Left altar"
        Primary = 1,
        //% block="Right altar"
        Secondary = 2
    }
    export enum Room {
        //% block="1"
        R01 = 1,
        //% block="2"
        R02 = 2,
        //% block="3"
        R03 = 3,
        //% block="4"
        R04 = 4,
        //% block="5"
        R05 = 5,
        //% block="6"
        R06 = 6,
        //% block="7"
        R07 = 7,
        //% block="8"
        R08 = 8,
        //% block="9"
        R09 = 9,
        //% block="10"
        R10 = 10,
        //% block="11"
        R11 = 11,
        //% block="12"
        R12 = 12,
        //% block="13"
        R13 = 13,
        //% block="14"
        R14 = 14,
        //% block="15"
        R15 = 15,
        //% block="16"
        R16 = 16,
        //% block="17"
        R17 = 17,
        //% block="18"
        R18 = 18,
        //% block="19"
        R19 = 19,
        //% block="20"
        R20 = 20,
        //% block="21"
        R21 = 21,
        //% block="22"
        R22 = 22,
        //% block="23"
        R23 = 23,
        //% block="24"
        R24 = 24,
        //% block="25"
        R25 = 25,
        //% block="26"
        R26 = 26,
        //% block="27"
        R27 = 27
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

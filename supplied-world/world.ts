// Apocalyptic Lists world owner: current learner callbacks, Sprite-bound trials,
// atomically committed drafts, controller flow, frozen combat playback and progress.
namespace SpriteKind {
    export const ApocActor = SpriteKind.create()
    export const ApocObserver = SpriteKind.create()
    export const ApocStation = SpriteKind.create()
    export const ApocTargetMarker = SpriteKind.create()
}
namespace apocWorld {
    const LIMIT = 10
    const STATION_X = [86, 490, 288, 82, 288, 490]
    const STATION_Y = [650, 650, 66, 84, 664, 84]
    const SPEED_RATES = [0.5, 1, 2, 4]
    const SPEED_LABELS = ["0.5x", "1x", "2x", "4x"]
    const WALK_SPEED = 220
    const HALF_MS = 3200
    const SKIP_MS = 1000
    const PREVIEW_HOLD_MS = 500
    const EDIT_ACTIVATION_MS = 600
    const EDIT_MS = 2000
    const RIPPLE_MS = 650
    const EDIT_FIZZLE_MS = 220
    const EDIT_REVEAL_MS = 260
    const NO_EVENTS: apocTypes.TraceEvent[] = []
    class HalfAction {
        constructor() {}
        side: number = 0
        row: number = 0
        before: apocTypes.TrialSnapshot = null
        after: apocTypes.TrialSnapshot = null
        events: apocTypes.TraceEvent[] = []
        actor: Sprite = null
        target: Sprite = null
        fizzle: boolean = false
        status: string = "continue"
    }
    let begun = false
    let busy = false
    let invoking = false
    let generation = 0
    let playing = false
    let forecast: apocTypes.BattleResult = null
    let terminal: apocTypes.TrialSnapshot = null
    let halves: HalfAction[] = []
    let activeHalf: HalfAction = null
    let halfIndex = 0
    let halfStarted = 0
    let halfDuration = HALF_MS
    let halfEventPos = 0
    let consumed: boolean[] = []
    let previewing = false
    let previewReturn: apocTypes.TrialSnapshot = null
    let previewReturnEvent: apocTypes.TraceEvent = null
    let selectedRow = -1
    let selectedSide = 0
    let nearRow = -1
    let nearSide = -1
    let nearStation = -1
    let hoverStarted = 0
    let editStarted = -10000
    let editRecord: apocTypes.StationRecord = null
    let editForecastPending = false
    let selectedRoom = 1
    let selectedVariant = 1
    let progress: apocTypes.Progress = null
    let roomSpec: apocTypes.RoomSpec = null
    let initial: apocTypes.TrialSnapshot = null
    let trial: apocTypes.TrialSnapshot = null
    let display: apocTypes.TrialSnapshot = null
    let draft: apocTypes.TrialSnapshot = null
    let actors: Sprite[] = []
    let observer: Sprite = null
    let props: Sprite[] = []
    let allTarget: Sprite = null
    let handlers: (() => void)[] = []
    let staged: string[] = []
    let effectDraft: apocTypes.EffectEvent[] = []
    let records: apocTypes.StationRecord[] = []
    let callError = ""
    let activeStation = apocTypes.Station.Primary
    let recent = "Walk to a labeled station, press A; B opens menu"
    let recentEvent: apocTypes.TraceEvent = null
    let result: apocTypes.BattleResult = null
    let goal: apocTypes.GoalResult = null
    let menu = false
    let menuIndex = 0
    let roomPicker = false
    let pickerRoom = 1
    let lastAction = ""
    let resultingVictory = false
    let eraseConfirm = false
    let help = false
    let helpPage = 0
    let helpReturnMenu = false
    let observerLockX = 171
    let observerLockY = 650
    let motionLocked = false
    let direction = 0
    let speedIndex = 1
    let animationBaseWall = 0
    let animationBaseVirtual = 0

    function copyStrings(a: string[]): string[] { let b: string[] = []; if (a) for (let i = 0; i < a.length; i++) b.push(a[i]); return b }
    function copyNumbers(a: number[]): number[] { let b: number[] = []; if (a) for (let i = 0; i < a.length; i++) b.push(a[i]); return b }
    function copySprites(a: Sprite[]): Sprite[] { let b: Sprite[] = []; if (a) for (let i = 0; i < a.length; i++) b.push(a[i]); return b }
    function copyPower(p: apocTypes.PowerSource): apocTypes.PowerSource {
        if (!p) return null
        const q = new apocTypes.PowerSource()
        q.side = p.side; q.index = p.index; q.isAll = p.isAll; q.bonus = copyPower(p.bonus)
        return q
    }
    function applyTo(state: apocTypes.TrialSnapshot, e: apocTypes.TraceEvent): void {
        if (!state || !e || !e.target) return
        for (let i = 0; i < state.actors.length; i++) {
            const a = state.actors[i]
            if (a.sprite != e.target) continue
            if (e.hp >= 0) a.hp = e.hp
            if (e.kind == "ward-set") a.ward = copyPower(e.mark)
            else if (e.kind == "ward-consumed") a.ward = null
            else if (e.kind == "venom-set") a.venom = copyPower(e.mark)
            else if (e.kind == "venom-cleared") a.venom = null
            else if (e.kind == "empower-set") a.empower = copyPower(e.mark)
            else if (e.kind == "empower-used") a.empower = null
            return
        }
    }
    function halfFor(side: number, row: number): HalfAction {
        for (let i = 0; i < halves.length; i++) if (halves[i].side == side && halves[i].row == row) return halves[i]
        return null
    }
    // This cache is derived only from the actual resolver trace. It never edits
    // the authored trial, invokes a learner callback, draws randomness or awards.
    function refreshForecast(): void {
        forecast = trial ? apocCombat.resolve(trial, allTarget) : null
        terminal = trial ? apocCombat.cloneTrial(trial) : null
        halves = []
        if (!trial || !forecast || forecast.status == "invalid") return
        const state = apocCombat.cloneTrial(trial)
        let half: HalfAction = null
        for (let i = 0; i < forecast.trace.length; i++) {
            const e = forecast.trace[i]
            if (e.kind == "cursor" && (e.reason == "before ally half-turn" || e.reason == "before enemy half-turn")) {
                if (half) half.after = apocCombat.cloneTrial(state)
                half = new HalfAction()
                half.side = e.side; half.row = e.index; half.before = apocCombat.cloneTrial(state)
                const moves = e.side == apocTypes.Side.Ally ? state.lists.allyMoves : state.lists.enemyMoves
                const move = e.index < moves.length ? moves[e.index] : ""
                for (let j = 0; j < state.actors.length; j++) {
                    const a = state.actors[j]
                    if (a.side == e.side && a.ability == move) half.actor = a.sprite
                }
                const helpful = move == "Mend" || move == "Ward" || move == "Empower"
                const targetSide = helpful ? e.side : e.side == apocTypes.Side.Ally ? apocTypes.Side.Enemy : apocTypes.Side.Ally
                const targets = targetSide == apocTypes.Side.Ally ? state.lists.allyTargets : state.lists.enemyTargets
                if (e.index < targets.length) half.target = targets[e.index]
                halves.push(half)
            }
            if (half) {
                half.events.push(e)
                if (e.kind == "skip") half.fizzle = true
                if (e.kind == "result") half.status = forecast.status
            }
            applyTo(state, e)
        }
        if (half) half.after = apocCombat.cloneTrial(state)
        terminal = apocCombat.cloneTrial(state)
    }
    function animationActive(): boolean {
        return playing || previewing || uiAnimationTime() < editStarted + EDIT_MS + RIPPLE_MS
    }
    function lockObserver(): void {
        if (observer) { observerLockX = observer.x; observerLockY = observer.y }
    }
    function updateNear(): void {
        let row = -1, side = -1, station = -1
        if (observer) {
            // The panda may stand on any move, portrait or target in the pad.
            // Keep a small approach margin at both ends and a separate band
            // for each row; the centre line determines which half is selected.
            let distance = 24
            if (observer.x >= 157 && observer.x <= 419) for (let r = 0; r < 10; r++) {
                const s = observer.x < 288 ? 0 : 1
                if (uiCombatTimelineActive() && (uiCombatConsumed(s, r) || !halfFor(s, r))) continue
                const d = Math.abs(observer.y - (114 + 54 * r))
                if (d <= distance) { row = r; side = s; distance = d }
            }
            distance = 36 * 36 + 1
            for (let i = 0; i < STATION_X.length; i++) {
                if (i == 1 && (!roomSpec || !roomSpec.twoStations)) continue
                const dx = observer.x - STATION_X[i], dy = observer.y - STATION_Y[i]
                const d = dx * dx + dy * dy
                if (d < distance) { station = i; distance = d }
            }
        }
        if (row != nearRow || side != nearSide) hoverStarted = uiAnimationTime()
        nearRow = row; nearSide = side; nearStation = station
    }
    function active(): boolean { return invoking && busy && draft != null }
    function indexFor(room: apocTypes.Room, station: apocTypes.Station): number {
        if (room < 1 || room > 27 || (station != 1 && station != 2)) return -1
        return (room - 1) * 2 + station - 1
    }
    export function register(room: apocTypes.Room, station: apocTypes.Station, handler: () => void): void {
        const id = indexFor(room, station)
        if (id < 0) return
        while (handlers.length <= id) handlers.push(null)
        handlers[id] = handler // replaces current code; never invokes/caches a prior solution
    }
    function findActor(sprite: Sprite): apocTypes.ActorState {
        if (!trial || !sprite || sprite == allTarget) return null
        for (let i = 0; i < trial.actors.length; i++) if (trial.actors[i].sprite == sprite) return trial.actors[i]
        return null
    }
    function spriteFor(id: string): Sprite {
        if (id == "ALL" || id == "ALL_TARGET") return allTarget
        if (!trial) return null
        for (let i = 0; i < trial.actors.length; i++) if (trial.actors[i].id == id) return trial.actors[i].sprite
        return null
    }
    function permitted(name: string): boolean {
        if (!roomSpec) return false
        if (selectedRoom == 24) return name == "enemyMoves" // both stations, different ordered transformations
        if (selectedRoom == 27) return activeStation == apocTypes.Station.Secondary && name == "enemyMoves"
        for (let i = 0; i < roomSpec.editableLists.length; i++) if (roomSpec.editableLists[i] == name) return true
        return false
    }
    function allowedEffect(kind: string): boolean {
        if (!roomSpec) return false
        if (selectedRoom == 27) return activeStation == apocTypes.Station.Primary && kind == "hold"
        return kind == "hold" ? roomSpec.allowHold : roomSpec.allowBanish
    }
    function markStaged(name: string): void {
        for (let i = 0; i < staged.length; i++) if (staged[i] == name) return
        staged.push(name)
    }
    function reject(message: string): void { if (active() && !callError) callError = message }
    export function readMoves(side: apocTypes.Side): string[] {
        if (!active()) return []
        if (side == apocTypes.Side.Ally) return copyStrings(draft.lists.allyMoves)
        if (side == apocTypes.Side.Enemy) return copyStrings(draft.lists.enemyMoves)
        return []
    }
    export function readValues(side: apocTypes.Side): number[] {
        if (!active()) return []
        if (side == apocTypes.Side.Ally) return copyNumbers(draft.lists.allyValues)
        if (side == apocTypes.Side.Enemy) return copyNumbers(draft.lists.enemyValues)
        return []
    }
    export function readTargets(side: apocTypes.Side): Sprite[] {
        if (!active()) return []
        if (side == apocTypes.Side.Ally) return copySprites(draft.lists.allyTargets)
        if (side == apocTypes.Side.Enemy) return copySprites(draft.lists.enemyTargets)
        return []
    }
    export function readRoster(): Sprite[] { return active() ? copySprites(draft.roster) : [] }
    export function readSourceMoves(): string[] { return active() ? copyStrings(draft.sourceMoves) : [] }
    export function markedIndex(): number {
        if (!active() || !roomSpec) return -1
        return activeStation == apocTypes.Station.Primary ? roomSpec.primaryIndex : roomSpec.secondaryIndex
    }
    export function numberHint(): number { return active() && roomSpec ? roomSpec.numberHint : 0 }
    export function writeMoves(side: apocTypes.Side, list: string[]): void {
        if (!active()) return
        if (!list) { reject("Missing move array"); return }
        if (side == apocTypes.Side.Ally) { draft.lists.allyMoves = copyStrings(list); markStaged("allyMoves") }
        else if (side == apocTypes.Side.Enemy) { draft.lists.enemyMoves = copyStrings(list); markStaged("enemyMoves") }
        else reject("Unknown move side")
    }
    export function writeValues(side: apocTypes.Side, list: number[]): void {
        if (!active()) return
        if (!list) { reject("Missing value array"); return }
        if (side == apocTypes.Side.Ally) { draft.lists.allyValues = copyNumbers(list); markStaged("allyValues") }
        else if (side == apocTypes.Side.Enemy) { draft.lists.enemyValues = copyNumbers(list); markStaged("enemyValues") }
        else reject("Unknown value side")
    }
    export function writeTargets(side: apocTypes.Side, list: Sprite[]): void {
        if (!active()) return
        if (!list) { reject("Missing target array"); return }
        if (side == apocTypes.Side.Ally) { draft.lists.allyTargets = copySprites(list); markStaged("allyTargets") }
        else if (side == apocTypes.Side.Enemy) { draft.lists.enemyTargets = copySprites(list); markStaged("enemyTargets") }
        else reject("Unknown target side")
    }
    export function writeRoster(list: Sprite[]): void {
        if (!active()) return
        if (!list) { reject("Missing roster array"); return }
        draft.roster = copySprites(list)
        markStaged("roster")
    }
    export function writeSourceMoves(list: string[]): void {
        if (!active()) return
        if (!list) { reject("Missing reserve array"); return }
        draft.sourceMoves = copyStrings(list)
        markStaged("sourceMoves")
    }
    function effect(kind: string, actor: Sprite): void {
        if (!active()) return
        if (!allowedEffect(kind)) { reject(kind + " not allowed here"); return }
        const original = findActor(actor)
        if (!original || !original.present || original.hp <= 0) { reject("Not a current available actor Sprite"); return }
        for (let i = 0; i < draft.actors.length; i++) {
            if (draft.actors[i].sprite == actor) {
                if (kind == "hold") draft.actors[i].held = true
                else draft.actors[i].present = false
                let e = new apocTypes.EffectEvent()
                e.kind = kind
                e.actor = actor
                effectDraft.push(e)
                return
            }
        }
        reject("Effect actor missing")
    }
    export function hold(actor: Sprite): void { effect("hold", actor) }
    export function banish(actor: Sprite): void { effect("banish", actor) }

    function validStrings(a: string[]): boolean {
        if (!a || a.length > LIMIT) return false
        for (let i = 0; i < a.length; i++) if (typeof a[i] != "string") return false
        return true // unknown move names are intentional combat fizzles
    }
    function validValues(a: number[]): boolean {
        if (!a || a.length > LIMIT) return false
        for (let i = 0; i < a.length; i++) if (typeof a[i] != "number" || a[i] < 0 || a[i] > 9 || a[i] != Math.floor(a[i])) return false
        return true
    }
    function validSprites(a: Sprite[], allowAll: boolean): boolean {
        if (!a || a.length > LIMIT) return false
        for (let i = 0; i < a.length; i++) {
            if (a[i] == allTarget && allowAll) continue
            if (!findActor(a[i])) return false
        }
        return true
    }
    function same(a: any[], b: any[]): boolean {
        if (!a || !b || a.length != b.length) return false
        for (let i = 0; i < a.length; i++) if (a[i] != b[i]) return false
        return true
    }
    function edited(name: string): boolean {
        return name == "allyMoves" ? !same(trial.lists.allyMoves, draft.lists.allyMoves) :
            name == "enemyMoves" ? !same(trial.lists.enemyMoves, draft.lists.enemyMoves) :
            name == "allyValues" ? !same(trial.lists.allyValues, draft.lists.allyValues) :
            name == "enemyValues" ? !same(trial.lists.enemyValues, draft.lists.enemyValues) :
            name == "allyTargets" ? !same(trial.lists.allyTargets, draft.lists.allyTargets) :
            name == "enemyTargets" ? !same(trial.lists.enemyTargets, draft.lists.enemyTargets) :
            name == "roster" ? !same(trial.roster, draft.roster) : !same(trial.sourceMoves, draft.sourceMoves)
    }
    function validateDraft(): string {
        if (callError) return callError
        const names = ["allyMoves", "allyValues", "allyTargets", "enemyMoves", "enemyValues", "enemyTargets", "roster", "sourceMoves"]
        for (let i = 0; i < staged.length; i++) if (!permitted(staged[i])) return "Cannot write " + staged[i] + " at this station"
        for (let i = 0; i < names.length; i++) if (edited(names[i]) && !permitted(names[i])) return "Unauthorized " + names[i]
        const l = draft.lists
        if (!validStrings(l.allyMoves) || !validStrings(l.enemyMoves) || !validStrings(draft.sourceMoves)) return "Move/source must be <=10 strings"
        if (!validValues(l.allyValues) || !validValues(l.enemyValues)) return "Values must be integer 0..9 (<=10)"
        if (!validSprites(l.allyTargets, true) || !validSprites(l.enemyTargets, true)) return "Unknown target Sprite or >10 targets"
        if (!validSprites(draft.roster, false)) return "Roster must contain current Sprite references"
        if (selectedRoom == 14 && activeStation == apocTypes.Station.Secondary) {
            const before = trial.lists.allyValues, after = l.allyValues
            if (after.length != before.length || after[0] < 4 || after[0] > 9) return "Reroll changes only the first value to 4..9"
            for (let i = 1; i < before.length; i++) if (after[i] != before[i]) return "Reroll changes only the first value"
        }
        return ""
    }
    function canVisitStation(station: apocTypes.Station): boolean {
        return !!roomSpec && (station == apocTypes.Station.Primary || (station == apocTypes.Station.Secondary && roomSpec.twoStations))
    }
    function interact(station: apocTypes.Station): void {
        if (busy || animationActive() || menu || help || !trial) return
        if (!canVisitStation(station)) { recent = "No secondary station in R" + roomLabel(); return }
        const slot = indexFor(selectedRoom, station)
        if (slot < 0 || slot >= handlers.length || !handlers[slot]) {
            recent = "No current handler. Open R" + roomLabel() + " Recipe and add the block"
            return
        }
        busy = true
        const callGeneration = generation
        activeStation = station
        draft = apocCombat.cloneTrial(trial)
        staged = []
        effectDraft = []
        callError = ""
        invoking = true
        // The learner callback is required by contract to be synchronous/non-yielding.
        handlers[slot]()
        invoking = false
        if (callGeneration != generation) callError = "Trial changed during callback"
        const bad = validateDraft()
        if (bad) {
            recent = "Rejected: " + bad + "; previous lists kept"
        } else {
            let record = new apocTypes.StationRecord()
            record.station = station
            record.before = apocCombat.cloneTrial(trial)
            record.after = apocCombat.cloneTrial(draft)
            record.effects = effectDraft.slice()
            records.push(record)
            trial = apocCombat.cloneTrial(draft)
            display = apocCombat.cloneTrial(trial)
            // A fresh accepted edit supersedes the previous battle visualization.
            recentEvent = null
            lastAction = apocView.stationLabel(station == apocTypes.Station.Primary ? 0 : 1)
            result = null
            goal = null
            resultingVictory = false
            editRecord = record
            editStarted = uiAnimationTime()
            editForecastPending = true
            consumed = []
            lockObserver()
            recent = selectedRoom == 24 && station == apocTypes.Station.Primary ? "The list shifted. Use Right altar next, then Release time." :
                selectedRoom == 14 ? (station == apocTypes.Station.Secondary ? "First power rerolled. Swap it into the fourth slot at Left altar." : "Powers exchanged. Check the forecast; roll first and swap again if needed.") :
                selectedRoom == 27 && station == apocTypes.Station.Primary ? "Enemies frozen. Use Right altar next, then Release time." :
                "Plan changed. Follow the glowing Release time crystal to see the result."
        }
        draft = null
        effectDraft = []
        staged = []
        busy = false
    }
    function destroyActors(): void {
        // Remove every reference path before destroying any old Sprite.
        draft = null
        trial = null
        display = null
        initial = null
        roomSpec = null
        recentEvent = null
        result = null
        goal = null
        records = []
        forecast = null
        terminal = null
        halves = []
        consumed = []
        activeHalf = null
        previewReturn = null
        previewReturnEvent = null
        previewing = false
        editRecord = null
        editStarted = -10000
        editForecastPending = false
        selectedRow = -1
        selectedSide = apocTypes.Side.Ally
        nearRow = -1
        nearSide = -1
        nearStation = -1
        effectDraft = []
        staged = []
        for (let i = 0; i < actors.length; i++) sprites.destroy(actors[i])
        actors = []
    }
    function build(room: number, variant: number): void {
        if (busy || animationActive()) return
        generation++
        destroyActors()
        selectedRoom = room
        selectedVariant = variant
        roomSpec = apocRooms.spec(room, variant)
        if (!roomSpec || !roomSpec.battle) { recent = "Missing curated room setup R" + room; return }
        trial = new apocTypes.TrialSnapshot()
        trial.lists = new apocTypes.CombatLists()
        trial.actors = []
        const battle = roomSpec.battle
        for (let i = 0; i < battle.actors.length; i++) {
            const source = battle.actors[i]
            let sprite = sprites.create(apocArt.actor(source.artKey, source.side), SpriteKind.ApocActor)
            sprite.setFlag(SpriteFlag.Invisible, true)
            sprite.setFlag(SpriteFlag.Ghost, true)
            sprite.setPosition(0, 0)
            actors.push(sprite)
            let state = new apocTypes.ActorState()
            state.id = source.id; state.sprite = sprite; state.side = source.side
            state.hp = source.hp; state.maxHP = source.maxHP
            state.ability = source.ability; state.trait = source.trait
            state.present = source.present; state.held = source.held
            state.ward = source.ward; state.venom = source.venom; state.empower = source.empower
            trial.actors.push(state)
        }
        trial.lists.allyMoves = copyStrings(battle.allyMoves)
        trial.lists.allyValues = copyNumbers(battle.allyValues)
        trial.lists.enemyMoves = copyStrings(battle.enemyMoves)
        trial.lists.enemyValues = copyNumbers(battle.enemyValues)
        trial.lists.allyTargets = []
        trial.lists.enemyTargets = []
        trial.roster = []
        for (let i = 0; i < battle.allyTargetIDs.length; i++) trial.lists.allyTargets.push(spriteFor(battle.allyTargetIDs[i]))
        for (let i = 0; i < battle.enemyTargetIDs.length; i++) trial.lists.enemyTargets.push(spriteFor(battle.enemyTargetIDs[i]))
        for (let i = 0; i < roomSpec.rosterIDs.length; i++) trial.roster.push(spriteFor(roomSpec.rosterIDs[i]))
        trial.sourceMoves = copyStrings(roomSpec.sourceMoves)
        trial.goal = battle.goal
        trial.requiredIDs = copyStrings(battle.requiredIDs)
        if (observer) observer.setPosition(171, 650)
        direction = 0
        initial = apocCombat.cloneTrial(trial)
        display = apocCombat.cloneTrial(trial)
        refreshForecast()
        lastAction = ""
        recent = "Open room " + selectedRoom + " instructions. Use the glowing altar, then Release time."
        menu = false
        roomPicker = false
        playing = false
        previewing = false
        eraseConfirm = false
        help = false
        helpPage = 0
        helpReturnMenu = false
        updateNear()
    }
    function roomLabel(): string { return selectedRoom < 10 ? "0" + selectedRoom : "" + selectedRoom }
    function reset(): void { if (!busy && !animationActive()) build(selectedRoom, selectedVariant) }
    function nextVariant(): void {
        if (!busy && !animationActive()) build(selectedRoom, selectedVariant % 3 + 1)
    }
    function travel(to: number): void {
        if (busy || animationActive() || !progress || to < 1 || to > progress.highestUnlocked) return
        build(to, 1)
        progress.resumeRoom = to
        apocSave.store(progress)
    }
    function doneWithTrace(): void {
        if (!playing) return
        playing = false
        if (result && result.finalActors && display) display.actors = result.finalActors.slice()
        if (resultingVictory) {
            const bit = 1 << (selectedRoom - 1)
            progress.completedMask |= bit
            // Unlock only the contiguous path actually earned, never grant skipped rooms.
            if (selectedRoom == progress.highestUnlocked && selectedRoom < 27) progress.highestUnlocked = selectedRoom + 1
            apocSave.store(progress)
            recent = selectedRoom == 27 ? "The expedition survived! All 27 list powers restored. B to revisit." : "Plan worked! The gate is open. Walk to Exit, or choose Continue in B."
        } else if (!result || result.status != "victory") {
            // A lost battle must remain visible even when the list task is also unfinished.
            recent = result ? "Battle " + result.status + ": Retry or Reset" : "Battle did not resolve"
        } else {
            recent = "Battle won. Finish the list task: " + (goal && goal.messages.length > 0 ? goal.messages[0] : "check the changed lists")
        }
    }
    function applyTrace(e: apocTypes.TraceEvent): void {
        if (!e) return
        recentEvent = e
        applyTo(display, e)
    }
    function beginHalf(half: HalfAction): void {
        activeHalf = half
        halfDuration = (half.fizzle ? SKIP_MS : HALF_MS) + (previewing ? PREVIEW_HOLD_MS * 2 : 0)
        halfStarted = uiAnimationTime()
        halfEventPos = 0
        recentEvent = null
        display = apocCombat.cloneTrial(half.before)
    }
    function previewMoment(side: number, row: number): void {
        if (busy || animationActive() || menu || help || !trial) return
        const half = halfFor(side, row)
        if (!half) {
            recent = "The pass ends before this moment. Its cells stay in place."
            return
        }
        previewReturn = apocCombat.cloneTrial(display || trial)
        previewReturnEvent = recentEvent
        previewing = true
        lockObserver()
        beginHalf(half)
        recent = "Preview only: " + (side == apocTypes.Side.Ally ? "ally" : "enemy") + " moment " + row
    }
    function tickAnimation(): void {
        // Keep the old scene through activation and the opening fizzle. Resolve exactly once
        // while the edit pieces are isolated, before the room is revealed.
        if (editForecastPending && uiAnimationTime() >= editStarted + EDIT_ACTIVATION_MS + EDIT_FIZZLE_MS) {
            editForecastPending = false
            refreshForecast()
        }
        if ((!playing && !previewing) || !activeHalf) return
        const elapsed = uiAnimationTime() - halfStarted
        const phase = uiCombatProgress()
        // The number, move and actor travel before impact. Preserve actual trace
        // order, but apply HP/marks only as effects land in the final action stage.
        const eventPhase = phase >= 0.94 ? 1 : Math.max(0, (phase - 0.80) / 0.14)
        const count = Math.min(activeHalf.events.length, Math.floor(eventPhase * activeHalf.events.length))
        while (halfEventPos < count) applyTrace(activeHalf.events[halfEventPos++])
        if (elapsed < halfDuration) return
        while (halfEventPos < activeHalf.events.length) applyTrace(activeHalf.events[halfEventPos++])
        display = apocCombat.cloneTrial(activeHalf.after)
        if (previewing) {
            previewing = false
            display = previewReturn
            recentEvent = previewReturnEvent
            previewReturn = null
            previewReturnEvent = null
            activeHalf = null
            recent = "Preview finished. The plan and saved progress are unchanged."
        } else {
            consumed[activeHalf.side * LIMIT + activeHalf.row] = true
            halfIndex++
            if (halfIndex < halves.length) beginHalf(halves[halfIndex])
            else { activeHalf = null; doneWithTrace() }
        }
    }
    function run(): void {
        if (busy || animationActive() || menu || help || !trial || !roomSpec) return
        busy = true
        // Do not leave an old cursor/mark on screen if validation rejects this run.
        recentEvent = null
        const frozen = apocCombat.cloneTrial(trial)
        goal = apocGoals.assess(roomSpec, apocCombat.cloneTrial(initial), apocCombat.cloneTrial(frozen), records.slice())
        result = forecast
        if (!result || result.status == "invalid") {
            recent = "Invalid combat: " + (result && result.errors.length ? result.errors[0] : "no forecast")
            display = apocCombat.cloneTrial(trial)
            busy = false
            return
        }
        resultingVictory = result.status == "victory" && goal.met
        display = apocCombat.cloneTrial(frozen)
        recentEvent = null
        playing = true
        consumed = []
        lockObserver()
        halfIndex = 0
        recent = "The frozen plan plays once, one half-action at a time."
        busy = false
        if (halves.length) beginHalf(halves[0])
        else doneWithTrace()
    }
    function useAction(n: number): void {
        if (busy || animationActive() || eraseConfirm || help) return
        if (n == 0) interact(apocTypes.Station.Primary)
        else if (n == 1) interact(apocTypes.Station.Secondary)
        else if (n == 2) run()
        else if (n == 3 || n == 4) reset()
        else if (n == 5) nextVariant()
        else if (n == 6) {
            const completed = progress && (progress.completedMask & (1 << (selectedRoom - 1))) != 0
            if (completed && selectedRoom < 27) travel(selectedRoom + 1)
            else recent = selectedRoom == 27 && completed ? "The End - replay any earned room from B" : "EXIT locked: finish task AND win"
        } else if (n == 7) { roomPicker = true; pickerRoom = selectedRoom; lockObserver() }
        else if (n == 8) openHelp(0, true)
        else if (n == 9) {
            eraseConfirm = true
            lockObserver()
            recent = "ERASE game progress? A confirm, B cancel"
        } else if (n == 10) cycleSpeed()
    }
    function cycleSpeed(): void {
        if (busy || animationActive() || help || roomPicker || eraseConfirm) return
        const wall = control.millis()
        animationBaseVirtual += (wall - animationBaseWall) * SPEED_RATES[speedIndex]
        animationBaseWall = wall
        speedIndex = (speedIndex + 1) % SPEED_RATES.length
        apocSave.storeSpeed(speedIndex)
        recent = "Animation speed " + uiSpeedLabel() + ". Walking speed is unchanged."
    }
    function openHelp(page: number, fromMenu: boolean): void {
        helpPage = Math.constrain(page, 0, roomSpec && roomSpec.twoStations ? 2 : 1)
        helpReturnMenu = fromMenu
        help = true
        lockObserver()
        recent = "Left/Right turns help pages. B returns without using the altar."
    }
    function stationAction(): void {
        if (!observer) return
        updateNear()
        if (nearStation >= 0) { useAction(nearStation == 5 ? 10 : nearStation == 4 ? 6 : nearStation); return }
        if (nearRow >= 0) {
            selectedRow = nearRow
            selectedSide = nearSide
            recent = "Selected " + (selectedSide == apocTypes.Side.Ally ? "ally" : "enemy") + " moment " + selectedRow + ". B previews this half-action."
        } else recent = "Walk beside a moment to select it, or approach a room object. B opens the menu."
    }
    function menuUp(delta: number): void {
        if (animationActive() || eraseConfirm) return
        if (help) {
            const pages = uiHelpPages()
            helpPage = (helpPage + delta + pages) % pages
            return
        }
        if (roomPicker) { pickerRoom += delta; if (pickerRoom < 1) pickerRoom = 1; if (pickerRoom > progress.highestUnlocked) pickerRoom = progress.highestUnlocked }
        else if (menu) { menuIndex += delta; if (menuIndex < 0) menuIndex = 10; if (menuIndex > 10) menuIndex = 0 }
    }
    export function start(): void {
        if (begun) return
        begun = true
        speedIndex = apocSave.loadSpeed()
        animationBaseWall = control.millis()
        animationBaseVirtual = 0
        progress = apocSave.load()
        allTarget = sprites.create(image.create(1, 1), SpriteKind.ApocTargetMarker)
        allTarget.setFlag(SpriteFlag.Invisible, true)
        allTarget.setFlag(SpriteFlag.Ghost, true)
        observer = sprites.create(apocArt.observer(), SpriteKind.ApocObserver)
        observer.setFlag(SpriteFlag.Invisible, true)
        observer.setFlag(SpriteFlag.Ghost, true)
        observer.setPosition(171, 650)
        controller.moveSprite(observer, WALK_SPEED, WALK_SPEED)
        for (let i = 0; i < STATION_X.length; i++) {
            let station = sprites.create(image.create(1, 1), SpriteKind.ApocStation)
            station.setPosition(STATION_X[i], STATION_Y[i])
            station.setFlag(SpriteFlag.Ghost, true)
            station.setFlag(SpriteFlag.Invisible, true)
            props.push(station)
        }
        build(progress.resumeRoom, 1)
        if (apocSave.notice()) recent = apocSave.notice()
        controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
            if (busy || animationActive() || help) return
            if (eraseConfirm) {
                eraseConfirm = false
                apocSave.clear()
                progress = apocSave.load()
                build(1, 1)
                recent = "Only Apocalyptic Lists progress was erased"
                return
            }
            if (roomPicker) { roomPicker = false; menu = false; travel(pickerRoom); return }
            if (menu) {
                const selected = menuIndex
                menu = false
                useAction(selected)
                return
            }
            stationAction()
        })
        controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
            if (busy || animationActive()) return
            if (help) {
                help = false
                if (helpReturnMenu) { menu = true; menuIndex = 8 }
                recent = "Back from help. Your lists are unchanged."
                return
            }
            if (eraseConfirm) { eraseConfirm = false; recent = "Progress erase canceled"; return }
            if (roomPicker) { roomPicker = false; return }
            updateNear()
            if (!menu && (nearStation == 0 || nearStation == 1)) { openHelp(nearStation, false); return }
            if (!menu && nearRow >= 0) { previewMoment(nearSide, nearRow); return }
            menu = !menu
            if (menu) { menuIndex = 0; lockObserver() }
        })
        controller.up.onEvent(ControllerButtonEvent.Pressed, function () { menuUp(-1) })
        controller.down.onEvent(ControllerButtonEvent.Pressed, function () { menuUp(1) })
        controller.left.onEvent(ControllerButtonEvent.Pressed, function () { if (roomPicker || help) menuUp(-1) })
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () { if (roomPicker || help) menuUp(1) })
        game.onUpdate(function () {
            if (observer) {
                const lock = menu || roomPicker || animationActive() || busy || eraseConfirm || help
                if (lock != motionLocked) {
                    motionLocked = lock
                    controller.moveSprite(observer, lock ? 0 : WALK_SPEED, lock ? 0 : WALK_SPEED)
                }
                if (observer.x < 36) observer.x = 36
                if (observer.x > 540) observer.x = 540
                if (observer.y < 86) observer.y = 86
                if (observer.y > 674) observer.y = 674
                if (lock) {
                    observer.vx = 0
                    observer.vy = 0
                    observer.x = observerLockX
                    observer.y = observerLockY
                } else if (Math.abs(observer.vx) > Math.abs(observer.vy)) {
                    if (observer.vx < 0) direction = 1
                    else if (observer.vx > 0) direction = 2
                } else {
                    if (observer.vy < 0) direction = 3
                    else if (observer.vy > 0) direction = 0
                }
            }
            updateNear()
            tickAnimation()
        })
        game.onPaint(function () { apocView.draw() })
    }
    // Read-only renderer bindings. Only apocWorld changes authoritative trial/progress.
    export function uiSpec(): apocTypes.RoomSpec { return roomSpec }
    export function uiInitial(): apocTypes.TrialSnapshot { return initial }
    export function uiTrial(): apocTypes.TrialSnapshot { return trial }
    export function uiDisplay(): apocTypes.TrialSnapshot { return display }
    export function uiRecords(): apocTypes.StationRecord[] { return records }
    export function uiResult(): apocTypes.BattleResult { return result }
    export function uiGoal(): apocTypes.GoalResult { return goal }
    export function uiProgress(): apocTypes.Progress { return progress }
    export function uiEvent(): apocTypes.TraceEvent { return recentEvent }
    export function uiNotice(): string { return apocWords.text(recent) }
    export function uiPlaying(): boolean { return playing }
    export function uiMenu(): boolean { return menu }
    export function uiEraseConfirm(): boolean { return eraseConfirm }
    export function uiMenuIndex(): number { return menuIndex }
    export function uiPicking(): boolean { return roomPicker }
    export function uiPickRoom(): number { return pickerRoom }
    export function uiRoom(): number { return selectedRoom }
    export function uiVariant(): number { return selectedVariant }
    export function uiSentinel(): Sprite { return allTarget }
    export function uiObserverX(): number { return observer ? observer.x : 171 }
    export function uiObserverY(): number { return observer ? observer.y : 650 }
    export function uiAnimationTime(): number { return animationBaseVirtual + (control.millis() - animationBaseWall) * SPEED_RATES[speedIndex] }
    export function uiSpeedLabel(): string { return SPEED_LABELS[speedIndex] }
    export function uiSpeedMultiplier(): number { return SPEED_RATES[speedIndex] }
    export function uiCombatBaseDuration(): number { return HALF_MS }
    export function uiDirection(): number { return direction }
    export function uiStep(): number {
        return observer && !motionLocked && (Math.abs(observer.vx) > 4 || Math.abs(observer.vy) > 4) ? Math.idiv(control.millis(), 140) % 2 : -1
    }
    export function uiSelectedRow(): number { return selectedRow }
    export function uiSelectedSide(): number { return selectedSide }
    export function uiNearRow(): number { return nearRow }
    export function uiNearSide(): number { return nearSide }
    export function uiNearStation(): number { return nearStation }
    export function uiHoverStarted(): number { return hoverStarted }
    export function uiStationX(index: number): number { return index >= 0 && index < STATION_X.length ? STATION_X[index] : -1 }
    export function uiStationY(index: number): number { return index >= 0 && index < STATION_Y.length ? STATION_Y[index] : -1 }
    export function uiMomentX(side: number): number { return side == apocTypes.Side.Ally ? 171 : 405 }
    export function uiMomentY(row: number): number { return 114 + 54 * row }
    export function uiForecast(): apocTypes.BattleResult { return forecast }
    export function uiTerminal(): apocTypes.TrialSnapshot { return terminal }
    export function uiBefore(side: number, row: number): apocTypes.TrialSnapshot {
        const h = halfFor(side, row); return h ? h.before : null
    }
    export function uiAfter(side: number, row: number): apocTypes.TrialSnapshot {
        const h = halfFor(side, row); return h ? h.after : null
    }
    export function uiActionEvents(side: number, row: number): apocTypes.TraceEvent[] {
        const h = halfFor(side, row); return h ? h.events : NO_EVENTS
    }
    export function uiReached(side: number, row: number): boolean { return !!halfFor(side, row) }
    export function uiActionActor(side: number, row: number): Sprite {
        const h = halfFor(side, row); return h ? h.actor : null
    }
    export function uiActionTarget(side: number, row: number): Sprite {
        const h = halfFor(side, row); return h ? h.target : null
    }
    export function uiActionStatus(side: number, row: number): string {
        const h = halfFor(side, row); return h ? h.status : "not-reached"
    }
    export function uiSkipReason(side: number, row: number): string {
        const h = halfFor(side, row)
        if (h) for (let i = 0; i < h.events.length; i++) if (h.events[i].kind == "skip") return h.events[i].reason
        return ""
    }
    export function uiActiveRow(): number { return activeHalf ? activeHalf.row : selectedRow }
    export function uiActiveSide(): number { return activeHalf ? activeHalf.side : selectedSide }
    export function uiCombatProgress(): number {
        if (!activeHalf) return 0
        const elapsed = uiAnimationTime() - halfStarted - (previewing ? PREVIEW_HOLD_MS : 0)
        return Math.max(0, Math.min(1, elapsed / (activeHalf.fizzle ? SKIP_MS : HALF_MS)))
    }
    export function uiPhase(): number { return uiCombatProgress() }
    export function uiCombatSkipped(): boolean { return !!activeHalf && activeHalf.fizzle }
    export function uiCombatConsumed(side: number, row: number): boolean {
        return side >= 0 && side < 2 && row >= 0 && row < LIMIT && !!consumed[side * LIMIT + row]
    }
    export function uiMomentConsumed(row: number): boolean {
        const ally = halfFor(0, row), enemy = halfFor(1, row)
        return (!!ally || !!enemy) && (!ally || uiCombatConsumed(0, row)) && (!enemy || uiCombatConsumed(1, row))
    }
    export function uiCombatTimelineActive(): boolean {
        if (previewing) return false
        if (playing) return true
        for (let i = 0; i < LIMIT * 2; i++) if (consumed[i]) return true
        return false
    }
    export function uiPreview(): boolean { return previewing }
    export function uiFizzle(): boolean { return false }
    export function uiEditStarted(): number { return editStarted }
    export function uiEditDuration(): number { return EDIT_MS }
    export function uiEditActivationDuration(): number { return EDIT_ACTIVATION_MS }
    export function uiEditFizzleDuration(): number { return EDIT_FIZZLE_MS }
    export function uiEditRevealDuration(): number { return EDIT_REVEAL_MS }
    export function uiRippleDuration(): number { return RIPPLE_MS }
    export function uiEditRecord(): apocTypes.StationRecord { return editRecord }
    export function uiAnimating(): boolean { return animationActive() }
    export function uiHelp(): boolean { return help }
    export function uiHelpPage(): number { return helpPage }
    export function uiHelpPages(): number { return roomSpec && roomSpec.twoStations ? 3 : 2 }
    export function uiLastAction(): string { return lastAction }
    // Guide the physical interaction, without doing or grading the learner's edit.
    export function uiSuggestedStation(): number {
        if (animationActive()) return -1
        if (result && resultingVictory) return 4
        if (selectedRoom == 14 && trial) {
            if (forecast && forecast.status == "victory") return 2
            return trial.lists.allyValues[0] >= selectedVariant + 3 ? 0 : 1
        }
        if (result) return 3
        if (records.length == 0) return 0
        if (roomSpec && roomSpec.twoStations && records.length == 1 && records[0].station == apocTypes.Station.Primary) return 1
        return 2
    }
}

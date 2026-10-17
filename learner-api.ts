// Display words only. Combat, goals and encounter IDs retain their original names.
// These helpers do not edit a list, choose a target or execute a learner operation.
namespace apocWords {
    let oldText: string[] = []
    let newText: string[] = []
    //% blockHidden=true
    export function move(name: string): string {
        if (name == "Strike") return "Attack"
        if (name == "Ward") return "Shield"
        if (name == "Mend") return "Heal"
        if (name == "Flurry") return "Attack all"
        if (name == "Reap") return "Finish"
        if (name == "Venom") return "Poison"
        if (name == "Empower") return "Boost next"
        return name
    }
    //% blockHidden=true
    export function internalMove(name: string): string {
        if (name == "Attack") return "Strike"
        if (name == "Shield") return "Ward"
        if (name == "Heal") return "Mend"
        if (name == "Attack all") return "Flurry"
        if (name == "Finish") return "Reap"
        if (name == "Poison") return "Venom"
        if (name == "Boost next") return "Empower"
        return name
    }
    //% blockHidden=true
    export function moveList(list: string[], toInternal: boolean): string[] {
        if (!list) return list
        const copy: string[] = []
        for (let i = 0; i < list.length; i++) copy.push(toInternal ? internalMove(list[i]) : move(list[i]))
        return copy
    }
    function letter(s: string): boolean { return !!s && "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(s) >= 0 }
    function word(s: string, from: string, to: string): string {
        let out = "", i = 0
        while (i < s.length) {
            if (s.substr(i, from.length) == from && (i == 0 || !letter(s.charAt(i - 1))) && !letter(s.charAt(i + from.length))) {
                out += to; i += from.length
            } else { out += s.charAt(i); i++ }
        }
        return out
    }
    //% blockHidden=true
    export function text(s: string): string {
        if (!s) return s
        const cached = oldText.indexOf(s)
        if (cached >= 0) return newText[cached]
        const original = s
        const old = ["Strikes", "Wards", "Strike", "Ward", "Mend", "Flurry", "Reap", "Venom", "Empower", "Primary", "Secondary", "Station 1", "Station 2", "first altar", "second altar", "FIRST ALTAR", "SECOND ALTAR", "allied", "Allied", "hazard roster", "roster", "Sprite", "Sprites", "Hold", "hold", "held", "source moves", "value", "values"]
        const names = ["Attacks", "Shields", "Attack", "Shield", "Heal", "Attack all", "Finish", "Poison", "Boost next", "Left altar", "Right altar", "Left altar", "Right altar", "Left altar", "Right altar", "LEFT ALTAR", "RIGHT ALTAR", "our team", "Our team", "enemy list", "enemy list", "character", "characters", "Freeze", "freeze", "frozen", "reserve moves", "power", "powers"]
        for (let i = 0; i < old.length; i++) s = word(s, old[i], names[i])
        oldText.push(original); newText.push(s)
        if (oldText.length > 128) { oldText.shift(); newText.shift() }
        return s
    }
}
//% color=#735AA6 block="Apocalyptic Lists" weight=85
namespace apocalypse {
    //% blockId=al_on_interact block="when I use $station in room $room" weight=100
    export function onInteract(room: apocTypes.Room, station: apocTypes.Station, handler: () => void): void {
        apocWorld.register(room, station, handler)
    }
    //% blockId=al_moves block="move list for $side" weight=90
    export function moves(side: apocTypes.Side): string[] { return apocWords.moveList(apocWorld.readMoves(side), false) }
    //% blockId=al_values block="power list for $side" weight=89
    export function values(side: apocTypes.Side): number[] { return apocWorld.readValues(side) }
    //% blockId=al_targets block="target list for $side" weight=88
    export function targets(side: apocTypes.Side): Sprite[] { return apocWorld.readTargets(side) }
    //% blockId=al_roster block="enemy list" weight=87
    export function roster(): Sprite[] { return apocWorld.readRoster() }
    //% blockId=al_source_moves block="reserve move list" weight=86
    export function sourceMoves(): string[] { return apocWords.moveList(apocWorld.readSourceMoves(), false) }
    //% blockId=al_set_moves block="set move list for $side to $list" weight=80 list.shadow=variables_get list.defl=list
    export function setMoves(side: apocTypes.Side, list: string[]): void { apocWorld.writeMoves(side, apocWords.moveList(list, true)) }
    //% blockId=al_set_values block="set power list for $side to $list" weight=79 list.shadow=variables_get list.defl=list
    export function setValues(side: apocTypes.Side, list: number[]): void { apocWorld.writeValues(side, list) }
    //% blockId=al_set_targets block="set target list for $side to $list" weight=78 list.shadow=variables_get list.defl=list
    export function setTargets(side: apocTypes.Side, list: Sprite[]): void { apocWorld.writeTargets(side, list) }
    //% blockId=al_set_roster block="set enemy list to $list" weight=77 list.shadow=variables_get list.defl=list
    export function setRoster(list: Sprite[]): void { apocWorld.writeRoster(list) }
    //% blockId=al_set_source_moves block="set reserve move list to $list" weight=76 list.shadow=variables_get list.defl=list
    export function setSourceMoves(list: string[]): void { apocWorld.writeSourceMoves(apocWords.moveList(list, true)) }
    //% blockId=al_hold block="freeze $actor" weight=70
    export function hold(actor: Sprite): void { apocWorld.hold(actor) }
    //% blockId=al_banish block="banish $actor" weight=69
    export function banish(actor: Sprite): void { apocWorld.banish(actor) }
    //% blockId=al_marked_index block="index marked by this altar" weight=60
    export function markedIndex(): number { return apocWorld.markedIndex() }
    //% blockId=al_number_hint block="Waits to add first" weight=59
    export function numberHint(): number { return apocWorld.numberHint() }
}

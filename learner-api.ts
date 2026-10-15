//% color=#735AA6 block="Apocalyptic Lists" weight=85
namespace apocalypse {
    //% blockId=al_on_interact block="on room $room station $station" weight=100
    export function onInteract(room: apocTypes.Room, station: apocTypes.Station, handler: () => void): void {
        apocWorld.register(room, station, handler)
    }
    //% blockId=al_moves block="$side move list" weight=90
    export function moves(side: apocTypes.Side): string[] { return apocWorld.readMoves(side) }
    //% blockId=al_values block="$side value list" weight=89
    export function values(side: apocTypes.Side): number[] { return apocWorld.readValues(side) }
    //% blockId=al_targets block="$side target list" weight=88
    export function targets(side: apocTypes.Side): Sprite[] { return apocWorld.readTargets(side) }
    //% blockId=al_roster block="hazard roster" weight=87
    export function roster(): Sprite[] { return apocWorld.readRoster() }
    //% blockId=al_source_moves block="source move list" weight=86
    export function sourceMoves(): string[] { return apocWorld.readSourceMoves() }
    //% blockId=al_set_moves block="use $list as $side move list" weight=80
    export function setMoves(side: apocTypes.Side, list: string[]): void { apocWorld.writeMoves(side, list) }
    //% blockId=al_set_values block="use $list as $side value list" weight=79
    export function setValues(side: apocTypes.Side, list: number[]): void { apocWorld.writeValues(side, list) }
    //% blockId=al_set_targets block="use $list as $side target list" weight=78
    export function setTargets(side: apocTypes.Side, list: Sprite[]): void { apocWorld.writeTargets(side, list) }
    //% blockId=al_set_roster block="use $list as hazard roster" weight=77
    export function setRoster(list: Sprite[]): void { apocWorld.writeRoster(list) }
    //% blockId=al_set_source_moves block="use $list as reserve move list" weight=76
    export function setSourceMoves(list: string[]): void { apocWorld.writeSourceMoves(list) }
    //% blockId=al_hold block="hold $actor" weight=70
    export function hold(actor: Sprite): void { apocWorld.hold(actor) }
    //% blockId=al_banish block="banish $actor" weight=69
    export function banish(actor: Sprite): void { apocWorld.banish(actor) }
    //% blockId=al_marked_index block="marked index" weight=60
    export function markedIndex(): number { return apocWorld.markedIndex() }
    //% blockId=al_number_hint block="shown leading Wait count" weight=59
    export function numberHint(): number { return apocWorld.numberHint() }
}

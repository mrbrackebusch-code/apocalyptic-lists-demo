// Native room renderer. World owns trial state and the exact combat forecast.
// Conserve usage. Before/after motion depicts edits, not learner statement tracing.
namespace apocView {
    const WIDTH = 576
    const CENTER = 288
    const JOBS = ["Write plan", "Hold threat", "Rewrite", "Append", "Insert Ward", "Delay", "Remove Ward", "Repair last", "Remove first", "Remove last", "Banish first", "Find Ward", "Hold hazards", "Swap power", "Clear Wards", "Build counters", "Use reserve", "Steal power", "Hold one", "Reverse", "Find defense", "Move target", "Find + remove", "Delay", "Repair gaps", "Build recovery", "Hold hazards"]
    const OPS = ["create", "get", "set", "append", "insert", "prepend", "remove", "length", "remove", "remove", "remove", "find", "foreach", "swap", "foreach", "build", "transfer", "transfer", "get", "reverse", "find", "transfer", "find", "order", "foreach", "build", "foreach"]
    const MENU = ["Use first altar", "Use second altar", "Release time", "Reset this attempt", "Retry this setup", "Try another setup", "Continue through the gate", "Revisit an unlocked room", "Altar help + room strategy", "Reset saved progress", "Animation speed"]
    const MOVES = ["Strike", "Flurry", "Mend", "Ward", "Venom", "Reap", "Empower", "Wait"]
    let moveIcons: Image[] = []
    let actorRefs: Sprite[] = []
    let portraits: Image[] = []
    let bodies: Image[] = []
    let pandaFrames: Image[] = []
    let props: Image[] = []
    let digits: Image[] = []
    let floor: Image = null
    let pads: Image[] = []
    let allPortrait: Image = null
    let unknown: Image = null
    let ready = false
    let cachedRoom = -1
    let cachedVariant = -1
    let motionStamp = -1
    let motions: CellMotion[] = []
    class CellMotion {
        constructor() {}
        side: number = 0
        part: number = 0 // move, power, target, roster, source
        fromSide: number = 0
        fromPart: number = 0
        merged: boolean = false
        from: number = -1
        to: number = -1
        move: string = ""
        power: number = 0
        target: Sprite = null
    }
    function text(s: string, x: number, y: number, color: number = 1): void { screen.print(s, x, y, color, image.font8) }
    function tiny(s: string, x: number, y: number, color: number = 1): void { screen.print(s, x, y, color, image.font5) }
    function centered(s: string, x: number, y: number, color: number = 1): void { text(s, x - Math.idiv(s.length * 6, 2), y, color) }
    function smallCentered(s: string, x: number, y: number, color: number = 1): void { tiny(s, x - Math.idiv(s.length * 6, 2), y, color) }
    function shortName(s: string): string { return s.substr(0, 2) == "A-" || s.substr(0, 2) == "E-" ? s.substr(2) : s }
    function resize(source: Image, w: number, h: number): Image {
        const out = image.create(w, h)
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out.setPixel(x, y, source.getPixel(Math.idiv(x * source.width, w), Math.idiv(y * source.height, h)))
        return out
    }
    function oval(pic: Image, cx: number, cy: number, rx: number, ry: number, fill: number, edge: number): void {
        for (let y = -ry; y <= ry; y++) {
            const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - y * y / (ry * ry))))
            pic.drawLine(cx - w, cy + y, cx + w, cy + y, fill)
            if (edge) { pic.setPixel(cx - w, cy + y, edge); pic.setPixel(cx + w, cy + y, edge) }
        }
        if (edge) { pic.drawLine(cx - 16, cy - ry, cx + 16, cy - ry, edge); pic.drawLine(cx - 16, cy + ry, cx + 16, cy + ry, edge) }
    }
    function cross(x: number, y: number, r: number, color: number = 2): void {
        for (let d = -1; d <= 1; d++) { screen.drawLine(x - r, y - r + d, x + r, y + r + d, 15); screen.drawLine(x + r, y - r + d, x - r, y + r + d, 15) }
        screen.drawLine(x - r, y - r, x + r, y + r, color); screen.drawLine(x + r, y - r, x - r, y + r, color)
    }
    function init(): void {
        if (ready) return
        ready = true
        for (let i = 0; i < MOVES.length; i++) moveIcons.push(resize(apocArt.move(MOVES[i]), 16, 16))
        for (let i = 0; i < 10; i++) digits.push(apocArt.digit(i))
        const names = ["altar-primary", "altar-secondary", "clock-crystal", "fountain-reset", "exit-gate"]
        for (let i = 0; i < names.length; i++) props.push(apocArt.prop(names[i]))
        props.push(resize(apocArt.move("Wait"), 32, 32))
        for (let d = 0; d < 4; d++) for (let s = -1; s < 3; s++) pandaFrames.push(apocArt.observerFrame(d, s))
        unknown = resize(apocArt.move("?"), 16, 16); allPortrait = resize(apocArt.targetAll(), 24, 24)
        for (let i = 0; i < 3; i++) {
            const pic = image.create(239, 51)
            oval(pic, 119, 26, 118, 24, 15, 0); oval(pic, 119, 24, 117, 24, i == 0 ? 12 : 8, i == 0 ? 11 : i == 1 ? 5 : 9); pads.push(pic)
        }
    }
    function makeFloor(): void {
        floor = image.create(WIDTH, 720); floor.fill(15); floor.fillRect(14, 40, WIDTH - 28, 644, 11)
        for (let y = 40; y < 684; y += 12) {
            floor.drawLine(14, y, WIDTH - 15, y, 15)
            for (let x = 14 + (Math.idiv(y, 12) % 2) * 24; x < WIDTH - 14; x += 48) floor.drawLine(x, y, x, y + 11, 15)
        }
        floor.fillRect(29, 78, WIDTH - 58, 592, 12)
        for (let y = 78; y < 670; y += 32) for (let x = 30; x < WIDTH - 29; x += 32) {
            floor.drawLine(x, y, x + 30, y, 15)
            floor.drawLine(x, y, x, y + 30, 15)
            floor.drawLine(x + 4, y + 23, x + 10, y + 23, 15)
        }
        for (let i = 0; i < 4; i++) {
            const x = i % 2 == 0 ? 116 : WIDTH - 130, y = i < 2 ? 88 : 608
            floor.fillRect(x, y, 14, 5, 11); floor.fillRect(x + 4, y + 5, 17, 4, 15)
        }
        for (let x = 40; x < WIDTH; x += WIDTH - 90) { floor.fillRect(x, 56, 8, 14, 13); floor.fillRect(x + 1, 52, 6, 12, 5); floor.fillRect(x + 3, 49, 2, 9, 1) }
    }
    function actorFor(ref: Sprite, state: apocTypes.TrialSnapshot): apocTypes.ActorState {
        if (state && ref) for (let i = 0; i < state.actors.length; i++) if (state.actors[i].sprite == ref) return state.actors[i]
        return null
    }
    function actorIndex(ref: Sprite): number { return actorRefs.indexOf(ref) }
    function rebuild(state: apocTypes.TrialSnapshot): void {
        cachedRoom = apocWorld.uiRoom(); cachedVariant = apocWorld.uiVariant(); actorRefs = []; portraits = []; bodies = []
        for (let i = 0; i < state.actors.length; i++) {
            const a = state.actors[i], pic = resize(apocArt.largePortrait(a.id, a.side), 28, 31)
            for (let y = 0; y < 31; y++) for (let x = 0; x < 28; x++) if ((x - 13.5) * (x - 13.5) + (y - 15) * (y - 15) > 196) pic.setPixel(x, y, 0)
            actorRefs.push(a.sprite); portraits.push(pic)
            const size = a.id == "E-Boss" || a.id == "E-King" ? 64 : 48
            bodies.push(resize(apocArt.actor(a.id, a.side), size, a.side == apocTypes.Side.Ally ? 54 : size))
        }
        makeFloor()
    }
    function moveIcon(s: string): Image { const i = MOVES.indexOf(s); return i < 0 ? unknown : moveIcons[i] }
    function rowY(row: number): number { return 114 + row * 54 }
    function px(side: number, part: number): number { return part == 2 ? (side == 0 ? 265 : 311) : part == 1 ? (side == 0 ? 197 : 379) : side == 0 ? 215 : 361 }
    function listLength(t: apocTypes.TrialSnapshot, side: number, part: number): number {
        if (part == 3) return t.roster.length
        if (part == 4) return t.sourceMoves.length
        if (part == 0) return side == 0 ? t.lists.allyMoves.length : t.lists.enemyMoves.length
        if (part == 1) return side == 0 ? t.lists.allyValues.length : t.lists.enemyValues.length
        return side == 0 ? t.lists.allyTargets.length : t.lists.enemyTargets.length
    }
    function equalCell(a: apocTypes.TrialSnapshot, b: apocTypes.TrialSnapshot, side: number, part: number, i: number, j: number): boolean {
        if (part == 3) return a.roster[i] == b.roster[j]
        if (part == 4) return a.sourceMoves[i] == b.sourceMoves[j]
        if (part == 0) return side == 0 ? a.lists.allyMoves[i] == b.lists.allyMoves[j] : a.lists.enemyMoves[i] == b.lists.enemyMoves[j]
        if (part == 1) return side == 0 ? a.lists.allyValues[i] == b.lists.allyValues[j] : a.lists.enemyValues[i] == b.lists.enemyValues[j]
        return side == 0 ? a.lists.allyTargets[i] == b.lists.allyTargets[j] : a.lists.enemyTargets[i] == b.lists.enemyTargets[j]
    }
    function loadMotion(m: CellMotion, state: apocTypes.TrialSnapshot, row: number): void {
        m.fromSide = m.side; m.fromPart = m.part
        if (m.part == 0) m.move = m.side == 0 ? state.lists.allyMoves[row] : state.lists.enemyMoves[row]
        if (m.part == 1) m.power = m.side == 0 ? state.lists.allyValues[row] : state.lists.enemyValues[row]
        if (m.part == 2) m.target = m.side == 0 ? state.lists.allyTargets[row] : state.lists.enemyTargets[row]
        if (m.part == 3) m.target = state.roster[row]
        if (m.part == 4) m.move = state.sourceMoves[row]
    }
    function prepareMotion(): void {
        const stamp = apocWorld.uiEditStarted(), record = apocWorld.uiEditRecord()
        if (stamp == motionStamp || !record) return
        motionStamp = stamp; motions = []
        for (let side = 0; side < 2; side++) for (let part = 0; part < 5; part++) {
            if (side == 1 && part >= 3) continue
            const before = record.before, after = record.after, oldLen = listLength(before, side, part), newLen = listLength(after, side, part)
            let used: boolean[] = [], fixed: boolean[] = []
            for (let i = 0; i < 10; i++) { used.push(false); fixed.push(false) }
            for (let i = 0; i < Math.min(oldLen, newLen); i++) if (equalCell(before, after, side, part, i, i)) { used[i] = true; fixed[i] = true }
            for (let j = 0; j < newLen; j++) {
                if (fixed[j]) continue
                let from = -1, distance = 99
                for (let i = 0; i < oldLen; i++) if (!used[i] && equalCell(before, after, side, part, i, j) && Math.abs(i - j) < distance) { from = i; distance = Math.abs(i - j) }
                if (from >= 0) used[from] = true
                const m = new CellMotion(); m.side = side; m.part = part; m.from = from; m.to = j; loadMotion(m, after, j); motions.push(m)
            }
            for (let i = 0; i < oldLen; i++) if (!used[i]) { const m = new CellMotion(); m.side = side; m.part = part; m.from = i; m.to = -1; loadMotion(m, before, i); motions.push(m) }
        }
        // A returned number, move or Sprite transferred to another list is one
        // traveling piece, rather than an unrelated disappearance/appearance.
        for (let i = 0; i < motions.length; i++) {
            const incoming = motions[i]
            if (incoming.from >= 0 || incoming.to < 0) continue
            for (let j = 0; j < motions.length; j++) {
                const outgoing = motions[j]
                if (outgoing.merged || outgoing.from < 0 || outgoing.to >= 0) continue
                const sameMove = (incoming.part == 0 || incoming.part == 4) && (outgoing.part == 0 || outgoing.part == 4) && incoming.move == outgoing.move
                const sameNumber = incoming.part == 1 && outgoing.part == 1 && incoming.power == outgoing.power
                const sameTarget = (incoming.part == 2 || incoming.part == 3) && (outgoing.part == 2 || outgoing.part == 3) && incoming.target == outgoing.target
                if (sameMove || sameNumber || sameTarget) { incoming.from = outgoing.from; incoming.fromSide = outgoing.side; incoming.fromPart = outgoing.part; outgoing.merged = true; break }
            }
        }
    }
    function target(ref: Sprite, x: number, y: number, side: number, picked: boolean, dead: boolean, held: boolean): void {
        screen.fillCircle(x, y, 16, 15)
        const i = actorIndex(ref)
        if (ref == apocWorld.uiSentinel()) screen.drawTransparentImage(allPortrait, x - 12, y - 12)
        else if (i >= 0) screen.drawTransparentImage(portraits[i], x - 14, y - 15)
        else screen.fillCircle(x, y, 2, 11)
        screen.drawCircle(x, y, 16, ref ? (side == 0 ? 9 : 3) : 11)
        if (picked) screen.drawCircle(x, y, 19, 5)
        if (dead) cross(x, y, 10)
        else if (held) { screen.drawCircle(x, y, 18, 10); tiny("H", x - 2, y - 3, 1) }
    }
    function moveBubble(move: string, x: number, y: number, side: number, picked: boolean, dead: boolean): void {
        screen.fillCircle(x, y, 12, !move ? 15 : side == 0 ? 6 : 14); screen.drawCircle(x, y, 12, picked ? 5 : !move ? 11 : side == 0 ? 9 : 3)
        if (move) screen.drawTransparentImage(moveIcon(move), x - 8, y - 8)
        else screen.fillCircle(x, y, 1, 11)
        if (dead) cross(x, y, 7)
    }
    function powerBubble(power: number, x: number, y: number, side: number, picked: boolean): void {
        screen.fillCircle(x, y, 9, 15); screen.drawCircle(x, y, 9, picked ? 5 : power < 0 ? 11 : side == 0 ? 9 : 3)
        if (power >= 0) screen.drawTransparentImage(digits[Math.constrain(power, 0, 9)], x - 3, y - 4)
    }
    function helpful(move: string): boolean { return move == "Mend" || move == "Ward" || move == "Empower" }
    function chosen(state: apocTypes.TrialSnapshot, side: number, row: number): Sprite {
        const moves = side == 0 ? state.lists.allyMoves : state.lists.enemyMoves
        if (row >= moves.length || !moves[row] || moves[row] == "Wait") return null
        const toSide = helpful(moves[row]) ? side : 1 - side, targets = toSide == 0 ? state.lists.allyTargets : state.lists.enemyTargets
        return row < targets.length ? targets[row] : null
    }
    function route(state: apocTypes.TrialSnapshot, side: number, row: number, now: number): void {
        const ref = chosen(state, side, row)
        if (!ref) return
        const moves = side == 0 ? state.lists.allyMoves : state.lists.enemyMoves, same = helpful(moves[row]), toSide = same ? side : 1 - side
        const y = rowY(row), start = px(side, 0) + (side == 0 ? 12 : -12), tx = px(toSide, 2), sign = side == 0 ? -1 : 1
        const x0 = start, y0 = y + sign * 2, x1 = start + (side == 0 ? 8 : -8), y1 = y + sign * (same ? 7 : 25)
        const x2 = same ? tx + (side == 0 ? -23 : 23) : tx + (side == 0 ? -3 : 3), y2 = y + sign * (same ? 7 : 26)
        const x3 = same ? tx + (side == 0 ? -18 : 18) : tx, y3 = y + sign * (same ? 2 : 18)
        const hovered = apocWorld.uiNearRow() == row && !apocWorld.uiPlaying() && !apocWorld.uiAnimating()
        const dt = (now - apocWorld.uiHoverStarted()) % 3500, progress = Math.constrain((dt - (side == 0 ? 0 : 1150)) / 850, 0, 1)
        let lastX = x0, lastY = y0
        for (let i = 1; i <= 36; i++) {
            const t = i / 36, s = 1 - t, x = s * s * s * x0 + 3 * s * s * t * x1 + 3 * s * t * t * x2 + t * t * t * x3
            const yy = s * s * s * y0 + 3 * s * s * t * y1 + 3 * s * t * t * y2 + t * t * t * y3
            screen.drawLine(lastX, lastY, x, yy, side == 0 ? 6 : 14)
            if (hovered && t <= progress && i % 2 == 0) screen.fillCircle(x, yy, 1, side == 0 ? 9 : 3)
            if (hovered && t <= progress && t + 1 / 36 > progress) screen.fillCircle(x, yy, 2, 1)
            lastX = x; lastY = yy
        }
        if (hovered && progress >= 1) screen.drawCircle(tx, y, 19, side == 0 ? 9 : 3)
    }
    function timeline(state: apocTypes.TrialSnapshot, now: number): void {
        const spec = apocWorld.uiSpec(), near = apocWorld.uiNearRow(), active = apocWorld.uiActiveRow(), activeSide = apocWorld.uiActiveSide()
        for (let row = 0; row < 10; row++) {
            if (apocWorld.uiCombatTimelineActive() && (apocWorld.uiMomentConsumed(row) || (!apocWorld.uiReached(0, row) && !apocWorld.uiReached(1, row)))) continue
            const cy = rowY(row), playing = (apocWorld.uiPlaying() || apocWorld.uiPreview()) && active == row
            screen.drawTransparentImage(pads[playing ? 2 : near == row ? 1 : 0], CENTER - 119, cy - 24)
            if (!apocWorld.uiPlaying() && !apocWorld.uiPreview() && !apocWorld.uiCombatTimelineActive()) { route(state, 0, row, now); route(state, 1, row, now) }
            const aftermath = apocWorld.uiAfter(apocTypes.Side.Enemy, row) || apocWorld.uiAfter(apocTypes.Side.Ally, row) || apocWorld.uiTerminal()
            for (let side = 0; side < 2; side++) {
                const selected = apocWorld.uiSelectedRow() == row && apocWorld.uiSelectedSide() == side
                const marked = (apocWorld.uiRoom() == 14 && (row == 0 || row == 3)) || spec.primaryIndex == row || spec.secondaryIndex == row
                const targets = side == 0 ? state.lists.allyTargets : state.lists.enemyTargets, ref = row < targets.length ? targets[row] : null
                const a = actorFor(ref, aftermath || state), moves = side == 0 ? state.lists.allyMoves : state.lists.enemyMoves, values = side == 0 ? state.lists.allyValues : state.lists.enemyValues
                const move = row < moves.length ? moves[row] : "", before = apocWorld.uiBefore(side, row) || apocWorld.uiTerminal()
                let owner = actorFor(apocWorld.uiActionActor(side, row), before)
                if (!owner && before) for (let n = 0; n < before.actors.length; n++) if (before.actors[n].side == side && before.actors[n].ability == move) owner = before.actors[n]
                if (!activatingCell(side, 2, row, now)) target(ref, px(side, 2), cy, side, selected, !!a && (!a.present || a.hp <= 0), !!a && a.held)
                const consumed = !apocWorld.uiPreview() && apocWorld.uiCombatConsumed(side, row)
                const casting = playing && activeSide == side && !apocWorld.uiCombatSkipped()
                if (!consumed && !(casting && apocWorld.uiCombatProgress() >= .22) && !activatingCell(side, 0, row, now)) moveBubble(move, px(side, 0), cy, side, selected || marked, !!owner && (owner.hp <= 0 || !owner.present || owner.held))
                if (!consumed && !casting && !activatingCell(side, 1, row, now)) powerBubble(row < values.length ? values[row] : -1, px(side, 1), cy, side, marked)
                if (playing && activeSide == side && !consumed && (!casting || apocWorld.uiCombatProgress() < .22)) { screen.drawCircle(px(side, 0), cy, 15, 5); screen.fillCircle(px(side, 0), cy - 19, 2, 5) }
            }
        }
    }
    function actorX(side: number): number { return side == 0 ? 62 : WIDTH - 62 }
    function actorY(ref: Sprite, state: apocTypes.TrialSnapshot): number {
        const a = actorFor(ref, state)
        if (!a) return 300
        let pos = 0, count = 0
        for (let i = 0; i < state.actors.length; i++) if (state.actors[i].side == a.side) { if (state.actors[i].sprite == ref) pos = count; count++ }
        return count <= 1 ? 340 : 170 + pos * Math.idiv(370, count - 1)
    }
    function focusSide(now: number): number { return apocWorld.uiPlaying() ? apocWorld.uiActiveSide() : (now - apocWorld.uiHoverStarted()) % 3500 < 1150 ? 0 : 1 }
    function party(state: apocTypes.TrialSnapshot, now: number): void {
        smallCentered("ALLIES", 62, 119, 9); smallCentered("ENEMIES", WIDTH - 62, 119, 3)
        const combat = apocWorld.uiPlaying() || apocWorld.uiPreview()
        const row = combat ? apocWorld.uiActiveRow() : apocWorld.uiNearRow(), side = combat ? apocWorld.uiActiveSide() : focusSide(now)
        const events = row >= 0 ? apocWorld.uiActionEvents(side, row) : [], phase = apocWorld.uiPhase()
        let event: apocTypes.TraceEvent = null
        for (let i = 0; i < events.length; i++) if (events[i].kind == "action") { event = events[i]; break }
        const source = row >= 0 ? apocWorld.uiActionActor(side, row) : null, recipient = row >= 0 ? chosen(apocWorld.uiTrial(), side, row) : null
        for (let i = 0; i < state.actors.length; i++) {
            const a = state.actors[i], k = actorIndex(a.sprite), body = k < 0 ? unknown : bodies[k]
            let x = actorX(a.side), y = actorY(a.sprite, state)
            if (activatingActor(a.sprite, now)) {
                const dt = now - motionStamp, lift = Math.sin(dt / apocWorld.uiEditActivationDuration() * Math.PI)
                x += Math.sin(dt / 19) * 2 * lift; y -= lift * 5
                screen.drawCircle(x, y, Math.idiv(body.height, 2) + 7, 5)
                screen.drawCircle(x, y, Math.idiv(body.height, 2) + 10 + Math.sin(dt / 55) * 2, 1)
            }
            const charged = combat && !apocWorld.uiCombatSkipped() && source == a.sprite && phase >= .48 && phase < .86
            let receiving = !combat && recipient == a.sprite
            if (combat && phase >= .5) for (let e = 0; e < events.length; e++) if (events[e].kind == "action" && events[e].target == a.sprite) receiving = true
            if (charged) {
                const pulse = Math.sin(phase * Math.PI * 20) * 2
                screen.drawCircle(x, y, Math.idiv(body.height, 2) + 7 + pulse, 5)
                screen.drawCircle(x, y, Math.idiv(body.height, 2) + 11, a.side == 0 ? 9 : 3)
            }
            if (combat && event && event.actor == a.sprite && phase >= .5 && phase < .8) x += (a.side == 0 ? 1 : -1) * Math.sin((phase - .5) / .3 * Math.PI) * 8
            oval(screen, x, y + body.height / 2, 23, 6, 15, receiving ? 5 : 0)
            if (receiving) screen.drawCircle(x, y, Math.idiv(body.height, 2) + 6, event && helpful(event.move) ? 7 : 5)
            if (a.present) screen.drawTransparentImage(body, x - body.width / 2, y - body.height / 2)
            if (!a.present || a.hp <= 0) cross(x, y, 19)
            smallCentered(shortName(a.id).toUpperCase(), x, y - body.height / 2 - 12, 1)
            const hpY = y + body.height / 2 + 8
            screen.fillRect(x - 24, hpY, 48, 4, 15); screen.fillRect(x - 24, hpY, Math.idiv(48 * a.hp, a.maxHP), 4, a.side == 0 ? 9 : 2)
            smallCentered(a.hp + "/" + a.maxHP, x, hpY + 7, 1)
            moveBubble(a.ability, x + (a.side == 0 ? 1 : -1) * (body.width / 2 + 14), y, a.side, combat ? charged : source == a.sprite, false)
            if (a.ward) screen.drawTransparentImage(moveIcon("Ward"), x + 23, y - 25)
            if (a.venom) screen.drawTransparentImage(moveIcon("Venom"), x + 23, y - 7)
            if (a.empower) screen.drawTransparentImage(moveIcon("Empower"), x + 23, y + 11)
            if (a.held) { screen.drawCircle(x, y, 30, 10); smallCentered("HELD", x, y + 13, 1) }
            if (a.trait != "Plain") smallCentered(a.trait, x, hpY + 19, 11)
        }
    }
    export function stationLabel(i: number): string { return i == 0 ? JOBS[apocWorld.uiRoom() - 1] : i == 1 ? (apocWorld.uiRoom() == 24 ? "Rewrite" : "Clear Wards") : i == 2 ? "Release time" : i == 3 ? "Reset" : i == 5 ? "Speed " + apocWorld.uiSpeedLabel() : "Exit" }
    export function stationIcon(i: number): string { return i == 0 ? OPS[apocWorld.uiRoom() - 1] : i == 1 ? "set" : i == 2 ? "run" : i == 3 ? "reset" : i == 5 ? "speed" : "exit" }
    function stations(now: number): void {
        const xs = [86, 490, 288, 82, 288, 490], ys = [650, 650, 66, 84, 664, 84], spec = apocWorld.uiSpec(), suggested = apocWorld.uiSuggestedStation()
        for (let i = 0; i < 6; i++) {
            if (i == 1 && !spec.twoStations) continue
            const x = xs[i], y = ys[i], near = apocWorld.uiNearStation() == i, glow = i == suggested
            if (glow || near) oval(screen, x, y + 6, i == 2 ? 28 : 24, 8, 8, now % 900 < 550 ? 5 : 11)
            screen.drawTransparentImage(props[i], x - 16, y - 28 + (i == 2 ? Math.sin(now / 340) * 2 : 0))
            if (i == 5) smallCentered("ANIMATION", x, 46, 11)
            smallCentered(stationLabel(i), x, y + (i == 2 ? 12 : 14), glow || near ? 5 : 1)
        }
        const forecast = apocWorld.uiForecast(), outcome = forecast ? forecast.status : "invalid"
        const label = outcome == "victory" ? "VICTORY" : outcome == "defeat" ? "DEFEAT" : outcome == "incomplete" ? "ENEMIES REMAIN" : "REPAIR PLAN"
        screen.fillRect(CENTER - 95, 628, 190, 15, 15); smallCentered("FORECAST: " + label, CENTER, 633, outcome == "victory" ? 9 : 3)
    }
    function sources(state: apocTypes.TrialSnapshot, now: number): void {
        if (state.roster.length) {
            smallCentered("ROSTER", 143, 139, 9)
            for (let i = 0; i < state.roster.length; i++) {
                if (activatingCell(0, 3, i, now)) continue
                const x = 143, y = 180 + i * 40, k = actorIndex(state.roster[i]), a = actorFor(state.roster[i], state)
                if (k >= 0) screen.drawTransparentImage(portraits[k], x - 14, y - 15)
                screen.drawCircle(x, y, 16, a && a.held ? 10 : 11); if (a && !a.present) cross(x, y, 10)
            }
        } else if (state.sourceMoves.length) {
            smallCentered(apocWorld.uiRoom() == 17 ? "RESERVE" : "SOURCE", 143, 139, 9)
            for (let i = 0; i < state.sourceMoves.length; i++) if (!activatingCell(0, 4, i, now)) moveBubble(state.sourceMoves[i], 143, 180 + i * 40, 0, false, false)
        }
    }
    function activating(now: number): boolean { return !!apocWorld.uiEditRecord() && now >= motionStamp && now < motionStamp + apocWorld.uiEditActivationDuration() }
    function activatingCell(side: number, part: number, row: number, now: number): boolean {
        if (!activating(now)) return false
        for (let i = 0; i < motions.length; i++) {
            const m = motions[i]
            if (!m.merged && m.from >= 0 && m.fromSide == side && m.fromPart == part && m.from == row) return true
        }
        return false
    }
    function activatingActor(ref: Sprite, now: number): boolean {
        if (!activating(now)) return false
        const effects = apocWorld.uiEditRecord().effects
        for (let i = 0; i < effects.length; i++) if (effects[i].actor == ref) return true
        return false
    }
    function editActivation(now: number): void {
        const dt = now - motionStamp, lift = Math.sin(dt / apocWorld.uiEditActivationDuration() * Math.PI)
        for (let i = 0; i < motions.length; i++) {
            const m = motions[i]
            if (m.merged) continue
            const baseX = m.fromPart >= 3 ? 143 : px(m.fromSide, m.fromPart)
            const baseY = m.from >= 0 ? (m.fromPart >= 3 ? 180 + m.from * 40 : rowY(m.from)) : 650
            const x = baseX + Math.sin(dt / 19) * 2 * lift, y = baseY - lift * 5
            const radius = m.fromPart == 2 || m.fromPart == 3 ? 20 : m.fromPart == 1 ? 12 : 15
            screen.drawCircle(x, y, radius + 3 + Math.sin(dt / 55) * 2, 5)
            screen.drawCircle(x, y, radius + 6, 1)
            if (m.part == 0 || m.part == 4) moveBubble(m.move, x, y, m.fromSide, true, false)
            else if (m.part == 1) powerBubble(m.power, x, y, m.fromSide, true)
            else target(m.target, x, y, m.fromSide, true, false, false)
        }
    }
    function editAnimation(now: number): void {
        const dt = now - motionStamp, duration = apocWorld.uiEditDuration()
        if (dt < 0 || dt >= duration) return
        const opening = apocWorld.uiEditActivationDuration() + apocWorld.uiEditFizzleDuration()
        const t = Math.constrain((dt - opening - 60) / (duration - opening - 160), 0, 1), q = t * t * (3 - 2 * t)
        for (let i = 0; i < motions.length; i++) {
            const m = motions[i]
            if (m.merged) continue
            const startY = m.from >= 0 ? (m.fromPart >= 3 ? 180 + m.from * 40 : rowY(m.from)) : 650
            const endY = m.to >= 0 ? (m.part >= 3 ? 180 + m.to * 40 : rowY(m.to)) : 650
            const startX = m.fromPart >= 3 ? 143 : px(m.fromSide, m.fromPart), endX = m.part >= 3 ? 143 : px(m.side, m.part)
            const bend = m.from < 0 || m.to < 0 ? 60 : m.from < m.to ? 21 : 65
            const x = startX + (endX - startX) * q + (m.side == 0 ? -1 : 1) * Math.sin(q * Math.PI) * bend, y = startY + (endY - startY) * q
            screen.drawCircle(x, y, m.part == 2 || m.part == 3 ? 20 : 13, 5)
            if (m.part == 0 || m.part == 4) moveBubble(m.move, x, y, m.side, true, false)
            else if (m.part == 1) powerBubble(m.power, x, y, m.side, true)
            else target(m.target, x, y, m.side, false, false, false)
        }
        const record = apocWorld.uiEditRecord()
        if (!record) return
        for (let i = 0; i < record.effects.length; i++) {
            const effect = record.effects[i], a = actorFor(effect.actor, record.before), index = actorIndex(effect.actor)
            if (!a || index < 0) continue
            const body = bodies[index], x = actorX(a.side), y = actorY(effect.actor, record.before) - Math.sin(q * Math.PI) * 16
            screen.drawTransparentImage(body, x - body.width / 2, y - body.height / 2)
            if (effect.kind == "hold") {
                screen.drawCircle(x, y, 30, 10); screen.drawCircle(x, y, 34, 9)
                for (let bar = -2; bar <= 2; bar++) screen.drawLine(x + bar * 10, y - 25, x + bar * 10, y + 25, 10)
            } else {
                const gone = Math.floor(body.height * q)
                for (let line = 0; line < gone; line++) screen.drawLine(x - body.width / 2, y + body.height / 2 - line, x + body.width / 2, y + body.height / 2 - line, 12)
                screen.drawLine(x - 29, y + body.height / 2 - gone, x + 29, y + body.height / 2 - gone, 9)
            }
        }
    }
    function combatAnimation(state: apocTypes.TrialSnapshot): void {
        if (!apocWorld.uiPlaying() && !apocWorld.uiPreview()) return
        const row = apocWorld.uiActiveRow(), side = apocWorld.uiActiveSide(), phase = apocWorld.uiCombatProgress(), events = apocWorld.uiActionEvents(side, row)
        const before = apocWorld.uiBefore(side, row) || state, cy = rowY(row), mx = px(side, 0), nx = px(side, 1)
        const values = side == 0 ? before.lists.allyValues : before.lists.enemyValues
        let action: apocTypes.TraceEvent = null
        for (let i = 0; i < events.length; i++) if (events[i].kind == "action") { action = events[i]; break }
        if (!apocWorld.uiCombatSkipped() && action) {
            const actor = actorFor(action.actor, before), power = row < values.length ? values[row] : 0
            if (actor) {
                const sx = actorX(actor.side), sy = actorY(actor.sprite, before), color = side == 0 ? 9 : 3
                if (phase < .22) {
                    const t = Math.constrain(phase / .22, 0, 1), q = t * t * (3 - 2 * t)
                    powerBubble(power, nx + (mx - nx) * q, cy - Math.sin(q * Math.PI) * 10, side, true)
                    screen.drawCircle(mx, cy, 14 + q * 5, 5)
                    screen.drawCircle(mx, cy, 17 + Math.sin(q * Math.PI) * 4, color)
                } else if (phase < .5) {
                    const t = Math.constrain((phase - .22) / .28, 0, 1), q = t * t * (3 - 2 * t)
                    const x = mx + (sx - mx) * q, y = cy + (sy - cy) * q - Math.sin(q * Math.PI) * 24
                    screen.drawCircle(x, y, 16, color); screen.drawCircle(x, y, 19 + Math.sin(t * Math.PI * 4) * 2, 5)
                    moveBubble(action.move, x, y, side, true, false)
                    for (let k = 0; k < 3; k++) { const angle = t * 8 + k * Math.PI * 2 / 3; screen.fillCircle(x + Math.cos(angle) * 17, y + Math.sin(angle) * 17, 1, color) }
                } else if (phase < .8) {
                    const p = Math.constrain((phase - .5) / .3, 0, 1)
                    for (let i = 0; i < events.length; i++) {
                        const e = events[i]
                        if (e.kind != "action" || !e.target) continue
                        const recipient = actorFor(e.target, before)
                        if (!recipient) continue
                        const tx = actorX(recipient.side), ty = actorY(e.target, before)
                        // One real recipient per action event; ALL visibly branches
                        // to its actual recipients. A self-cast makes a small orbit.
                        const x = sx + (tx - sx) * p + (e.target == e.actor ? Math.sin(p * Math.PI * 2) * 22 : 0)
                        const y = sy + (ty - sy) * p - Math.sin(p * Math.PI) * (e.target == e.actor ? 36 : 24)
                        const effectColor = helpful(e.move) ? 7 : color
                        screen.fillCircle(x, y, 10, 15); screen.drawCircle(x, y, 11, effectColor)
                        screen.drawTransparentImage(moveIcon(e.move), x - 8, y - 8)
                        for (let k = 1; k < 4; k++) { const tail = Math.max(0, p - k * .035); screen.fillCircle(sx + (tx - sx) * tail, sy + (ty - sy) * tail - Math.sin(tail * Math.PI) * 24, 1, effectColor) }
                    }
                }
            }
        } else if (phase < .8) {
            // An inactive owner, dead target or Wait never invents a cast.
            screen.drawCircle(mx, cy, 16, 11); cross(mx, cy, 9, 11)
            smallCentered("NO ACTION", side == 0 ? 220 : 356, cy + 19, 11)
        }
        if (phase < .8 || phase >= 1) return
        const impact = Math.constrain((phase - .8) / .2, 0, 1)
        for (let i = 0; i < events.length; i++) {
            const e = events[i], recipient = actorFor(e.target, before)
            if (!recipient) continue
            const tx = actorX(recipient.side), ty = actorY(e.target, before)
            if (e.kind == "action" || e.kind == "venom-tick") {
                const color = helpful(e.move) ? 7 : e.move == "Venom" ? 10 : 5
                screen.drawCircle(tx, ty, 15 + impact * 16, color)
                for (let k = 0; k < 6; k++) { const angle = k * Math.PI / 3 + impact; screen.fillCircle(tx + Math.cos(angle) * (12 + impact * 21), ty + Math.sin(angle) * (12 + impact * 21), 2, color) }
            }
            if (e.kind == "damage" || e.kind == "heal" || e.kind == "leech") {
                let amount = e.amount, first = true
                for (let j = 0; j < i; j++) if (events[j].kind == e.kind && events[j].target == e.target) first = false
                if (!first) continue
                for (let j = i + 1; j < events.length; j++) if (events[j].kind == e.kind && events[j].target == e.target) amount += events[j].amount
                centered((e.kind == "damage" ? "-" : "+") + amount, tx, ty - 38 - impact * 12, e.kind == "damage" ? 5 : 7)
            }
        }
    }
    function editVeil(now: number): void {
        // Opaque temporal mist, not a black screen or a dimmed room. Only the
        // affected pieces are drawn over it during the isolated travel phase.
        screen.fill(12)
        for (let i = 0; i < 20; i++) {
            const y = (i * 37 + Math.idiv(now, 35)) % 720, x = (i * 83 + Math.idiv(now, 50) * 3) % WIDTH
            screen.drawLine(x, y, Math.min(WIDTH - 1, x + 15 + i % 4 * 8), y, i % 3 == 0 ? 6 : 11)
            screen.setPixel((x + 160) % WIDTH, (y + 230) % 720, 9)
        }
    }
    function screenFizzle(now: number, covered: number): void {
        const threshold = Math.constrain(covered, 0, 1) * 31, seed = Math.idiv(now, 27)
        for (let y = 0; y < 720; y += 16) for (let x = 0; x < WIDTH; x += 16) {
            const noise = (Math.idiv(x, 16) * 13 + Math.idiv(y, 16) * 7 + seed * 3) % 31
            if (noise < threshold) {
                screen.fillRect(x, y, 16, 16, 12)
                if ((noise + seed) % 5 == 0) screen.drawLine(x, y + 3, x + 15, y + 3, noise % 2 == 0 ? 9 : 11)
            }
        }
        for (let i = 0; i < 14; i++) {
            const y = (i * 53 + seed * 11) % 720, x = (i * 97 + seed * 17) % WIDTH
            screen.drawLine(x, y, Math.min(WIDTH - 1, x + 16 + i % 4 * 8), y, i % 2 == 0 ? 9 : 1)
        }
    }
    function wrap(s: string, x: number, y: number, width: number, color: number = 1): number {
        let rest = s
        while (rest.length > 0) {
            let cut = Math.min(rest.length, Math.idiv(width, 6))
            if (cut < rest.length) { let i = cut; while (i > cut - 18 && rest.charAt(i) != " ") i--; if (i > cut - 18) cut = i }
            text(rest.substr(0, cut), x, y, color); y += 14; rest = rest.substr(cut); while (rest.charAt(0) == " ") rest = rest.substr(1)
        }
        return y
    }
    function menu(): void {
        screen.fillRect(64, 112, WIDTH - 128, 470, 15); screen.drawRect(64, 112, WIDTH - 128, 470, 5)
        if (apocWorld.uiEraseConfirm()) { centered("Reset saved expedition progress?", CENTER, 235, 2); centered("A confirm    B keep progress", CENTER, 270, 1); return }
        if (apocWorld.uiPicking()) { centered("Revisit an unlocked room", CENTER, 174, 9); centered("Room " + apocWorld.uiPickRoom(), CENTER, 230, 5); centered("Left/Right choose. A travel. B back.", CENTER, 278, 1); return }
        if (apocWorld.uiHelp()) {
            const page = apocWorld.uiHelpPage(), pages = apocWorld.uiHelpPages(), strategy = page == pages - 1
            centered("ROOM " + apocWorld.uiRoom() + (strategy ? " STRATEGY" : page == 0 ? " FIRST ALTAR" : " SECOND ALTAR"), CENTER, 134, 9)
            if (strategy) {
                let y = wrap(apocWorld.uiSpec().instruction, 83, 174, 408)
                text("IF YOU NEED IT, HERE IS A STRATEGY", 83, y + 20, 5)
                y = wrap(apocAdvice.text(apocWorld.uiRoom(), apocWorld.uiVariant()), 83, y + 45, 408)
                wrap("A at an altar runs your code. The top crystal releases time. B beside a moment watches that action; B beside an altar explains its job. A at the hourglass changes animation speed.", 83, y + 24, 408, 11)
            } else {
                const station = page + 1
                centered("HOW THIS LIST OPERATION WORKS", CENTER, 156, 5)
                let y = wrap(apocAdvice.operation(apocWorld.uiRoom(), station), 83, 190, 408, 5)
                y = wrap(apocAdvice.explain(apocWorld.uiRoom(), station), 83, y + 24, 408)
                if (apocWorld.uiRoom() == 1) text("Leading Waits in this setup: " + apocWorld.uiSpec().numberHint, 83, y + 22, 9)
            }
            centered("PAGE " + (page + 1) + " / " + pages, CENTER, 515, 11)
            centered("Left/Right pages    B returns", CENTER, 547, 9); return
        }
        centered("EXPEDITION MENU", CENTER, 132, 9)
        const progress = apocWorld.uiProgress(), spec = apocWorld.uiSpec()
        for (let i = 0; i < MENU.length; i++) {
            const y = 168 + i * 29, locked = (i == 1 && !spec.twoStations) || (i == 6 && (progress.completedMask & (1 << (apocWorld.uiRoom() - 1))) == 0)
            if (i == apocWorld.uiMenuIndex()) screen.fillRect(76, y - 5, WIDTH - 152, 23, 8)
            text((i == apocWorld.uiMenuIndex() ? "> " : "  ") + (i == 10 ? "Animation speed: " + apocWorld.uiSpeedLabel() : MENU[i]), 86, y, locked ? 11 : 1)
        }
        centered("A choose    B close", CENTER, 482, 9)
        for (let i = 0; i < apocArt.creditCount(); i++) tiny(apocArt.creditLine(i), 83, 515 + i * 13, 11)
    }
    function footer(now: number): void {
        screen.fillRect(14, 690, WIDTH - 28, 25, 15)
        let s = apocWorld.uiNotice(), row = apocWorld.uiNearRow(), side = apocWorld.uiNearSide()
        let controls = "Arrows walk | A select/use | B watch/help/menu | X = fallen by this moment"
        if (!apocWorld.uiPlaying() && !apocWorld.uiAnimating() && row >= 0) {
            const t = apocWorld.uiTrial(), moves = side == 0 ? t.lists.allyMoves : t.lists.enemyMoves, values = side == 0 ? t.lists.allyValues : t.lists.enemyValues
            const ref = chosen(t, side, row), a = actorFor(ref, t)
            s = "A select | B watch: " + (row < moves.length ? moves[row] : "No move") + " " + (row < values.length ? "" + values[row] : "") + " > " + (ref == apocWorld.uiSentinel() ? "ALL" : a ? shortName(a.id) : "nothing")
        }
        if (apocWorld.uiPlaying() || apocWorld.uiPreview()) {
            const side = apocWorld.uiActiveSide(), row = apocWorld.uiActiveRow(), before = apocWorld.uiBefore(side, row), actor = actorFor(apocWorld.uiActionActor(side, row), before)
            const moves = side == 0 ? tMoves(before, 0) : tMoves(before, 1), move = row < moves.length ? moves[row] : "No move", phase = apocWorld.uiCombatProgress()
            s = apocWorld.uiCombatSkipped() ? "No action: " + apocWorld.uiSkipReason(side, row) : phase < .22 ? "The number charges " + move + "." : phase < .5 ? move + " travels to " + (actor ? shortName(actor.id) : "its actor") + "." : phase < .8 ? (actor ? shortName(actor.id) : "The actor") + " sends " + move + " to its target." : "The effect lands. This action is spent."
        } else if (apocWorld.uiAnimating()) s = activating(now) ? "These glowing pieces are about to move." : now - apocWorld.uiEditStarted() < apocWorld.uiEditDuration() ? "The changed pieces travel to their new positions." : "The room returns with the new future already resolved."
        if (!apocWorld.uiAnimating() && !apocWorld.uiHelp() && !apocWorld.uiPicking() && !apocWorld.uiEraseConfirm()) {
            const near = apocWorld.uiNearStation(), suggested = apocWorld.uiSuggestedStation(), menu = apocWorld.uiMenu()
            let station = -1
            if (menu && apocWorld.uiMenuIndex() <= 1 && (apocWorld.uiMenuIndex() == 0 || apocWorld.uiSpec().twoStations)) station = apocWorld.uiMenuIndex()
            else if (!menu && (near == 0 || near == 1)) station = near
            else if (!menu && near < 0 && row < 0 && (suggested == 0 || suggested == 1)) station = suggested
            if (station >= 0) {
                s = apocAdvice.operation(apocWorld.uiRoom(), station + 1)
                controls = menu ? "A runs your altar code | B closes menu | Altar help is also in this menu" : near == station ? "A runs your altar code | B explains this list operation | Arrows walk" : "At the glowing altar: A use code, B explanation | B here opens the menu"
                if (apocWorld.uiRoom() == 1) controls = "Leading Waits: " + apocWorld.uiSpec().numberHint + ". " + (menu ? "A use code | B close menu | Choose Altar help for steps" : near == station ? "A use code | B explains the operation" : "Approach the altar: A use code, B explanation")
            }
            if (near == 5 || (menu && apocWorld.uiMenuIndex() == 10)) {
                s = "Animation speed: " + apocWorld.uiSpeedLabel() + ". Cycle 0.5x > 1x > 2x > 4x."
                controls = menu ? "A changes animation speed | B closes menu | Walking speed stays the same" : "A changes animation speed | B opens menu | Set it before releasing time"
            }
        }
        if (apocWorld.uiHelp()) controls = "Left/Right turn the help pages | B returns | Reading does not use the altar"
        if (s.length > 89) s = s.substr(0, 86) + "..."
        tiny(s, 23, 695, apocWorld.uiPlaying() ? 5 : 1)
        tiny(controls, 23, 706, 11)
    }
    function tMoves(state: apocTypes.TrialSnapshot, side: number): string[] { return !state ? [] : side == 0 ? state.lists.allyMoves : state.lists.enemyMoves }
    export function draw(): void {
        init()
        const state = apocWorld.uiTrial(), spec = apocWorld.uiSpec(), now = apocWorld.uiAnimationTime()
        if (!state || !spec) { screen.fill(15); text("Preparing the expedition...", 160, 330, 1); return }
        if (cachedRoom != apocWorld.uiRoom() || cachedVariant != apocWorld.uiVariant() || actorRefs[0] != state.actors[0].sprite) rebuild(state)
        prepareMotion()
        const dt = now - apocWorld.uiEditStarted(), activation = apocWorld.uiEditActivationDuration(), opening = activation + apocWorld.uiEditFizzleDuration(), travelEnd = apocWorld.uiEditDuration(), reveal = apocWorld.uiEditRevealDuration(), record = apocWorld.uiEditRecord()
        if (record && dt >= opening && dt < travelEnd) { editVeil(now); editAnimation(now); return }
        const openingEdit = !!record && dt >= 0 && dt < opening
        const scene = openingEdit ? record.before : state
        screen.drawImage(floor, 0, 0); text("APOCALYPTIC LISTS", 16, 9, 5); tiny("A future held outside time", 16, 25, 1)
        const label = "ROOM " + apocWorld.uiRoom() + " / 27  |  SETUP " + apocWorld.uiVariant()
        tiny(label, WIDTH - label.length * 6 - 16, 10, 9)
        smallCentered(apocWorld.uiPlaying() ? "TIME IN MOTION" : apocWorld.uiAnimating() ? "FUTURE CHANGING" : "TIME IS FROZEN", WIDTH - 77, 26, apocWorld.uiPlaying() ? 5 : 11)
        timeline(scene, now); party(openingEdit ? scene : apocWorld.uiDisplay() || state, now); sources(scene, now); stations(now)
        const step = apocWorld.uiStep(), frame = pandaFrames[apocWorld.uiDirection() * 4 + (step < 0 ? 0 : step % 3 + 1)], x = apocWorld.uiObserverX(), y = apocWorld.uiObserverY()
        oval(screen, x, y + 2, 9, 3, 15, 0); screen.drawTransparentImage(frame, x - 16, y - 30); smallCentered("YOU", x, y - 40, 1)
        combatAnimation(apocWorld.uiDisplay() || state); footer(now)
        if (openingEdit && dt < activation) editActivation(now)
        else if (openingEdit) { screenFizzle(now, (dt - activation) / apocWorld.uiEditFizzleDuration()); editAnimation(now) }
        else if (record && dt >= travelEnd && dt < travelEnd + reveal) screenFizzle(now, 1 - (dt - travelEnd) / reveal)
        if (apocWorld.uiMenu() || apocWorld.uiPicking() || apocWorld.uiEraseConfirm() || apocWorld.uiHelp()) menu()
    }
}

// OWNER VISUAL REVIEW ONLY: reference callbacks and open room navigation.
// This main is never installed as the canonical learner starter.
// CUMULATIVE INSTRUCTIONAL REFERENCE ONLY; never automatically install as learner code.
// World progress belongs to supplied world settings; behavior belongs to the currently edited program.

apocalypse.onInteract(apocTypes.Room.R01, apocTypes.Station.Primary, function () {
    let allyMoves: string[] = []
    allyMoves = []
    for (let i = 0; i <= apocalypse.numberHint() - 1; i++) {
        allyMoves.push("Wait")
    }
    allyMoves.push("Ward")
    allyMoves.push("Mend")
    allyMoves.push("Strike")
    allyMoves.push("Strike")
    apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
})

apocalypse.onInteract(apocTypes.Room.R02, apocTypes.Station.Primary, function () {
    let hazardRoster: Sprite[] = apocalypse.roster()
    let marked = apocalypse.markedIndex()
    if (marked >= 0 && marked < hazardRoster.length) {
        let selected: Sprite = hazardRoster[marked]
        apocalypse.hold(selected)
    }
})

apocalypse.onInteract(apocTypes.Room.R03, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let marked = apocalypse.markedIndex()
    if (marked >= 0 && marked < enemyMoves.length) {
        enemyMoves[marked] = "Wait"
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R04, apocTypes.Station.Primary, function () {
    let allyMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    allyMoves.push("Strike")
    apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
})

apocalypse.onInteract(apocTypes.Room.R05, apocTypes.Station.Primary, function () {
    let allyMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    allyMoves.insertAt(apocalypse.markedIndex(), "Ward")
    apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
})

apocalypse.onInteract(apocTypes.Room.R06, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.unshift("Wait")
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R07, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let marked = apocalypse.markedIndex()
    if (marked >= 0 && marked < enemyMoves.length) {
        enemyMoves.removeAt(marked)
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R08, apocTypes.Station.Primary, function () {
    let allyMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    if (allyMoves.length > 0) {
        allyMoves[allyMoves.length - 1] = "Strike"
        apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R09, apocTypes.Station.Primary, function () {
    let allyMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    allyMoves.shift()
    apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
})

apocalypse.onInteract(apocTypes.Room.R10, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.pop()
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R11, apocTypes.Station.Primary, function () {
    let hazardRoster: Sprite[] = apocalypse.roster()
    if (hazardRoster.length > 0) {
        let removed: Sprite = hazardRoster.shift()
        apocalypse.setRoster(hazardRoster)
        apocalypse.banish(removed)
    }
})

apocalypse.onInteract(apocTypes.Room.R12, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let found = enemyMoves.indexOf("Ward")
    if (found >= 0) {
        enemyMoves[found] = "Wait"
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R13, apocTypes.Station.Primary, function () {
    let hazardRoster: Sprite[] = apocalypse.roster()
    for (let actor of hazardRoster) {
        apocalypse.hold(actor)
    }
})

apocalypse.onInteract(apocTypes.Room.R14, apocTypes.Station.Primary, function () {
    let allyValues: number[] = apocalypse.values(apocTypes.Side.Ally)
    let savedNumber = allyValues[0]
    allyValues[0] = allyValues[3]
    allyValues[3] = savedNumber
    apocalypse.setValues(apocTypes.Side.Ally, allyValues)
})

apocalypse.onInteract(apocTypes.Room.R15, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    for (let i = 0; i <= enemyMoves.length - 1; i++) {
        if (enemyMoves[i] == "Ward") {
            enemyMoves[i] = "Wait"
        }
    }
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R16, apocTypes.Station.Primary, function () {
    let sourceMoves: string[] = apocalypse.sourceMoves()
    let allyMoves: string[] = []
    allyMoves = []
    for (let move of sourceMoves) {
        if (move == "Strike") {
            allyMoves.push("Ward")
        } else {
            allyMoves.push("Strike")
        }
    }
    apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
})

apocalypse.onInteract(apocTypes.Room.R17, apocTypes.Station.Primary, function () {
    let sourceMoves: string[] = apocalypse.sourceMoves()
    let allyMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    if (sourceMoves.length > 0) {
        let removed: string = sourceMoves.pop()
        apocalypse.setSourceMoves(sourceMoves)
        allyMoves.push(removed)
        apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R18, apocTypes.Station.Primary, function () {
    let enemyValues: number[] = apocalypse.values(apocTypes.Side.Enemy)
    let allyValues: number[] = apocalypse.values(apocTypes.Side.Ally)
    let marked = apocalypse.markedIndex()
    if (marked >= 0 && marked < enemyValues.length) {
        let stolen: number = enemyValues.removeAt(marked)
        apocalypse.setValues(apocTypes.Side.Enemy, enemyValues)
        allyValues.push(stolen)
        apocalypse.setValues(apocTypes.Side.Ally, allyValues)
    }
})

apocalypse.onInteract(apocTypes.Room.R19, apocTypes.Station.Primary, function () {
    let hazardRoster: Sprite[] = apocalypse.roster()
    if (hazardRoster.length > 0) {
        let randomIndex = randint(0, hazardRoster.length - 1)
        let selected: Sprite = hazardRoster[randomIndex]
        apocalypse.hold(selected)
    }
})

apocalypse.onInteract(apocTypes.Room.R20, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.reverse()
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R21, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let allyMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    let found = enemyMoves.indexOf("Strike")
    if (found >= 0 && found <= allyMoves.length) {
        allyMoves.insertAt(found, "Ward")
        apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R22, apocTypes.Station.Primary, function () {
    let enemyTargets: Sprite[] = apocalypse.targets(apocTypes.Side.Enemy)
    let marked = apocalypse.markedIndex()
    if (marked >= 0 && marked < enemyTargets.length) {
        let selected: Sprite = enemyTargets.removeAt(marked)
        enemyTargets.unshift(selected)
        apocalypse.setTargets(apocTypes.Side.Enemy, enemyTargets)
    }
})

apocalypse.onInteract(apocTypes.Room.R23, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let found = enemyMoves.indexOf("Ward")
    if (found >= 0) {
        enemyMoves.removeAt(found)
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R24, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.unshift("Wait")
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R24, apocTypes.Station.Secondary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let shifted = apocalypse.markedIndex()
    if (shifted >= 0 && shifted < enemyMoves.length) {
        enemyMoves[shifted] = "Wait"
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R25, apocTypes.Station.Primary, function () {
    let allyMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    for (let i = 0; i <= allyMoves.length - 1; i++) {
        if (allyMoves[i] == "Wait" && enemyMoves[i] == "Strike") {
            allyMoves[i] = "Ward"
        }
    }
    apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
})

apocalypse.onInteract(apocTypes.Room.R26, apocTypes.Station.Primary, function () {
    let sourceMoves: string[] = apocalypse.sourceMoves()
    let allyMoves: string[] = []
    allyMoves = []
    let seenAttack = false
    let didHeal = false
    seenAttack = false
    didHeal = false
    for (let move of sourceMoves) {
        if (move == "Strike") {
            seenAttack = true
            allyMoves.push("Ward")
        } else if (seenAttack && !didHeal) {
            allyMoves.push("Mend")
            didHeal = true
        } else {
            allyMoves.push("Strike")
        }
    }
    apocalypse.setMoves(apocTypes.Side.Ally, allyMoves)
})

apocalypse.onInteract(apocTypes.Room.R27, apocTypes.Station.Primary, function () {
    let hazardRoster: Sprite[] = apocalypse.roster()
    for (let actor of hazardRoster) {
        apocalypse.hold(actor)
    }
})

apocalypse.onInteract(apocTypes.Room.R27, apocTypes.Station.Secondary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    for (let i = 0; i <= enemyMoves.length - 1; i++) {
        if (enemyMoves[i] == "Ward") {
            enemyMoves[i] = "Wait"
        }
    }
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

let visualReviewProgress = new apocTypes.Progress()
visualReviewProgress.highestUnlocked = 27
visualReviewProgress.resumeRoom = 14
visualReviewProgress.completedMask = (1 << 26) - 1
apocSave.store(visualReviewProgress)
apocWorld.start()

// OWNER VISUAL REVIEW ONLY: reference callbacks and open room navigation.
// This main is never installed as the canonical learner starter.
// CUMULATIVE INSTRUCTIONAL REFERENCE ONLY; never automatically install as learner code.
// World progress belongs to supplied world settings; behavior belongs to the currently edited program.

apocalypse.onInteract(apocTypes.Room.R01, apocTypes.Station.Primary, function () {
    let ourMoves: string[] = []
    ourMoves = []
    for (let index = 0; index <= apocalypse.numberHint() - 1; index++) {
        ourMoves.push("Wait")
    }
    ourMoves.push("Shield")
    ourMoves.push("Heal")
    ourMoves.push("Attack")
    ourMoves.push("Attack")
    apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
})

apocalypse.onInteract(apocTypes.Room.R02, apocTypes.Station.Primary, function () {
    let enemies: Sprite[] = apocalypse.roster()
    let markedIndex = apocalypse.markedIndex()
    if (markedIndex >= 0 && markedIndex < enemies.length) {
        let enemyToFreeze: Sprite = enemies[markedIndex]
        apocalypse.hold(enemyToFreeze)
    }
})

apocalypse.onInteract(apocTypes.Room.R03, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let markedIndex = apocalypse.markedIndex()
    if (markedIndex >= 0 && markedIndex < enemyMoves.length) {
        enemyMoves[markedIndex] = "Wait"
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R04, apocTypes.Station.Primary, function () {
    let ourMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    ourMoves.push("Attack")
    apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
})

apocalypse.onInteract(apocTypes.Room.R05, apocTypes.Station.Primary, function () {
    let ourMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    ourMoves.insertAt(apocalypse.markedIndex(), "Shield")
    apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
})

apocalypse.onInteract(apocTypes.Room.R06, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.unshift("Wait")
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R07, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let markedIndex = apocalypse.markedIndex()
    if (markedIndex >= 0 && markedIndex < enemyMoves.length) {
        enemyMoves.removeAt(markedIndex)
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R08, apocTypes.Station.Primary, function () {
    let ourMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    if (ourMoves.length > 0) {
        ourMoves[ourMoves.length - 1] = "Attack"
        apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R09, apocTypes.Station.Primary, function () {
    let ourMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    ourMoves.shift()
    apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
})

apocalypse.onInteract(apocTypes.Room.R10, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.pop()
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R11, apocTypes.Station.Primary, function () {
    let enemies: Sprite[] = apocalypse.roster()
    if (enemies.length > 0) {
        let removedEnemy: Sprite = enemies.shift()
        apocalypse.setRoster(enemies)
        apocalypse.banish(removedEnemy)
    }
})

apocalypse.onInteract(apocTypes.Room.R12, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let shieldIndex = enemyMoves.indexOf("Shield")
    if (shieldIndex >= 0) {
        enemyMoves[shieldIndex] = "Wait"
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R13, apocTypes.Station.Primary, function () {
    let enemies: Sprite[] = apocalypse.roster()
    for (let enemy of enemies) {
        apocalypse.hold(enemy)
    }
})

apocalypse.onInteract(apocTypes.Room.R14, apocTypes.Station.Primary, function () {
    let ourPowers: number[] = apocalypse.values(apocTypes.Side.Ally)
    let savedPower = ourPowers[0]
    ourPowers[0] = ourPowers[3]
    ourPowers[3] = savedPower
    apocalypse.setValues(apocTypes.Side.Ally, ourPowers)
})

apocalypse.onInteract(apocTypes.Room.R14, apocTypes.Station.Secondary, function () {
    let rolledPowers: number[] = apocalypse.values(apocTypes.Side.Ally)
    rolledPowers[0] = randint(4, 9)
    apocalypse.setValues(apocTypes.Side.Ally, rolledPowers)
})

apocalypse.onInteract(apocTypes.Room.R15, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    for (let index = 0; index <= enemyMoves.length - 1; index++) {
        if (enemyMoves[index] == "Shield") {
            enemyMoves[index] = "Wait"
        }
    }
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R16, apocTypes.Station.Primary, function () {
    let reserveMoves: string[] = apocalypse.sourceMoves()
    let ourMoves: string[] = []
    ourMoves = []
    for (let move of reserveMoves) {
        if (move == "Attack") {
            ourMoves.push("Shield")
        } else {
            ourMoves.push("Attack")
        }
    }
    apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
})

apocalypse.onInteract(apocTypes.Room.R17, apocTypes.Station.Primary, function () {
    let reserveMoves: string[] = apocalypse.sourceMoves()
    let ourMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    if (reserveMoves.length > 0) {
        let reserveMove: string = reserveMoves.pop()
        apocalypse.setSourceMoves(reserveMoves)
        ourMoves.push(reserveMove)
        apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R18, apocTypes.Station.Primary, function () {
    let enemyPowers: number[] = apocalypse.values(apocTypes.Side.Enemy)
    let ourPowers: number[] = apocalypse.values(apocTypes.Side.Ally)
    let markedIndex = apocalypse.markedIndex()
    if (markedIndex >= 0 && markedIndex < enemyPowers.length) {
        let stolenPower: number = enemyPowers.removeAt(markedIndex)
        apocalypse.setValues(apocTypes.Side.Enemy, enemyPowers)
        ourPowers.push(stolenPower)
        apocalypse.setValues(apocTypes.Side.Ally, ourPowers)
    }
})

apocalypse.onInteract(apocTypes.Room.R19, apocTypes.Station.Primary, function () {
    let enemies: Sprite[] = apocalypse.roster()
    if (enemies.length > 0) {
        let randomIndex = randint(0, enemies.length - 1)
        let enemyToFreeze: Sprite = enemies[randomIndex]
        apocalypse.hold(enemyToFreeze)
    }
})

apocalypse.onInteract(apocTypes.Room.R20, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.reverse()
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R21, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let ourMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    let attackIndex = enemyMoves.indexOf("Attack")
    if (attackIndex >= 0 && attackIndex <= ourMoves.length) {
        ourMoves.insertAt(attackIndex, "Shield")
        apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R22, apocTypes.Station.Primary, function () {
    let enemyTargets: Sprite[] = apocalypse.targets(apocTypes.Side.Enemy)
    let markedIndex = apocalypse.markedIndex()
    if (markedIndex >= 0 && markedIndex < enemyTargets.length) {
        let movedTarget: Sprite = enemyTargets.removeAt(markedIndex)
        enemyTargets.unshift(movedTarget)
        apocalypse.setTargets(apocTypes.Side.Enemy, enemyTargets)
    }
})

apocalypse.onInteract(apocTypes.Room.R23, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let shieldIndex = enemyMoves.indexOf("Shield")
    if (shieldIndex >= 0) {
        enemyMoves.removeAt(shieldIndex)
        apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R24, apocTypes.Station.Primary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    enemyMoves.unshift("Wait")
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

apocalypse.onInteract(apocTypes.Room.R24, apocTypes.Station.Secondary, function () {
    let shiftedMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    let markedIndex = apocalypse.markedIndex()
    if (markedIndex >= 0 && markedIndex < shiftedMoves.length) {
        shiftedMoves[markedIndex] = "Wait"
        apocalypse.setMoves(apocTypes.Side.Enemy, shiftedMoves)
    }
})

apocalypse.onInteract(apocTypes.Room.R25, apocTypes.Station.Primary, function () {
    let ourMoves: string[] = apocalypse.moves(apocTypes.Side.Ally)
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    for (let index = 0; index <= ourMoves.length - 1; index++) {
        if (ourMoves[index] == "Wait" && enemyMoves[index] == "Attack") {
            ourMoves[index] = "Shield"
        }
    }
    apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
})

apocalypse.onInteract(apocTypes.Room.R26, apocTypes.Station.Primary, function () {
    let reserveMoves: string[] = apocalypse.sourceMoves()
    let ourMoves: string[] = []
    ourMoves = []
    let seenAttack = false
    let didHeal = false
    seenAttack = false
    didHeal = false
    for (let move of reserveMoves) {
        if (move == "Attack") {
            seenAttack = true
            ourMoves.push("Shield")
        } else if (seenAttack && !didHeal) {
            ourMoves.push("Heal")
            didHeal = true
        } else {
            ourMoves.push("Attack")
        }
    }
    apocalypse.setMoves(apocTypes.Side.Ally, ourMoves)
})

apocalypse.onInteract(apocTypes.Room.R27, apocTypes.Station.Primary, function () {
    let enemies: Sprite[] = apocalypse.roster()
    for (let enemy of enemies) {
        apocalypse.hold(enemy)
    }
})

apocalypse.onInteract(apocTypes.Room.R27, apocTypes.Station.Secondary, function () {
    let enemyMoves: string[] = apocalypse.moves(apocTypes.Side.Enemy)
    for (let index = 0; index <= enemyMoves.length - 1; index++) {
        if (enemyMoves[index] == "Shield") {
            enemyMoves[index] = "Wait"
        }
    }
    apocalypse.setMoves(apocTypes.Side.Enemy, enemyMoves)
})

// Seed this review only on first launch. Existing earned, reset or future
// progress records remain owned by apocSave; restarts resume the saved room.
if (!apocSave.hasProgress()) {
    let visualReviewProgress = new apocTypes.Progress()
    visualReviewProgress.highestUnlocked = 27
    visualReviewProgress.resumeRoom = 14
    visualReviewProgress.completedMask = (1 << 26) - 1
    apocSave.store(visualReviewProgress)
}
apocWorld.start()

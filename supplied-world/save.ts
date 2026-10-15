// Only one game-specific record; does not persist code, actors or drafts.
namespace apocSave {
    const KEY = "al.progress.v1"
    let recovery = ""
    let future = false

    export function notice(): string { return recovery }
    export function isFuture(): boolean { return future }

    function fresh(): apocTypes.Progress {
        return new apocTypes.Progress()
    }
    function integer(n: number): boolean { return n == Math.floor(n) && n >= 0 }
    function earnedCeiling(mask: number): number {
        let top = 1
        for (let room = 1; room <= 26; room++) {
            if ((mask & (1 << (room - 1))) == 0) break
            top = room + 1
        }
        return top
    }
    function consistent(mask: number, highest: number): boolean {
        const expected = (1 << (highest - 1)) - 1
        if (highest == 27) return mask == expected || mask == (expected | (1 << 26))
        return mask == expected
    }
    export function load(): apocTypes.Progress {
        recovery = ""
        future = false
        const data = settings.readNumberArray(KEY)
        if (!data) return fresh()
        if (data.length > 0 && integer(data[0]) && data[0] > 1) {
            future = true
            recovery = "Save uses a newer version; not overwritten"
            return fresh()
        }
        if (data.length != 4 || data[0] != 1 || !integer(data[1]) || !integer(data[2]) || !integer(data[3]) ||
            data[1] < 1 || data[1] > 27 || data[2] < 1 || data[2] > data[1] || data[3] >= (1 << 27) ||
            data[1] != earnedCeiling(data[3]) || !consistent(data[3], data[1])) {
            recovery = "Save invalid; temporary start at R01"
            return fresh()
        }
        let result = fresh()
        result.highestUnlocked = data[1]
        result.resumeRoom = data[2]
        result.completedMask = data[3]
        return result
    }
    export function store(value: apocTypes.Progress): void {
        if (future || !value) return
        if (value.schemaVersion != 1 || !integer(value.highestUnlocked) || !integer(value.resumeRoom) ||
            !integer(value.completedMask) || value.highestUnlocked != earnedCeiling(value.completedMask) ||
            value.resumeRoom < 1 || value.resumeRoom > value.highestUnlocked || value.completedMask >= (1 << 27) ||
            !consistent(value.completedMask, value.highestUnlocked)) return
        settings.writeNumberArray(KEY, [1, value.highestUnlocked, value.resumeRoom, value.completedMask])
    }
    export function clear(): void {
        settings.remove(KEY)
        future = false
        recovery = "Progress erased; R01 ready"
    }
}

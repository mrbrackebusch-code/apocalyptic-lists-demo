// Package02 is the sole screen-size owner.
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 576
    export const ARCADE_SCREEN_HEIGHT = 720
}
// Tutorial customts does not inherit pxt.json's palette. Apply the same native
// palette explicitly so first launch, Recipes and project builds match.
image.setPalette(hex`000000f4e7cfbb5149d98c86d58b4be0c06d3d756a7a9c54415b9182c4c0a174ac676a732429419d7556674533151321`)

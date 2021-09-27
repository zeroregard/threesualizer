
export function initCanvas() {
    const canvas = document.querySelector("#audiotest") as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.scale(dpr, dpr);
    ctx.translate(0, canvas.offsetHeight / 2 + padding); // Set Y = 0 to be in the middle of the canvas
}

export function getVisualizationArray(offsetHeight: number, padding: number, normalizedData: number[] | Float64Array): any[] {
    const map = [];
    for (let i = 0; i < normalizedData.length; i++) {
        let height = normalizedData[i] * offsetHeight - padding;
        if (height < 0) {
            height = 0;
        } else if (height > height / 2) {
            height = height - height / 2;
        }
        map.push(height);
    }
    return map;
}
const PercentLoadedCache = {}
const PercentLoadedCanvas = document.createElement('canvas')
PercentLoadedCanvas.style.position = 'absolute'
const CanvasUtils = {
    dataURIForLoadedPercent: (percent) => {
        percent = Math.floor(percent / 5.0) * 5.0
        const cacheKey = `${percent}%`
        if(!PercentLoadedCache[cacheKey]) {
            const canvas = PercentLoadedCanvas
            const scale = window.devicePixelRatio
            canvas.width = 20 * scale
            canvas.height = 20 * scale
            canvas.style.width = '30px'
            canvas.style.height = '30px'

            const half = 10 * scale
            const ctx = canvas.getContext('2d')
            ctx.strokeStyle = '#AAA'
            ctx.lineWidth = 3 * scale
            ctx.clearRect(0, 0, 20 * scale, 20 * scale)
            ctx.beginPath()
            ctx.arc(half, half, half - ctx.lineWidth, -0.5 * Math.PI, (-0.5 * Math.PI) + (2 * Math.PI) * percent / 100.0)
            ctx.stroke()
            PercentLoadedCache[cacheKey] = canvas.toDataURL()
        }
        return PercentLoadedCache[cacheKey]
    }

}

module.exports = CanvasUtils
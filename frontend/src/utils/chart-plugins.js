function handleHover(evt, item, legend) {
    legend.chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
        color = convertRGBtoHEX(color);
        colors[index] = index === item.index || color.length === 9 ? color : color + '4D';
    });
    legend.chart.update();
}

function handleLeave(evt, item, legend) {
    legend.chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
        color = convertRGBtoHEX(color);
        colors[index] = color.length === 9 ? color.slice(0, -2) : color;
    });
    legend.chart.update();
}
function convertRGBtoHEX(colorRGB) {
    if (colorRGB.toLowerCase().includes('rgb')) {
        const paramsRGB = colorRGB.slice(4, colorRGB.length - 1).split(', ');
        const paramsHEX = paramsRGB.map(item => ((+item).toString(16).length < 2 ? '0' : '') + (+item).toString(16));
        return '#' + paramsHEX.join('').toUpperCase();
    }
    return colorRGB;
}

const legendMarginPlugin = {
    id: 'legendMargin',
    beforeInit(chart) {
        const originalFit = chart.legend.fit;
        chart.legend.fit = function fit() {
            originalFit.bind(chart.legend)();
            this.height += 40;
        };
    }
};

module.exports = { handleHover, handleLeave, legendMarginPlugin };
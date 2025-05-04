import { Chart, LegendElement, LegendItem, ChartDataset, ChartEvent, ChartTypeRegistry } from 'chart.js';

function handleHover(
    this: LegendElement<'pie'>,
    _e: ChartEvent,
    item: LegendItem,
    legend: LegendElement<'pie'>
): void {
    const chart: Chart<'pie'> = legend.chart;
    const dataset: ChartDataset<'pie'> = chart.data.datasets[0];

    if (!dataset.backgroundColor) {
        return;
    }

    if (Array.isArray(dataset.backgroundColor)) {
        dataset.backgroundColor = dataset.backgroundColor.map((color: string, index: number): string => {
            const hexColor: string = convertRGBtoHEX(color);
            return index === item.index || hexColor.length === 9 ? hexColor : hexColor + '4D';
        });
    } else {
        const hexColor: string = convertRGBtoHEX(dataset.backgroundColor as string);
        dataset.backgroundColor = item.index === 0 || hexColor.length === 9 ? hexColor : hexColor + '4D';
    }
    chart.update();
}

function handleLeave(
    this: LegendElement<'pie'>,
    _e: ChartEvent,
    _item: LegendItem,
    legend: LegendElement<'pie'>
): void {
    const chart: Chart<'pie'> = legend.chart;
    const dataset: ChartDataset<'pie'> = chart.data.datasets[0];

    if (!dataset.backgroundColor) return;

    if (Array.isArray(dataset.backgroundColor)) {
        dataset.backgroundColor = dataset.backgroundColor.map((color: string): string => {
            const hexColor: string = convertRGBtoHEX(color);
            return hexColor.length === 9 ? hexColor.slice(0, -2) : hexColor;
        });
    } else {
        const hexColor: string = convertRGBtoHEX(dataset.backgroundColor as string);
        dataset.backgroundColor = hexColor.length === 9 ? hexColor.slice(0, -2) : hexColor;
    }
    chart.update();
}

function convertRGBtoHEX(colorRGB: string): string {
    if (colorRGB.toLowerCase().includes('rgb')) {
        const paramsRGB: string[] = colorRGB.slice(
            colorRGB.indexOf('(') + 1,
            colorRGB.lastIndexOf(')')
        ).split(/\s*,\s*/);
        const paramsHEX: string[] = paramsRGB.map(item => {
            const hex: string = parseInt(item).toString(16);
            return hex.length < 2 ? '0' + hex : hex;
        });
        return '#' + paramsHEX.join('').toUpperCase();
    }
    return colorRGB;
}

const legendMarginPlugin = {
    id: 'legendMargin' as const,
    beforeInit(chart: Chart): void {
        const originalFit: (() => void) | undefined = chart.legend?.fit;
        if (originalFit) {
            chart.legend!.fit = function fit(this: LegendElement<keyof ChartTypeRegistry>): void {
                originalFit.call(this);
                this.height += 40;
            };
        }
    }
};

export { handleHover, handleLeave, legendMarginPlugin };
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/common-styles.css";
import "../styles/main.css";
import {Chart, ArcElement, Tooltip, Legend, PieController} from "chart.js";
import {Common} from "./common";
import { handleHover, handleLeave, legendMarginPlugin } from '../utils/chart-plugins';
import {operationType} from "../types";
Chart.register(ArcElement, Tooltip, Legend, PieController);

export class Main {
    readonly sortButtons: HTMLInputElement[];
    readonly chartInstances: Record<string, Chart>;

    constructor() {
        this.sortButtons = Array.from(document.querySelectorAll('.sort-by-period > input'));
        this.chartInstances = {};
        if (this.sortButtons) {
            this.sortButtonsInteraction();
            if (this.sortButtons.length > 0) this.sortButtons[0].click();
        }
    }

    private sortButtonsInteraction(): void {
        Common.sortButtonsInteraction(this.sortButtons, async (date1: string | null, date2: string | null): Promise<void> => {
            if (!date1 || !date2) return;
            const data: operationType[] | undefined = await Common.getData(date1, date2);
            if (data && data.length > 0) {

                const incomeData: Record<string, number> = {}, expenseData: Record<string, number> = {};

                data.forEach((item: operationType): void => {
                    if (item.type === 'income') {
                        incomeData[item.category] = (incomeData[item.category] || 0) + item.amount;
                    }
                    if (item.type === 'expense') {
                        expenseData[item.category] = (expenseData[item.category] || 0) + item.amount;
                    }
                });
                Object.keys(incomeData).length > 0 ? this.createChart('income', 'Доходы', incomeData) : this.destroyChartIfExists('income');
                Object.keys(expenseData).length > 0 ? this.createChart('expense', 'Расходы', expenseData) : this.destroyChartIfExists('expense');
            } else {
                this.destroyChartIfExists('income');
                this.destroyChartIfExists('expense');
            }
        });
    }

    private createChart(id: string, text: string, data: Object): void {
        if (this.chartInstances[id]) this.chartInstances[id].destroy();
        this.chartInstances[id] = new Chart(document.getElementById(id) as HTMLCanvasElement, {
            type: 'pie',
            plugins: [legendMarginPlugin],
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    borderWidth: 1,
                    backgroundColor: getColors(Object.keys(data).length),
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        onHover: handleHover,
                        onLeave: handleLeave,
                        fullSize: true,
                        display: true,
                        position: 'top',
                        align: 'center',
                        labels: {
                            boxWidth: 35,
                            boxHeight: 10,
                            color: '#000',
                            font: {
                                size: 12,
                            },
                        },
                        title: {
                            color: '#290661',
                            display: true,
                            font: {
                                size: 28,
                            },
                            text: text,
                            padding: {
                                bottom: 20,
                            },
                        },
                    },
                },
            }
        });
        function getColors(num: number): string[] {
            let colors: string[] = ['#DC3545', '#FD7E14', '#FFC107', '#0D6EFD', '#20C997'];
            if (num < colors.length) {
                colors = colors.slice(0, num);
            }
            while (colors.length < num) {
                let randomColor: string = generateRandomColor();
                while (colors.includes(randomColor)) {
                    randomColor = generateRandomColor();
                }
                colors.push(randomColor);
            }
            return colors;
            function generateRandomColor(): string {
                const letters = '0123456789ABCDEF';
                let color: string = '#';
                for (let i: number = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
        }
    }

    private destroyChartIfExists(chartId: string): void {
        if (this.chartInstances[chartId]) {
            this.chartInstances[chartId].destroy();
            delete this.chartInstances[chartId];
        }
    }
}
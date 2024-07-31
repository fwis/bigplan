class TrendSerie {
    constructor(name, color, capacity = 500) {
        this.name = name;
        this.color = color;
        this.currentTotal = 0;
        this.currentAvg = 0;
        this.data = [];
        this.maxValue = -Infinity;
        this.capacity = capacity;
    }

    Add(value) {
        if (this.maxValue < value) this.maxValue = value;

        this.currentTotal += value;
    }

    Average(count) {
        this.currentAvg = this.currentTotal / count;
        this.data.push(this.currentAvg);
        this.currentTotal = 0;

        if (this.data.length > this.capacity) {
            this.data.shift();
        }
    }
}

class TrendPanel {
    constructor(trendCanvas, interval = 10) {
        this.trendChart = trendCanvas;
        this.trendChartContext = this.trendChart.getContext("2d");
        this.trendChartContext.font = "12px Arial";
        this.trendSeries = [];
        this.statsInterval = interval;
        this.statsCount = 0;
        this.statsCurrentCount = 0;
        this.maxValue = 1000;
    }

    AddSerie(name, color) {
        const trendSerie = new TrendSerie(name, color);
        this.trendSeries.push(trendSerie);
    }

    Toggle() {
        if (this.trendChart.style.display != 'block') {
            this.trendChart.style.display = 'block';
        } else {
            this.trendChart.style.display = 'none';
        }
    }

    IsVisible() {
        return (this.trendChart.style.display == 'block');
    }

    Add(v0, v1, v2, v3, v4, v5) {
        const values = [v0, v1, v2, v3, v4, v5];
        const len = Math.min(this.trendSeries.length, values.length);
        //const len = values.length;
        for(var i = 0; i < len; i++) {
            var value = values[i];
            this.trendSeries[i].Add(value);
        }

        this.statsCurrentCount++;

        if (this.statsCurrentCount >= this.statsInterval) {
            for(var i = 0; i < this.trendSeries.length; i++) {
                var trendSerie = this.trendSeries[i];
                trendSerie.Average(this.statsCurrentCount);
            }

            this.statsCurrentCount = 0;
        }
        
        this._drawTrend();
    }

    _drawTrend() {
        const ctx = this.trendChartContext;
        const chartWidth = this.trendChart.width;
        const chartHeight = this.trendChart.height;

        const padding = 2;
        const plotWidth = chartWidth - 2 * padding;
        const plotHeight = chartHeight - 2 * padding;

        ctx.clearRect(0, 0, chartWidth, chartHeight);

        const maxValue = this.maxValue;
        ctx.fillText(`Y: ${maxValue.toFixed(0)}`, padding, padding + 10);

        const drawLine = (values, color) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            values.forEach((value, index) => {
                const x = padding + (index / (values.length - 1)) * plotWidth;
                const y = chartHeight - padding - ((value) / maxValue) * plotHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        };

        for(var i = 0; i < this.trendSeries.length; i++) {
            var trendSerie = this.trendSeries[i];
            drawLine(trendSerie.data, trendSerie.color);
            ctx.fillText(`${trendSerie.name}: ${trendSerie.currentAvg.toFixed(0)}`, plotWidth - 70, padding + 10 + i* 22);
        }
    }

}
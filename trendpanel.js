class TrendPanel {
    constructor(trendCanvas) {
        this.trendChart = trendCanvas;
        this.trendChartContext = this.trendChart.getContext("2d");

        this.grassTrends = [];
        this.wormTrends = [];
        this.fpsTrends = [];
        this.statsInterval = 10;
        this.statsCount = 0;
        this.statsCurrentCount = 0;
        this.grassCurrentCount = 0;
        this.wormCurrentCount = 0;
        this.maxValue = 1000;

        this.currentAvgGrassTrend = 0;
        this.currentAvgWormTrend = 0;
        this.currentAvgFPSTrend = 0;
    }

    Toggle() {
        this.trendChart.Invisible = false;
    }

    Update(grassCount, wormCount, fps) {
        if (this.maxValue < grassCount) this.maxValue = grassCount;
        if (this.maxValue < wormCount) this.maxValue = wormCount;
        if (this.maxValue < fps) this.maxValue = fps;

        this.grassCurrentCount += grassCount;
        this.wormCurrentCount += wormCount;
        this.statsCurrentCount++;

        if (this.statsCurrentCount >= this.statsInterval) {
            this.currentAvgGrassTrend = this.grassCurrentCount / this.statsCurrentCount;
            this.grassTrends.push(this.currentAvgGrassTrend);
            this.grassCurrentCount = 0;

            this.currentAvgWormTrend = this.wormCurrentCount / this.statsCurrentCount;
            this.wormTrends.push(this.currentAvgWormTrend);
            this.wormCurrentCount = 0;

            this.currentAvgFPSTrend = fps;
            this.fpsTrends.push(this.currentAvgFPSTrend);
            this.statsCurrentCount = 0;
        }

        if (this.grassTrends.length > 500) {
            this.grassTrends.shift();
        }

        if (this.wormTrends.length > 500) {
            this.wormTrends.shift();
        }

        if (this.fpsTrends.length > 500) {
            this.fpsTrends.shift();
        }
    }

    _drawTrend() {
        const ctx = this.trendChartContext;
        const chartWidth = this.trendChart.width;
        const chartHeight = this.trendChart.height;

        const padding = 2;
        const plotWidth = chartWidth - 2 * padding;
        const plotHeight = chartHeight - 2 * padding;

        ctx.clearRect(0, 0, chartWidth, chartHeight);

        const drawLine = (values, color, scaleFactor = 1) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            values.forEach((value, index) => {
                const x = padding + (index / (values.length - 1)) * plotWidth;
                const y = chartHeight - padding - (value / this.maxValue) * plotHeight * scaleFactor;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        };

        drawLine(this.grassTrends, "green");
        drawLine(this.wormTrends, "purple");
        drawLine(this.fpsTrends, "blue",20); // 放大FPS以适应图表

        ctx.font = "12px Arial";
        ctx.fillText(`Y: ${this.maxValue.toFixed(0)}`, padding, padding + 10);
        ctx.fillText(`草数: ${this.currentAvgGrassTrend.toFixed(0)}`, plotWidth - 70, padding + 10);
        ctx.fillText(`虫数: ${this.currentAvgWormTrend.toFixed(0)}`, plotWidth - 70, padding + 32);
        ctx.fillText(`FPS: ${this.currentAvgFPSTrend.toFixed(2)}`, plotWidth - 70, padding + 54);
    }
}

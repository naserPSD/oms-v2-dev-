import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics-json')
  @Public()
  async metricsJson() {
    return this.metricsService.getMetricsJson();
  }

  @Get('metrics-ui')
  @Public()
  @Header('Content-Type', 'text/html')
  async metricsUi() {
    return this.getMetricsUiHtml();
  }

  private getMetricsUiHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OMS Metrics Dashboard</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #e2e8f0; }
    header { padding: 20px; border-bottom: 1px solid rgba(148,163,184,.2); }
    h1 { margin: 0 0 8px; font-size: 1.7rem; }
    p { margin: 0; color: #94a3b8; }
    main { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .card { background: rgba(15,23,42,.9); border: 1px solid rgba(148,163,184,.12); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid rgba(148,163,184,.12); }
    th { color: #cbd5e1; font-weight: 600; }
    td { color: #e2e8f0; }
    .metric-name { color: #38bdf8; }
    .label-pill { display: inline-block; margin: 0 6px 6px 0; padding: 3px 8px; border-radius: 999px; background: rgba(56,189,248,.16); color: #38bdf8; font-size: .8rem; }
    .toolbar { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-top:16px; }
    button { border:none; border-radius: 999px; padding: 10px 18px; font-weight:600; cursor:pointer; background:#2563eb; color:#fff; }
    button:hover { background:#1d4ed8; }
    #chart-container { width:100%; height: 420px; }
    .footer { color: #94a3b8; font-size: .9rem; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
</head>
<body>
  <header>
    <h1>OMS Metrics Dashboard</h1>
    <p>Metrics source: <code>/metrics</code>. Refresh interval: 5 seconds.</p>
  </header>

  <main>
    <div class="card">
      <div class="toolbar">
        <button id="refreshBtn">Refresh now</button>
        <span id="status">Loading metrics...</span>
      </div>
      <div id="summary"></div>
    </div>

    <div class="card">
      <h2>Metric explorer</h2>
      <select id="metricSelect"><\/select>
      <div id="metricDetails"><\/div>
    </div>

    <div class="card" id="chart-card">
      <h2>Time series preview</h2>
      <canvas id="metricsChart"><\/canvas>
    </div>

    <div class="card">
      <h2>Raw metrics text</h2>
      <pre id="rawMetrics" style="white-space: pre-wrap; word-break: break-word; max-height: 420px; overflow:auto;"><\/pre>
    </div>

    <div class="footer">Open <a href="/metrics" style="color:#38bdf8;">/metrics</a> for Prometheus scraping.</div>
  </main>

  <script>
    const metricEndpoint = '/metrics-json';
    const refreshBtn = document.getElementById('refreshBtn');
    const statusLabel = document.getElementById('status');
    const metricSelect = document.getElementById('metricSelect');
    const metricDetails = document.getElementById('metricDetails');
    const rawMetrics = document.getElementById('rawMetrics');
    const chartCtx = document.getElementById('metricsChart').getContext('2d');
    let metricsData = [];
    let seriesHistory = {};
    let chart;

    function formatLabels(labels) {
      return Object.entries(labels).map(([key, value]) => '<span class="label-pill">' + key + '=' + value + '</span>').join('');
    }

    function renderSummary() {
      if (!metricsData.length) {
        statusLabel.innerText = 'No metrics available';
        return;
      }
      statusLabel.innerText = 'Loaded ' + metricsData.length + ' metric families.';
      const totalSeries = metricsData.reduce((sum, item) => sum + item.values.length, 0);
      document.getElementById('summary').innerHTML = '<strong>' + totalSeries + '<\/strong> series across <strong>' + metricsData.length + '<\/strong> metric families.';
    }

    function renderMetricOptions() {
      metricSelect.innerHTML = metricsData
        .map((metric, index) => '<option value="' + index + '">' + metric.name + ' (' + metric.type + ')<\/option>')
        .join('');
      metricSelect.onchange = () => renderMetricDetails(metricsData[metricSelect.value]);
      if (metricsData.length) {
        renderMetricDetails(metricsData[0]);
      }
    }

    function renderMetricDetails(metric) {
      const rows = metric.values.map(value => '<tr><td class="metric-name">' + metric.name + '<\/td><td>' + metric.type + '<\/td><td>' + formatLabels(value.labels) + '<\/td><td>' + value.value + '<\/td><\/tr>').join('');
      metricDetails.innerHTML = '<table><thead><tr><th>Metric<\/th><th>Type<\/th><th>Labels<\/th><th>Value<\/th><\/tr><\/thead><tbody>' + rows + '<\/tbody><\/table>';
      updateSeriesHistory(metric);
    }

    function updateSeriesHistory(metric) {
      const now = new Date().toLocaleTimeString();
      metric.values.forEach(value => {
        const key = metric.name + JSON.stringify(value.labels);
        seriesHistory[key] = seriesHistory[key] || { label: metric.name + ' ' + JSON.stringify(value.labels), data: [] };
        seriesHistory[key].data.push({ x: now, y: value.value });
        if (seriesHistory[key].data.length > 20) seriesHistory[key].data.shift();
      });
      renderChart(metric);
    }

    function renderChart(metric) {
      const chartData = metric.values.map(value => {
        const key = metric.name + JSON.stringify(value.labels);
        return seriesHistory[key];
      });
      const datasets = chartData.map((series, index) => ({
        label: series.label,
        data: series.data,
        borderColor: 'hsl(' + (index * 50 % 360) + ', 85%, 65%)',
        backgroundColor: 'rgba(56,189,248,0.18)',
        tension: 0.3,
        fill: false,
      }));

      if (chart) {
        chart.data.datasets = datasets;
        chart.update();
        return;
      }

      chart = new Chart(chartCtx, {
        type: 'line',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#e2e8f0' } } },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148,163,184,.12)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148,163,184,.12)' } }
          }
        }
      });
    }

    async function loadMetrics() {
      try {
        const response = await fetch(metricEndpoint);
        const data = await response.json();
        metricsData = data;
        renderSummary();
        renderMetricOptions();
        rawMetrics.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusLabel.innerText = 'Failed to load metrics';
        rawMetrics.innerText = err.message;
      }
    }

    refreshBtn.addEventListener('click', loadMetrics);
    loadMetrics();
    setInterval(loadMetrics, 5000);
  <\/script>
</body>
</html>`;
  }
}

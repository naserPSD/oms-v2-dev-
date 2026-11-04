# Grafana Monitoring Setup

## Quick Start

### 1. Start Prometheus & Grafana

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

This starts:
- **Prometheus** at `http://localhost:9090` (scrapes metrics from your backend)
- **Grafana** at `http://localhost:3001` (dashboard visualization)

### 2. Access Grafana

Open in browser:
```
http://localhost:3001
```

**Login credentials:**
- Username: `admin`
- Password: `admin`

### 3. View Metrics

The "OMS Backend Metrics" dashboard is automatically provisioned and shows:
- ✅ Service health status
- 📊 HTTP request rate
- ⏱️ Request latency (p95, p99)
- 📈 All Prometheus metrics

### How It Works

1. Your NestJS backend at `http://localhost:4000/metrics` exposes Prometheus metrics
2. Prometheus scrapes metrics every 5 seconds
3. Grafana queries Prometheus and displays dashboards

### Troubleshooting

**Docker on Windows:** If Prometheus can't reach your backend, replace `host.docker.internal:4000` in `prometheus.yml` with your actual IP:
```yaml
static_configs:
  - targets: ['192.168.x.x:4000']  # Your machine IP
```

**Grafana not showing metrics?** 
- Check Prometheus is scraping: `http://localhost:9090/targets`
- Ensure your backend is running and `/metrics` is accessible

### Stop Services

```bash
docker-compose -f docker-compose.monitoring.yml down
```

### Add More Dashboards

Edit `grafana/provisioning/dashboards/oms-dashboard.json` to customize metrics and panels.

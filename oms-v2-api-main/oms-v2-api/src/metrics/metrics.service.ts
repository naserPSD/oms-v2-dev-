import { Injectable } from '@nestjs/common';
import { register } from 'prom-client';

export type MetricsValue = {
  labels: Record<string, string>;
  value: number;
};

export type MetricsResult = {
  name: string;
  help: string;
  type: string;
  values: MetricsValue[];
};

@Injectable()
export class MetricsService {
  async getMetricsText(): Promise<string> {
    return register.metrics();
  }

  async getMetricsJson(): Promise<MetricsResult[]> {
    const metricsText = await this.getMetricsText();
    return parsePrometheusText(metricsText);
  }
}

function parsePrometheusText(text: string): MetricsResult[] {
  const metricsMap = new Map<string, MetricsResult>();
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      if (line.startsWith('# HELP')) {
        const [, name, ...helpParts] = line.split(/\s+/);
        const help = helpParts.join(' ');
        const metric = metricsMap.get(name) ?? {
          name,
          help,
          type: 'unknown',
          values: [],
        };
        metric.help = help;
        metricsMap.set(name, metric);
      }
      if (line.startsWith('# TYPE')) {
        const [, name, type] = line.split(/\s+/);
        const metric = metricsMap.get(name) ?? {
          name,
          help: '',
          type,
          values: [],
        };
        metric.type = type;
        metricsMap.set(name, metric);
      }
      continue;
    }

    const [metricPart, valuePart] = line.split(/\s+/);
    if (!metricPart || valuePart === undefined) {
      continue;
    }

    const labels: Record<string, string> = {};
    let metricName = metricPart;
    const labelStart = metricPart.indexOf('{');
    const labelEnd = metricPart.lastIndexOf('}');

    if (labelStart >= 0 && labelEnd >= 0) {
      metricName = metricPart.slice(0, labelStart);
      const labelString = metricPart.slice(labelStart + 1, labelEnd);
      const labelPairs = labelString.match(/[^,=]+="(?:[^"\\]|\\.)*"/g) || [];
      for (const pair of labelPairs) {
        const equalIndex = pair.indexOf('=');
        const key = pair.slice(0, equalIndex);
        const rawValue = pair.slice(equalIndex + 1).trim();
        labels[key] = rawValue.replace(/^"|"$/g, '').replace(/\\"/g, '"');
      }
    }

    const value = Number(valuePart);
    if (Number.isNaN(value)) {
      continue;
    }

    const metric = metricsMap.get(metricName) ?? {
      name: metricName,
      help: '',
      type: 'gauge',
      values: [],
    };

    metric.values.push({ labels, value });
    metricsMap.set(metricName, metric);
  }

  return Array.from(metricsMap.values());
}

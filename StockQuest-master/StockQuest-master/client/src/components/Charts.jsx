import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_UP = '#00C896';
const CHART_DOWN = '#E24B4A';
const CHART_AXIS = '#93A3AF';
const CHART_SURFACE = '#101720';
const CHART_BORDER = '#2A3848';

export function SparkLine({ data, color = CHART_UP, height = 40, width = 120 }) {
  const chartData = data.map((value, index) => ({ index, value }));
  const isUp = data[data.length - 1] >= data[0];

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={isUp ? color : CHART_DOWN}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StockLineChart({ data, height = 300 }) {
  const chartData = data.map((value, index) => ({
    day: index,
    price: value,
  }));
  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? CHART_UP : CHART_DOWN;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: CHART_AXIS }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fontSize: 12, fill: CHART_AXIS }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            background: CHART_SURFACE,
            border: `1px solid ${CHART_BORDER}`,
            borderRadius: '8px',
            boxShadow: 'none',
            fontSize: '13px',
            color: '#EEF5F7',
          }}
          formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
          labelFormatter={(label) => `Day ${label}`}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.08}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PortfolioChart({ data, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_AXIS }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_AXIS }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            background: CHART_SURFACE,
            border: `1px solid ${CHART_BORDER}`,
            borderRadius: '8px',
            boxShadow: 'none',
            fontSize: '13px',
            color: '#EEF5F7',
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']}
        />
        <Area type="monotone" dataKey="value" stroke={CHART_UP} strokeWidth={2} fill={CHART_UP} fillOpacity={0.08} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

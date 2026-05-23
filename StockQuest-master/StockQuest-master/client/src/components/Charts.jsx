import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CHART_UP = '#00C896';
const CHART_DOWN = '#E24B4A';
export const CHART_PRIMARY_COMPARE = '#00C896';
export const CHART_COMPARE_COLORS = ['#3B82F6', '#F59E0B', '#D946EF', '#8B5CF6', '#F43F5E', '#06B6D4'];
const CHART_AXIS = '#93A3AF';
const CHART_SURFACE = '#101720';
const CHART_BORDER = '#2A3848';
const CHART_LIGHT_GRID = '#E5E7EB';

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
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function formatPriceAxis(value) {
  return `$${Number(value).toFixed(0)}`;
}

function formatPriceTooltip(value) {
  return `$${Number(value).toFixed(2)}`;
}

function formatTimeTick(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getPortfolioYAxisTicks(data) {
  const values = data
    .map((item) => Number(item?.value))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return [0, 250];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = 250;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  if (min === max) {
    const lower = Math.max(0, start - step);
    const centeredTicks = [lower, start, start + step].filter(
      (value, index, list) => list.indexOf(value) === index
    );
    return centeredTicks.length > 1 ? centeredTicks : [0, step];
  }

  const ticks = [];

  for (let value = start; value <= end; value += step) {
    ticks.push(value);
  }

  if (ticks.length === 1) {
    ticks.push(start + step);
  }

  return ticks;
}

function getPortfolioXAxisTicks(data) {
  const values = data
    .map((item) => Number(item?.timestamp))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    const now = Date.now();
    return [now, now + 5 * 60 * 1000];
  }

  const step = 5 * 60 * 1000;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks = [];

  for (let value = start; value <= end; value += step) {
    ticks.push(value);
  }

  if (ticks.length === 1) {
    ticks.push(start + step);
  }

  return ticks;
}

export function getComparisonColor(index) {
  return CHART_COMPARE_COLORS[index % CHART_COMPARE_COLORS.length];
}

function getPaddedDomain(values, fallbackPadding = 1) {
  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (finiteValues.length === 0) return ['auto', 'auto'];

  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);
  if (min === max) {
    return [min - fallbackPadding, max + fallbackPadding];
  }

  const padding = Math.max((max - min) * 0.12, fallbackPadding);
  return [min - padding, max + padding];
}

export function StockLineChart({ data, comparisons = [], height = 300, primaryLabel = 'Selected' }) {
  const normalizedComparisons = comparisons.filter(
    (comparison) => Array.isArray(comparison?.data) && comparison.data.length > 0
  );
  const hasComparison = normalizedComparisons.length > 0;
  const comparisonLength = hasComparison
    ? Math.min(
        data.length,
        ...normalizedComparisons.map((comparison) => comparison.data.length)
      )
    : data.length;
  const chartData = Array.from({ length: comparisonLength }, (_, index) => {
    const primaryPrice = data[index];
    const row = {
      day: index + 1,
      price: primaryPrice,
    };

    normalizedComparisons.forEach((comparison, comparisonIndex) => {
      const comparisonPrice = comparison.data[index];
      row[`comparisonPrice_${comparisonIndex}`] = comparisonPrice;
    });

    return row;
  });
  const priceDomain = getPaddedDomain(
    chartData.flatMap((row) => [
      row.price,
      ...normalizedComparisons.map((_, index) => row[`comparisonPrice_${index}`]),
    ]),
    1
  );
  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? CHART_UP : CHART_DOWN;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {hasComparison ? (
        <LineChart data={chartData} margin={{ top: 12, right: 18, left: 8, bottom: 22 }}>
          <CartesianGrid stroke={CHART_BORDER} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Days', position: 'insideBottom', offset: -10, fill: CHART_AXIS, fontSize: 12 }}
          />
          <YAxis
            domain={priceDomain}
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPriceAxis}
            width={76}
            label={{
              value: 'Price per share',
              angle: -90,
              position: 'insideLeft',
              fill: CHART_AXIS,
              fontSize: 12,
            }}
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
            formatter={(value, name, item) => {
              if (name === 'price') {
                return [formatPriceTooltip(value), primaryLabel];
              }
              const comparisonIndex = Number(String(name).split('_').pop());
              const label = normalizedComparisons[comparisonIndex]?.label || `Comparison ${comparisonIndex + 1}`;
              return [formatPriceTooltip(value), label];
            }}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={CHART_PRIMARY_COMPARE}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          {normalizedComparisons.map((comparison, index) => (
            <Line
              key={comparison.label || index}
              type="monotone"
              dataKey={`comparisonPrice_${index}`}
              stroke={getComparisonColor(index)}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray={index % 2 === 0 ? '6 4' : undefined}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      ) : (
        <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 8, bottom: 22 }}>
          <CartesianGrid stroke={CHART_BORDER} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Days', position: 'insideBottom', offset: -10, fill: CHART_AXIS, fontSize: 12 }}
          />
          <YAxis
            domain={priceDomain}
            tick={{ fontSize: 12, fill: CHART_AXIS }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPriceAxis}
            width={76}
            label={{
              value: 'Price per share',
              angle: -90,
              position: 'insideLeft',
              fill: CHART_AXIS,
              fontSize: 12,
            }}
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
            formatter={(value) => [formatPriceTooltip(value), 'Price']}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.08}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}

export function PortfolioChart({ data, height = 250 }) {
  const yTicks = getPortfolioYAxisTicks(data);
  const xTicks = getPortfolioXAxisTicks(data);
  const xDomain = [xTicks[0], xTicks[xTicks.length - 1]];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 18, left: 10, bottom: 30 }}>
        <CartesianGrid stroke={CHART_LIGHT_GRID} strokeDasharray="4 4" vertical={true} horizontal={true} />
        <XAxis
          type="number"
          dataKey="timestamp"
          domain={xDomain}
          ticks={xTicks}
          tick={{ fontSize: 11, fill: CHART_AXIS }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatTimeTick}
          label={{ value: 'Time', position: 'insideBottom', offset: -12, fill: CHART_AXIS, fontSize: 12 }}
          minTickGap={24}
        />
        <YAxis
          domain={[yTicks[0], yTicks[yTicks.length - 1]]}
          ticks={yTicks}
          tick={{ fontSize: 11, fill: CHART_AXIS }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
          width={86}
          label={{
            value: 'Portfolio value ($)',
            angle: -90,
            position: 'insideLeft',
            fill: CHART_AXIS,
            fontSize: 12,
          }}
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
          labelFormatter={(label) =>
            new Date(label).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })
          }
        />
        <Area type="monotone" dataKey="value" stroke={CHART_UP} strokeWidth={2} fill={CHART_UP} fillOpacity={0.08} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

import React from 'react';
import { format } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartGridStroke, chartTooltipStyle } from '../../../analysis/components/analysisUi';
import { formatCompactCurrency } from '../../../../shared/lib/compactCurrency';
import type { BalancePoint } from '../../lib/accountInsights';

const DAY_MS = 24 * 60 * 60 * 1000;

interface AccountBalanceChartProps {
  points: BalancePoint[];
  /** The account's own colour, so the line matches its card. */
  color: string;
  formatCurrency: (amount: number) => string;
}

/**
 * Running balance over the selected range, on a true time axis. Drawn as
 * steps: a balance holds until a record moves it, it never drifts between.
 */
export const AccountBalanceChart: React.FC<AccountBalanceChartProps> = ({ points, color, formatCurrency }) => {
  const span = points.length > 1 ? points[points.length - 1].time - points[0].time : 0;
  // Past a year, day-level ticks crowd each other; months with the year read better
  // ("Feb '24" — a bare "Feb 24" would read as a day).
  const tickPattern = span > 370 * DAY_MS ? "MMM ''yy" : 'MMM d';

  return (
    <div className="h-[200px] w-full sm:h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(time: number) => format(time, tickPattern)}
            tick={{ fontSize: 11 }}
            minTickGap={28}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) => formatCompactCurrency(value, formatCurrency)}
            tick={{ fontSize: 11 }}
            width={56}
            domain={['auto', 'auto']}
            tickLine={false}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelFormatter={(time: number) => format(time, 'MMM d, yyyy')}
            formatter={(value: number) => [formatCurrency(value), 'Balance']}
          />
          <Area
            type="stepAfter"
            dataKey="balance"
            stroke={color}
            fill={`${color}22`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

'use client'

import Chart, { type ReactGoogleChartProps } from 'react-google-charts'

export default function ChartClient({ ...props }: ReactGoogleChartProps) {
  return <Chart {...props} />
}

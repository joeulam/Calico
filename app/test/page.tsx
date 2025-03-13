import { LineChart } from '@mantine/charts';
import { data } from './data';
import { MantineProvider } from "@mantine/core";
import "@mantine/charts/styles.css";
import '@mantine/core/styles.css';

export default function Demo() {
  return (
    <>
    test
    <MantineProvider defaultColorScheme="light">
    <LineChart
      h={3000}
      data={data}
      dataKey="date"
      series={[
        { name: 'Apples', color: 'indigo.6' },
        { name: 'Oranges', color: 'blue.6' },
        { name: 'Tomatoes', color: 'teal.6' },
      ]}
      curveType="linear"
    />
    </MantineProvider>
    </>
    
  );
}
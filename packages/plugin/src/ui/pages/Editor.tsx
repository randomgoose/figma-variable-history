import { useState } from 'react';
import { Map } from './Map';
import { Table } from './Table';

export function Editor() {
  const [mode] = useState<'map' | 'table'>('table');

  return <div className="w-full h-full relative">{mode === 'map' ? <Map /> : <Table />}</div>;
}

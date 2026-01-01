import React, { useState, useCallback } from 'react';

const COLS = 26;
const ROWS = 50;
const COL_LETTERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

type CellData = { value: string; formula?: string };
type SheetData = Record<string, CellData>;

const Numbers: React.FC = () => {
  const [data, setData] = useState<SheetData>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const getCellId = (col: number, row: number) => `${COL_LETTERS[col]}${row + 1}`;

  const evaluateFormula = useCallback((formula: string): string => {
    if (!formula.startsWith('=')) return formula;
    try {
      const expr = formula.slice(1)
        .replace(/([A-Z])(\d+)/g, (_, col, row) => {
          const cell = data[`${col}${row}`];
          return cell?.value || '0';
        });
      return String(eval(expr));
    } catch {
      return '#ERROR';
    }
  }, [data]);

  const handleCellChange = (cellId: string, value: string) => {
    setData(prev => ({
      ...prev,
      [cellId]: { value: value.startsWith('=') ? evaluateFormula(value) : value, formula: value }
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="h-10 bg-gray-100 border-b flex items-center px-2 gap-2">
        <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">Bold</button>
        <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">Italic</button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <select className="text-sm border rounded px-2 py-1">
          <option>$0.00</option>
          <option>0%</option>
          <option>0.00</option>
        </select>
      </div>

      {/* Formula Bar */}
      <div className="h-8 border-b flex items-center px-2 gap-2 bg-gray-50">
        <span className="w-12 text-sm font-mono text-center bg-gray-200 rounded">
          {selected || ''}
        </span>
        <input
          type="text"
          value={selected ? (data[selected]?.formula || data[selected]?.value || '') : ''}
          onChange={(e) => selected && handleCellChange(selected, e.target.value)}
          className="flex-1 px-2 text-sm font-mono border rounded"
          placeholder="Enter value or formula"
        />
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="w-12 h-6 border bg-gray-200" />
              {COL_LETTERS.map(letter => (
                <th key={letter} className="w-24 h-6 border text-xs font-normal text-gray-600">
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row}>
                <td className="h-6 border bg-gray-100 text-xs text-center text-gray-600 sticky left-0">
                  {row + 1}
                </td>
                {COL_LETTERS.map((_, col) => {
                  const cellId = getCellId(col, row);
                  const cell = data[cellId];
                  return (
                    <td
                      key={col}
                      className={`border cursor-cell ${
                        selected === cellId ? 'ring-2 ring-blue-500 ring-inset' : ''
                      }`}
                      onClick={() => setSelected(cellId)}
                      onDoubleClick={() => setEditing(cellId)}
                    >
                      {editing === cellId ? (
                        <input
                          autoFocus
                          type="text"
                          value={cell?.formula || cell?.value || ''}
                          onChange={(e) => handleCellChange(cellId, e.target.value)}
                          onBlur={() => setEditing(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditing(null)}
                          className="w-full h-full px-1 text-sm outline-none"
                        />
                      ) : (
                        <div className="px-1 text-sm truncate">{cell?.value || ''}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Numbers;

'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchableSelect({
  items = [],
  getLabel = (x) => String(x),
  getValue = (x) => String(x),
  value = '',
  onChange,
  placeholder = 'Select...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const match = items.find((i) => getValue(i) === value);
    return match ? getLabel(match) : '';
  }, [items, value, getLabel, getValue]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 100);
    return items.filter((i) => getLabel(i).toLowerCase().includes(q)).slice(0, 100);
  }, [items, getLabel, query]);

  const handleSelect = (val) => {
    onChange && onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
          ) : (
            filtered.map((item) => {
              const v = getValue(item);
              const label = getLabel(item);
              const active = v === value;
              return (
                <button
                  type="button"
                  key={v}
                  onClick={() => handleSelect(v)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                  role="option"
                  aria-selected={active}
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


"use client";

import Link from "next/link";
import { useState } from "react";

export type WaterPriceArea = {
  name: string;
  prices: Partial<Record<number, number>>;
};

const litresFormat = new Intl.NumberFormat("en-NZ");
const priceFormat = new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
  minimumFractionDigits: 0,
});

function normalizeArea(value: string) {
  return value.trim().normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function WaterPriceTable({ areas, volumes }: { areas: WaterPriceArea[]; volumes: number[] }) {
  const [search, setSearch] = useState("");
  const query = normalizeArea(search);
  const matches = areas.filter((area) => normalizeArea(area.name).includes(query));

  return (
    <>
      <label className="water-price-search">
        Search delivery areas
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. Albany" />
      </label>
      {matches.length > 0 ? (
        <div className="price-table water-table">
          <table aria-label="Water delivery prices in New Zealand dollars">
            <thead>
              <tr>
                <th scope="col">Area</th>
                {volumes.map((volume) => <th scope="col" key={volume}>{litresFormat.format(volume)} L</th>)}
              </tr>
            </thead>
            <tbody>
              {matches.map((area) => (
                <tr key={area.name}>
                  <th scope="row">{area.name}</th>
                  {volumes.map((volume) => {
                    const price = area.prices[volume];
                    return <td key={volume}>{price === undefined ? "—" : priceFormat.format(price / 100)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="water-price-note" role="status">No delivery areas match your search.</p>
      )}
      <p className="water-price-note">For areas or load sizes without a listed price, <Link href="/contact">contact us for a quote</Link>.</p>
    </>
  );
}

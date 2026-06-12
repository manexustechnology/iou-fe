"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { iouApi } from "@/lib/iou-api";
import usePartyStore from "@/app/stores/usePartyStore";
import type { Party } from "@/types/iou";

export default function PartySelector() {
  const parties = usePartyStore.useParties();
  const selectedParty = usePartyStore.useSelectedParty();
  const setParties = usePartyStore.useSetParties();
  const setSelectedParty = usePartyStore.useSetSelectedParty();

  const { data, isLoading } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const res = await iouApi.listParties();
      return res.data.data as Party[];
    },
  });

  useEffect(() => {
    if (!data) return;
    setParties(data);
    if (data.length > 0 && !selectedParty) {
      setSelectedParty(data[0]);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = parties.find((p) => p.party === e.target.value);
    setSelectedParty(found ?? null);
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="party-selector"
        className="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Acting as:
      </label>
      <select
        id="party-selector"
        value={selectedParty?.party ?? ""}
        onChange={handleChange}
        disabled={isLoading}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
      >
        {isLoading && <option value="">Loading…</option>}
        {parties.map((p) => (
          <option key={p.party} value={p.party}>
            {p.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}

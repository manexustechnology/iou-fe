"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { iouApi } from "@/lib/iou-api";
import { getPartyKeys, savePartyKey } from "@/lib/party-keys";
import usePartyStore from "@/app/stores/usePartyStore";
import type { Party } from "@/types/iou";

const shortName = (partyId: string) => partyId.split("::")[0] || partyId;

export default function PartySelector() {
  const queryClient = useQueryClient();
  const parties = usePartyStore.useParties();
  const selectedParty = usePartyStore.useSelectedParty();
  const setParties = usePartyStore.useSetParties();
  const setSelectedParty = usePartyStore.useSetSelectedParty();

  // Parties this browser holds an API key for (read after mount: localStorage).
  const [keyedIds, setKeyedIds] = useState<string[]>([]);
  const [newKey, setNewKey] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setKeyedIds(Object.keys(getPartyKeys()));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const res = await iouApi.listParties();
      return res.data.data as Party[];
    },
    enabled: keyedIds.length > 0,
  });

  const toParty = (partyId: string): Party =>
    (data ?? parties).find((p) => p.party === partyId) ?? {
      party: partyId,
      displayName: shortName(partyId),
    };

  const options = keyedIds.map(toParty);

  useEffect(() => {
    if (!data) return;
    setParties(data);
    if (keyedIds.length > 0 && !selectedParty) {
      setSelectedParty(toParty(keyedIds[0]));
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParty(e.target.value ? toParty(e.target.value) : null);
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = newKey.trim();
    if (!key) return;
    setAdding(true);
    try {
      const res = await iouApi.whoami(key);
      const partyId = res.data.data.party;
      savePartyKey(partyId, key);
      setKeyedIds(Object.keys(getPartyKeys()));
      setSelectedParty(toParty(partyId));
      setNewKey("");
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success(`Acting as ${shortName(partyId)}`);
    } catch {
      toast.error("That API key was not accepted");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {options.length > 0 && (
        <>
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
            {options.map((p) => (
              <option key={p.party} value={p.party}>
                {p.displayName}
              </option>
            ))}
          </select>
        </>
      )}
      <form onSubmit={handleAddKey} className="flex items-center gap-2">
        <label htmlFor="party-api-key" className="sr-only">
          API key
        </label>
        <input
          id="party-api-key"
          type="password"
          autoComplete="off"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={options.length > 0 ? "Add another API key" : "Enter your API key"}
          className="w-44 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={adding || !newKey.trim()}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {adding ? "Checking…" : "Add"}
        </button>
      </form>
    </div>
  );
}

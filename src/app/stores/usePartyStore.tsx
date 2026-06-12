"use client";

import { create } from "zustand";
import { produce } from "immer";
import { createSelectorHooks } from "auto-zustand-selectors-hook";
import type { Party } from "@/types/iou";

type PartyStoreType = {
  parties: Party[];
  selectedParty: Party | null;
  setParties: (parties: Party[]) => void;
  setSelectedParty: (party: Party | null) => void;
};

const usePartyStoreBase = create<PartyStoreType>((set) => ({
  parties: [],
  selectedParty: null,
  setParties: (parties) => {
    set(
      produce<PartyStoreType>((state) => {
        state.parties = parties;
      }),
    );
  },
  setSelectedParty: (party) => {
    set(
      produce<PartyStoreType>((state) => {
        state.selectedParty = party;
      }),
    );
  },
}));

const usePartyStore = createSelectorHooks(usePartyStoreBase);
export default usePartyStore;

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/layouts/Layout";
import Button from "@/components/button/Button";
import PartySelector from "@/components/iou/PartySelector";
import IssueIouModal from "@/components/iou/IssueIouModal";
import SplitIouModal from "@/components/iou/SplitIouModal";
import MergeIouModal from "@/components/iou/MergeIouModal";
import ProposeTransferModal from "@/components/iou/ProposeTransferModal";
import usePartyStore from "@/app/stores/usePartyStore";
import { iouApi } from "@/lib/iou-api";
import type { IouContract } from "@/types/iou";

export default function DashboardPage() {
  const selectedParty = usePartyStore.useSelectedParty();
  const parties = usePartyStore.useParties();

  const [showIssue, setShowIssue] = useState(false);
  const [splitTarget, setSplitTarget] = useState<IouContract | null>(null);
  const [mergeTarget, setMergeTarget] = useState<IouContract | null>(null);
  const [transferTarget, setTransferTarget] = useState<IouContract | null>(null);

  const { data: ious, isLoading } = useQuery({
    queryKey: ["ious", selectedParty?.party],
    queryFn: async () => {
      const res = await iouApi.listIous(selectedParty!.party);
      return res.data.data as IouContract[];
    },
    enabled: !!selectedParty,
  });

  const isBank =
    selectedParty?.displayName === "Bank" ||
    selectedParty?.party?.startsWith("Bank::");

  function displayName(partyId: string) {
    return parties.find((p) => p.party === partyId)?.displayName ?? `${partyId.slice(0, 16)}…`;
  }

  return (
    <Layout withNavbar className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IOU Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your IOU contracts</p>
          </div>
          <div className="flex items-center gap-4">
            <PartySelector />
            {isBank && (
              <Button variant="primary" onClick={() => setShowIssue(true)}>
                Issue IOU
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Contract ID", "Issuer", "Owner", "Amount", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && !selectedParty && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    Select a party to view IOUs
                  </td>
                </tr>
              )}
              {!isLoading && selectedParty && (ious ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    No IOUs found
                  </td>
                </tr>
              )}
              {(ious ?? []).map((iou) => {
                const isOwner = iou.owner === selectedParty?.party;
                const hasMergeTarget = (ious ?? []).some(
                  (c) =>
                    c.contractId !== iou.contractId &&
                    c.issuer === iou.issuer &&
                    c.owner === iou.owner,
                );
                return (
                  <tr key={iou.contractId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {iou.contractId.slice(0, 16)}…
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{displayName(iou.issuer)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{displayName(iou.owner)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{iou.amount}</td>
                    <td className="px-4 py-3">
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="blue"
                            className="!text-xs !px-2 !py-1"
                            onClick={() => setSplitTarget(iou)}
                          >
                            Split
                          </Button>
                          <Button
                            variant="green"
                            className="!text-xs !px-2 !py-1"
                            disabled={!hasMergeTarget}
                            onClick={() => setMergeTarget(iou)}
                          >
                            Merge
                          </Button>
                          <Button
                            variant="yellow"
                            className="!text-xs !px-2 !py-1"
                            onClick={() => setTransferTarget(iou)}
                          >
                            Transfer
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isBank && selectedParty && (
        <IssueIouModal
          isOpen={showIssue}
          onClose={() => setShowIssue(false)}
          bankParty={selectedParty.party}
          parties={parties}
        />
      )}
      <SplitIouModal
        iou={splitTarget}
        onClose={() => setSplitTarget(null)}
        actingParty={selectedParty?.party ?? ""}
      />
      <MergeIouModal
        iou={mergeTarget}
        onClose={() => setMergeTarget(null)}
        actingParty={selectedParty?.party ?? ""}
        allIous={ious ?? []}
      />
      <ProposeTransferModal
        iou={transferTarget}
        onClose={() => setTransferTarget(null)}
        actingParty={selectedParty?.party ?? ""}
        parties={parties}
      />
    </Layout>
  );
}

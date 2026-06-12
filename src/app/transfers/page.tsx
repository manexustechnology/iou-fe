"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Layout from "@/layouts/Layout";
import Button from "@/components/button/Button";
import PartySelector from "@/components/iou/PartySelector";
import ConfirmationDialog from "@/components/dialog/ConfirmationDialog";
import usePartyStore from "@/app/stores/usePartyStore";
import { iouApi } from "@/lib/iou-api";
import type { IouTransferContract } from "@/types/iou";

export default function TransfersPage() {
  const selectedParty = usePartyStore.useSelectedParty();
  const parties = usePartyStore.useParties();
  const queryClient = useQueryClient();

  const [confirmAccept, setConfirmAccept] = useState<IouTransferContract | null>(null);
  const [confirmReject, setConfirmReject] = useState<IouTransferContract | null>(null);

  const { data: transfers, isLoading } = useQuery({
    queryKey: ["transfers", selectedParty?.party],
    queryFn: async () => {
      const res = await iouApi.listTransfers(selectedParty!.party);
      return res.data.data as IouTransferContract[];
    },
    enabled: !!selectedParty,
  });

  const acceptMutation = useMutation({
    mutationFn: (t: IouTransferContract) =>
      iouApi.acceptTransfer(t.contractId, selectedParty?.party ?? ""),
    onSuccess: () => {
      toast.success("Transfer accepted");
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["ious"] });
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed",
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (t: IouTransferContract) =>
      iouApi.rejectTransfer(t.contractId, selectedParty?.party ?? ""),
    onSuccess: () => {
      toast.success("Transfer rejected");
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["ious"] });
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed",
      );
    },
  });

  function displayName(partyId: string) {
    return parties.find((p) => p.party === partyId)?.displayName ?? `${partyId.slice(0, 16)}…`;
  }

  return (
    <Layout withNavbar className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Transfers</h1>
            <p className="text-sm text-gray-500 mt-1">Accept or reject incoming IOU transfers</p>
          </div>
          <PartySelector />
        </div>

        <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Transfer ID", "Issuer", "Current Owner", "Amount", "Offered to", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && !selectedParty && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    Select a party to view pending transfers
                  </td>
                </tr>
              )}
              {!isLoading && selectedParty && (transfers ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    No pending transfers
                  </td>
                </tr>
              )}
              {(transfers ?? []).map((t) => (
                <tr key={t.contractId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {t.contractId.slice(0, 16)}…
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{displayName(t.iou.issuer)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{displayName(t.iou.owner)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.iou.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{displayName(t.newOwner)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="green"
                        className="!text-xs !px-2 !py-1"
                        isLoading={acceptMutation.isPending}
                        onClick={() => setConfirmAccept(t)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="red"
                        className="!text-xs !px-2 !py-1"
                        isLoading={rejectMutation.isPending}
                        onClick={() => setConfirmReject(t)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!confirmAccept}
        setIsOpen={(open) => {
          if (!open) setConfirmAccept(null);
        }}
        message={`Accept transfer of ${confirmAccept?.iou.amount} from ${displayName(confirmAccept?.iou.owner ?? "")}?`}
        onConfirm={() => {
          if (confirmAccept) acceptMutation.mutate(confirmAccept);
          setConfirmAccept(null);
        }}
      />
      <ConfirmationDialog
        isOpen={!!confirmReject}
        setIsOpen={(open) => {
          if (!open) setConfirmReject(null);
        }}
        message={`Reject transfer of ${confirmReject?.iou.amount} from ${displayName(confirmReject?.iou.owner ?? "")}?`}
        onConfirm={() => {
          if (confirmReject) rejectMutation.mutate(confirmReject);
          setConfirmReject(null);
        }}
      />
    </Layout>
  );
}

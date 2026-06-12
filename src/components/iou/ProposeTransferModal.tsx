"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "@/components/button/Button";
import SelectInput from "@/components/form/SelectInput";
import { iouApi } from "@/lib/iou-api";
import type { IouContract, Party } from "@/types/iou";

type ProposeForm = {
  newOwner: string;
};

type Props = {
  iou: IouContract | null;
  onClose: () => void;
  actingParty: string;
  parties: Party[];
};

export default function ProposeTransferModal({ iou, onClose, actingParty, parties }: Props) {
  const queryClient = useQueryClient();
  const methods = useForm<ProposeForm>();

  const mutation = useMutation({
    mutationFn: (data: ProposeForm) =>
      iouApi.proposeTransfer({ contractId: iou!.contractId, newOwner: data.newOwner }, actingParty),
    onSuccess: () => {
      toast.success("Transfer proposed");
      queryClient.invalidateQueries({ queryKey: ["ious"] });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      methods.reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Failed to propose transfer";
      toast.error(msg);
    },
  });

  const recipientOptions = parties
    .filter((p) => p.party !== iou?.owner)
    .map((p) => ({ value: p.party, label: p.displayName }));

  return (
    <Dialog open={!!iou} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 px-4">
        <DialogPanel className="bg-white relative shadow-lg text-gray-900 rounded-lg p-6 w-full max-w-md">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X strokeWidth={2.5} size={20} />
          </button>

          <h2 className="text-lg font-semibold mb-1">Propose Transfer</h2>
          <p className="text-sm text-gray-500 mb-5">
            Amount: <span className="font-medium text-gray-800">{iou?.amount}</span>
          </p>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <SelectInput
                id="newOwner"
                label="Transfer to"
                placeholder="Select recipient…"
                validation={{ required: "Recipient is required" }}
                options={recipientOptions}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="yellow" isLoading={mutation.isPending}>
                  Propose
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

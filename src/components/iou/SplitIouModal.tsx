"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "@/components/button/Button";
import Input from "@/components/form/Input";
import { iouApi } from "@/lib/iou-api";
import type { IouContract } from "@/types/iou";

type SplitForm = {
  splitAmount: string;
};

type Props = {
  iou: IouContract | null;
  onClose: () => void;
  actingParty: string;
};

export default function SplitIouModal({ iou, onClose, actingParty }: Props) {
  const queryClient = useQueryClient();
  const methods = useForm<SplitForm>();
  const maxAmount = iou ? parseFloat(iou.amount) : 0;

  const mutation = useMutation({
    mutationFn: (data: SplitForm) =>
      iouApi.splitIou({ contractId: iou!.contractId, splitAmount: data.splitAmount }, actingParty),
    onSuccess: () => {
      toast.success("IOU split");
      queryClient.invalidateQueries({ queryKey: ["ious"] });
      methods.reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Failed to split IOU";
      toast.error(msg);
    },
  });

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

          <h2 className="text-lg font-semibold mb-1">Split IOU</h2>
          <p className="text-sm text-gray-500 mb-5">
            Current amount: <span className="font-medium text-gray-800">{iou?.amount}</span>
          </p>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <Input
                id="splitAmount"
                label="Split amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="30.00"
                validation={{
                  required: "Split amount is required",
                  min: { value: 0.01, message: "Must be > 0" },
                  max: { value: maxAmount - 0.01, message: `Must be < ${maxAmount}` },
                }}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="blue" isLoading={mutation.isPending}>
                  Split
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

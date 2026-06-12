"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "@/components/button/Button";
import SelectInput from "@/components/form/SelectInput";
import { iouApi } from "@/lib/iou-api";
import type { IouContract } from "@/types/iou";

type MergeForm = {
  otherContractId: string;
};

type Props = {
  iou: IouContract | null;
  onClose: () => void;
  actingParty: string;
  allIous: IouContract[];
};

export default function MergeIouModal({ iou, onClose, actingParty, allIous }: Props) {
  const queryClient = useQueryClient();
  const methods = useForm<MergeForm>();

  const compatibleIous = allIous.filter(
    (c) =>
      c.contractId !== iou?.contractId &&
      c.issuer === iou?.issuer &&
      c.owner === iou?.owner,
  );

  const mutation = useMutation({
    mutationFn: (data: MergeForm) =>
      iouApi.mergeIou(
        { contractId: iou!.contractId, otherContractId: data.otherContractId },
        actingParty,
      ),
    onSuccess: () => {
      toast.success("IOUs merged");
      queryClient.invalidateQueries({ queryKey: ["ious"] });
      methods.reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Failed to merge IOUs";
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

          <h2 className="text-lg font-semibold mb-1">Merge IOUs</h2>
          <p className="text-sm text-gray-500 mb-5">
            Primary: <span className="font-medium text-gray-800">{iou?.amount}</span> (
            {iou?.contractId.slice(0, 10)}…)
          </p>

          {compatibleIous.length === 0 ? (
            <p className="text-sm text-gray-500">No compatible IOUs to merge with.</p>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <SelectInput
                  id="otherContractId"
                  label="Merge with"
                  placeholder="Select IOU…"
                  validation={{ required: "Please select an IOU to merge" }}
                  options={compatibleIous.map((c) => ({
                    value: c.contractId,
                    label: `${c.amount} (${c.contractId.slice(0, 10)}…)`,
                  }))}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="green" isLoading={mutation.isPending}>
                    Merge
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}

          {compatibleIous.length === 0 && (
            <div className="flex justify-end mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

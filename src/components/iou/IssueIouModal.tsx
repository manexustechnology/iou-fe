"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "@/components/button/Button";
import Input from "@/components/form/Input";
import SelectInput from "@/components/form/SelectInput";
import { iouApi } from "@/lib/iou-api";
import type { Party } from "@/types/iou";

type IssueForm = {
  owner: string;
  amount: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bankParty: string;
  parties: Party[];
};

export default function IssueIouModal({ isOpen, onClose, bankParty, parties }: Props) {
  const queryClient = useQueryClient();
  const methods = useForm<IssueForm>();

  const mutation = useMutation({
    mutationFn: (data: IssueForm) =>
      iouApi.issueIou({ issuer: bankParty, owner: data.owner, amount: data.amount }, bankParty),
    onSuccess: () => {
      toast.success("IOU issued");
      queryClient.invalidateQueries({ queryKey: ["ious"] });
      methods.reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Failed to issue IOU";
      toast.error(msg);
    },
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 px-4">
        <DialogPanel className="bg-white relative shadow-lg text-gray-900 rounded-lg p-6 w-full max-w-md">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X strokeWidth={2.5} size={20} />
          </button>

          <h2 className="text-lg font-semibold mb-5">Issue IOU</h2>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <SelectInput
                id="owner"
                label="Owner"
                placeholder="Select owner…"
                validation={{ required: "Owner is required" }}
                options={parties
                  .filter((p) => p.party !== bankParty)
                  .map((p) => ({ value: p.party, label: p.displayName }))}
              />
              <Input
                id="amount"
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="100.00"
                validation={{
                  required: "Amount is required",
                  min: { value: 0.01, message: "Amount must be > 0" },
                }}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={mutation.isPending}>
                  Issue
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

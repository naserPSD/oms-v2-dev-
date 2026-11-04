import React, { useEffect } from "react";
import { FormController as Controller } from "@/components/common/FormController";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";

const UserSubscriptionFormModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  selectedPlan,
}) => {
  useEffect(() => {
    if (showModal && selectedPlan) {
      reset({
        id: 0,
        planId: selectedPlan.id,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 16),
        statusId: 228,
        paymentMethod: "credit_card",
        autoRenew: true,
      });
    }
  }, [showModal, selectedPlan, reset]);

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={`Subscribe to ${selectedPlan?.name || "Plan"}`}
      size="md"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        <div className="grid grid-cols-12 gap-x-4 gap-y-4">
          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Start Date"
                type="datetime-local"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12"
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="End Date"
                type="datetime-local"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12"
              />
            )}
          />

          <Controller
            name="paymentMethod"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Payment Method"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="e.g., credit_card, bkash"
                className="col-span-12"
              />
            )}
          />

          <Controller
            name="statusId"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Status ID"
                type="number"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                className="col-span-12"
              />
            )}
          />

          <Controller
            name="autoRenew"
            control={control}
            render={({ field }) => (
              <SwitchButton
                label="Auto Renew"
                enabled={field.value}
                onClick={() => field.onChange(!field.value)}
                enabledText="Yes"
                disabledText="No"
                className="col-span-12"
              />
            )}
          />

          <div className="col-span-12 flex justify-center items-center gap-4 mt-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={isLoading}
              loading={isLoading}
            >
              Confirm Subscription
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default UserSubscriptionFormModal;

import React from "react";
import { FormController as Controller } from "@/components/common/FormController";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/ui/FileUpload";
import DatePicker from "@/components/ui/DatePicker";
import { parseISO } from "date-fns/parseISO";
import { format } from "date-fns/format";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonStore } from "@/store/useCommonStore";
import {
  XMarkIcon,
  CalculatorIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { FaCheckCircle } from "react-icons/fa";
import Checkbox from "@/components/ui/Checkbox";
import helpers from "@/utils/helpers";

const AddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  // errors,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const payItemTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_types")
      ?.statuses ?? [];

  const payItemTCategoryList =
    dropdowns.statusGroupList?.find((s) => s.code === "pay_item_categories")
      ?.statuses ?? [];

  const MonthList = helpers.monthOptions() ?? [];

  const payItemCalculationMethodList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "pay_item_calculation_methods",
    )?.statuses ?? [];

  const getCalculationTypeName = (id) => {
    const type = payItemCalculationMethodList.find(
      (t) => t.id === parseInt(id),
    );
    return type ? type.label : "";
  };

  // Helper to show/hide calc_value field based on calculation type
  const shouldShowCalcValue = () => {
    const calcType = getCalculationTypeName(watch("calculationMethodId"));
    return ["FIXED", "PERCENTAGE", "TIERED"].includes(calcType);
  };

  // Helper to show/hide formula field
  const shouldShowFormulaField = () => {
    const calcType = getCalculationTypeName(watch("calculationMethodId"));
    return calcType === "FORMULA";
  };

  const payPeriodMonthExist = watch("payPeriodMonthExist");

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        // title={`${watch("id") ? "Update" : "Add New"} Payroll`}
        title={`Create New Payroll Month`}
        size="md"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4 ">
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="payPeriodMonth"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Pay Period Month"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={MonthList}
                  placeholder="Select Pay period Month"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="payPeriodYear"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="number"
                  min="1"
                  label="Pay Period Year"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="(e.g. 2023)"
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            {payPeriodMonthExist && (
              <Controller
                name="forceReRun"
                control={control}
                render={({ field }) => (
                  <SwitchButton
                    label="Force Re-run? (Re-run even if there is existing data). This will overwrite existing payroll data for the selected period."
                    enabled={field.value}
                    onClick={() => field.onChange(!field.value)}
                    enabledText="Yes"
                    disabledText="No"
                    className="col-span-12 lg:col-span-12 sm:col-span-12"
                  />
                )}
              />
            )}

            <Controller
              name="remarks"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  type="textarea"
                  label="Remarks"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Remarks"
                  className="col-span-12 lg:col-span-12 sm:col-span-12"
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 col-span-12"
                disabled={isLoading}
                loading={isLoading}
              >
                Create Payroll
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 col-span-12"
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateModal;

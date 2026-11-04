import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import { Button } from "@/components/ui/button";
import ButtonTw from "@/components/ui/ButtonTw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { Separator } from "@/components/ui/separator";
import SwitchButton from "@/components/ui/SwitchButton";
import { TimePicker } from "@/components/ui/TimePicker";
import { useCommonStore } from "@/store/useCommonStore";
import { getTimezones } from "@/utils/timezones";
import { Building2, Clock, MapPin, Phone, Plus, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import "suneditor/dist/css/suneditor.min.css";
import LocationPreview from "./LocationPreview";

const OfficeAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  usersArray,
  setValue,
  // errors,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const officeTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "office_types")
      ?.statuses ?? [];
  const latitude = watch("address.gmapLatitude");
  const longitude = watch("address.gmapLongitude");
  const formattedTimezones = useMemo(() => getTimezones(), []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "officeShifts",
  });

  const hasShiftValue = watch("hasShift");

  useEffect(() => {
    if (hasShiftValue && fields.length === 0) {
      append({
        name: "",
        startTime: "",
        delayStartTime: "",
        endTime: "",
        earlyEndTime: "",
      });
    }
  }, [hasShiftValue, fields, append]);
  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Office`}
        size="4xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        {/* <form onSubmit={handleSubmit(submitForm)} className="space-y-6 "> */}
        <form onSubmit={handleSubmit(submitForm, (errors) => console.log('errors => ', errors))} className="space-y-6">
          {/* Basic Information Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-500" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Office Name"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Enter office name"
                    />
                  )}
                />
                <Controller
                  name="typeId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Office Types"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      options={officeTypeList}
                      placeholder="Select office type"
                    />
                  )}
                />
                <Controller
                  name="managerId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Manager"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      options={usersArray}
                      placeholder="Select manager"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Section */}

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-purple-500" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="address.phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Phone"
                      value={field.value}
                      type="tel"
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Enter phone number"
                    />
                  )}
                />
                <Controller
                  name="address.email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Email"
                      value={field.value}
                      type="email"
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Enter email"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address & Location Section */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-orange-500" />
                Address & Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Controller
                    name="address.countryId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Country"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        options={dropdowns.countryList?.map((c) => ({
                          value: c.id,
                          label: c.name,
                        }))}
                        placeholder="Select country"
                      />
                    )}
                  />
                  <Controller
                    name="address.city"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        label="City"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        placeholder="Enter city"
                      />
                    )}
                  />
                  <Controller
                    name="address.addressType"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Address Type"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        options={dropdowns.addressTypes}
                        placeholder="Select address type"
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Controller
                    name="address.address"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        label="Address"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        placeholder="Enter address"
                      />
                    )}
                  />
                  <Controller
                    name="address.postalCode"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        label="Postal Code"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        placeholder="Enter postal code"
                      />
                    )}
                  />
                  <Controller
                    name="address.timezone"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Address Timezone"
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val)
                          setValue("timezone", val);
                        }}
                        error={fieldState.error?.message}
                        options={formattedTimezones}
                        placeholder="Select timezone"
                      />
                    )}
                  />
                </div>{" "}
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Google Maps Integration
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    <Controller
                      name="address.mapLink"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          label="Google Maps Link"
                          placeholder="Paste full Google Maps link"
                          value={field.value}
                          type="url"
                          onChange={(value) => {
                            console.log('value', value);
                            field.onChange(value);

                            const match = value.match(
                              /@(-?\d+\.\d+),(-?\d+\.\d+)/
                            );
                            console.log('match', match);

                            if (match) {
                              setValue("address.gmapLatitude", match[1]);
                              setValue("address.gmapLongitude", match[2]);
                            } else {
                              setValue("address.gmapLatitude", "");
                              setValue("address.gmapLongitude", "");
                            }
                          }}
                          error={fieldState.error?.message}
                        />
                      )}
                    />

                    {/* <Controller
                      name="address.gmapLatitude"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          label="Gmap Latitude"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          placeholder="Enter latitude"
                        />
                      )}
                    />

                    <Controller
                      name="address.gmapLongitude"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          label="Gmap Longitude"
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          placeholder="Enter longitude"
                        />
                      )}
                    /> */}
                  </div>

                  {/* {latitude && longitude && (
                    <LocationPreview
                      latitude={latitude}
                      longitude={longitude}
                    />
                  )} */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shift & Time Configuration Section */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-green-500" />
                Shift & Time Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6">
                  <Controller
                    name="hasShift"
                    control={control}
                    render={({ field }) => (
                      <SwitchButton
                        label="Has Shift?"
                        enabled={field.value}
                        onClick={() => field.onChange(!field.value)}
                        enabledText="Yes"
                        disabledText="No"
                        className=""
                      />
                    )}
                  />

                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label=" Timezone"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        options={formattedTimezones}
                        placeholder="Select timezone"
                        className="md:col-span-2"
                      />
                    )}
                  />
                </div>

                <Separator />
                {/* Fixed time fields (hasShift = false) */}
                {!hasShiftValue && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      "startTime",
                      "delayStartTime",
                      "endTime",
                      "earlyEndTime",
                    ].map((fieldName) => (
                      <Controller
                        key={fieldName}
                        control={control}
                        name={fieldName}
                        render={({ field, fieldState }) => (
                          <TimePicker
                            label={
                              fieldName === "startTime"
                                ? "Start Time"
                                : fieldName === "delayStartTime"
                                ? "Delay Start Time"
                                : fieldName === "endTime"
                                ? "End Time"
                                : "Early End Time"
                            }
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Shift fields (hasShift = true) */}
                {hasShiftValue && (
                  <div className="space-y-4">
                    {fields.map((item, index) => (
                      <div
                        key={item.id}
                        className="border rounded-xl p-4 space-y-4 relative  "
                      >
                        {fields.length > 1 && (
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        <Controller
                          name={`officeShifts.${index}.name`}
                          control={control}
                          render={({ field, fieldState }) => (
                            <Input
                              label="Shift Name"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                              placeholder={
                                "Enter shift name here e.g. Morning Shift"
                              }
                            />
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            "startTime",
                            "delayStartTime",
                            "endTime",
                            "earlyEndTime",
                          ].map((timeField) => (
                            <Controller
                              key={timeField}
                              name={`officeShifts.${index}.${timeField}`}
                              control={control}
                              render={({ field, fieldState }) => (
                                <TimePicker
                                  label={
                                    timeField === "startTime"
                                      ? "Start Time"
                                      : timeField === "delayStartTime"
                                      ? "Delay Start Time"
                                      : timeField === "endTime"
                                      ? "End Time"
                                      : "Early End Time"
                                  }
                                  value={field.value}
                                  onChange={field.onChange}
                                  error={fieldState.error?.message}
                                />
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() =>
                        append({
                          name: "",
                          startTime: "",
                          delayStartTime: "",
                          endTime: "",
                          earlyEndTime: "",
                        })
                      }
                    >
                      <Plus className="w-4 h-4" />
                      Add More Shift
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="col-span-12 flex justify-center items-center gap-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold mt-4 col-span-12"
              disabled={isLoading}
              loading={isLoading}
            >
              Submit
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
        </form>
      </ModalTw>
    </div>
  );
};

export default OfficeAddOrUpdateModal;

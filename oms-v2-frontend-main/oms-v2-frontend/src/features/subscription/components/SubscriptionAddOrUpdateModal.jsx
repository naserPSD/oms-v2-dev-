import React, { useEffect, useState } from "react";
import { FormController as Controller } from "@/components/common/FormController";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

// Parse features HTML string → { storage, projects, features[] }
function parseFeaturesHtml(html) {
  if (!html) return { storage: "", projects: "", features: [] };
  if (typeof html === "object")
    return {
      storage: html.storage ?? "",
      projects: String(html.projects ?? ""),
      features: html.features ?? [],
    };
  const text = String(html)
    .replace(/<[^>]*>/g, "")
    .trim();
  try {
    const parsed = JSON.parse(text);
    return {
      storage: parsed.storage ?? "",
      projects: String(parsed.projects ?? ""),
      features: parsed.features ?? [],
    };
  } catch {
    return { storage: "", projects: "", features: [] };
  }
}

// Build features HTML string from structured state
function buildFeaturesHtml(storage, projects, featuresList) {
  const obj = {};
  if (storage) obj.storage = storage;
  if (projects)
    obj.projects = isNaN(Number(projects)) ? projects : Number(projects);
  obj.features = featuresList.filter(Boolean);
  return `<p>${JSON.stringify(obj)}</p>`;
}

function FeaturesBuilder({ value, onChange }) {
  const parsed = parseFeaturesHtml(value);
  const [storage, setStorage] = useState(parsed.storage);
  const [projects, setProjects] = useState(parsed.projects);
  const [featuresList, setFeaturesList] = useState(
    parsed.features.length > 0 ? parsed.features : [""],
  );

  // Sync inward when edit opens (value changes from outside)
  useEffect(() => {
    const p = parseFeaturesHtml(value);
    setStorage(p.storage);
    setProjects(String(p.projects));
    setFeaturesList(p.features.length > 0 ? p.features : [""]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync(newStorage, newProjects, newFeatures) {
    onChange(buildFeaturesHtml(newStorage, newProjects, newFeatures));
  }

  function handleStorageChange(val) {
    setStorage(val);
    sync(val, projects, featuresList);
  }

  function handleProjectsChange(val) {
    setProjects(val);
    sync(storage, val, featuresList);
  }

  function handleFeatureChange(index, val) {
    const updated = featuresList.map((f, i) => (i === index ? val : f));
    setFeaturesList(updated);
    sync(storage, projects, updated);
  }

  function addFeature() {
    const updated = [...featuresList, ""];
    setFeaturesList(updated);
    sync(storage, projects, updated);
  }

  function removeFeature(index) {
    const updated = featuresList.filter((_, i) => i !== index);
    const final = updated.length > 0 ? updated : [""];
    setFeaturesList(final);
    sync(storage, projects, final);
  }

  return (
    <div className="space-y-3">
      {/* Storage + Projects */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Storage
          </label>
          <input
            type="text"
            value={storage}
            onChange={(e) => handleStorageChange(e.target.value)}
            placeholder="e.g. 10GB"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Projects
          </label>
          <input
            type="text"
            value={projects}
            onChange={(e) => handleProjectsChange(e.target.value)}
            placeholder="e.g. 5 or Unlimited"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dynamic Features List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Features
          </label>
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Plus size={13} /> Add Feature
          </button>
        </div>

        <div className="space-y-2">
          {featuresList.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                disabled={featuresList.length === 1 && !feature}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SubscriptionAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  setValue,
}) => {
  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue && setValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, setValue]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Subscription Plan`}
        size="2xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Plan Name"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Plan Name"
                  className="col-span-12"
                />
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  label="Slug"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Slug"
                  disabled={true}
                  className="col-span-12"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <label className="col-span-12 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <span>Description</span>
                      <span className="text-red-500 font-bold leading-none select-none">*</span>
                    </span>
                  </label>
                  <Textarea
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Enter Plan Description"
                    className="col-span-12 mb-3"
                  />
                </>
              )}
            />

            <Controller
              name="currency"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Currency"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="e.g., BDT, USD"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            <Controller
              name="monthlyPrice"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Per User Monthly Price"
                  type="number"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Per User Monthly Price"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            <Controller
              name="yearlyPrice"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Per User Yearly Price"
                  type="number"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Per User Yearly Price"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            <Controller
              name="minUsers"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Minimum Users"
                  type="number"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Minimum Users"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            <Controller
              name="maxUsers"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Maximum Users"
                  type="number"
                  required={true}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Maximum Users"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            <Controller
              name="trialDays"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Trial Days"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Trial Days"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            <Controller
              name="sortOrder"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Sort Order"
                  type="number"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Enter Sort Order"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="Active"
                  enabled={field.value}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />
            <Controller
              name="isPopular"
              control={control}
              render={({ field }) => (
                <SwitchButton
                  label="Most Popular (Badge on Website)"
                  enabled={Boolean(field.value)}
                  onClick={() => field.onChange(!field.value)}
                  enabledText="Yes"
                  disabledText="No"
                  className="col-span-12 lg:col-span-6"
                />
              )}
            />

            {/* Features Builder */}
            <div className="col-span-12 mb-4">
              <Controller
                name="features"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Features
                    </label>
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <FeaturesBuilder
                        key={showModal ? "open" : "closed"}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                    {fieldState.error?.message && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4"
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

export default SubscriptionAddOrUpdateModal;

// src/features/my-profile/tabs/modals/AddLanguageModal.jsx
"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import RestApi from "@/utils/RestApi";
import helpers, { toaster } from "@/utils/helpers";
import ButtonTw from "@/components/ui/ButtonTw";
import { useCommonStore } from "@/store/useCommonStore";
import SelectSearch from "@/components/ui/SelectSearch";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import { useQueryClient } from "@tanstack/react-query";

const AddLanguageModal = ({
  showModal = false,
  show,
  isOpen,
  onClose,
  handleClose: propHandleClose,
}) => {
  const isModalOpen = Boolean(show ?? isOpen ?? showModal);
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);

  const languageList = [
    ...new Map(
      dropdowns.countryList
        ?.filter((c) => c.language)
        .map((c) => [c.language, { value: Number(c.id), label: c.language }])
    ).values(),
  ];

  const proficiencyList =
    (
      dropdowns.statusGroupList?.find(
        (s) => s.code === "proficiency_levels" || s.code === "proficiencies"
      )?.statuses || []
    ).map((c) => ({
      value: Number(c.id),
      label: c.name,
      code: c.code,
    }));

  const schema = z.object({
    userLanguageProficiencies: z
      .array(
        z.object({
          languageId: z.coerce.number().min(1, "Language is required"),
          speakingLevelId: z.coerce
            .number()
            .min(1, "Speaking level is required"),
          readingLevelId: z.coerce
            .number()
            .min(1, "Reading level is required"),
          writingLevelId: z.coerce
            .number()
            .min(1, "Writing level is required"),
        })
      )
      .min(1, "At least one language proficiency is required"),
  });

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      userLanguageProficiencies: [
        {
          languageId: "",
          speakingLevelId: "",
          readingLevelId: "",
          writingLevelId: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "userLanguageProficiencies",
  });

  useEffect(() => {
    if (isModalOpen && user) {
      const existing =
        user?.userLanguageProficiencies ||
        user?.languageProficiencies ||
        user?.languageTable ||
        [];

      const initialLangs =
        existing.length > 0
          ? existing.map((l) => ({
              languageId: l.languageId ? Number(l.languageId) : "",
              speakingLevelId: l.speakingLevelId
                ? Number(l.speakingLevelId)
                : "",
              readingLevelId: l.readingLevelId
                ? Number(l.readingLevelId)
                : "",
              writingLevelId: l.writingLevelId
                ? Number(l.writingLevelId)
                : "",
            }))
          : [
              {
                languageId: "",
                speakingLevelId: "",
                readingLevelId: "",
                writingLevelId: "",
              },
            ];

      reset({ userLanguageProficiencies: initialLangs });
      replace(initialLangs);
    }
  }, [isModalOpen, user, reset, replace]);

  const handleClose = () => {
    if (onClose) onClose();
    if (propHandleClose) propHandleClose();
  };

  const addLanguageProficiency = () => {
    append({
      languageId: "",
      speakingLevelId: "",
      readingLevelId: "",
      writingLevelId: "",
    });
  };

  const removeLanguageProficiency = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const submitForm = async (values) => {
    setLoading(true);
    try {
      const payload = {
        userLanguageProficiencies: (values.userLanguageProficiencies || [])
          .filter((item) => item.languageId)
          .map((item) => ({
            languageId: Number(item.languageId),
            speakingLevelId: Number(item.speakingLevelId),
            readingLevelId: Number(item.readingLevelId),
            writingLevelId: Number(item.writingLevelId),
          })),
      };

      await RestApi.patch(
        `/api/v1/users/update-personal-information/${user?.id}`,
        payload
      );
      queryClient.invalidateQueries({ queryKey: ["authUserInfo"] });
      await getAuthUserInfo(setLoading);
      handleClose();
      toaster("Language proficiencies updated successfully", "success");
    } catch (error) {
      console.error("Error updating languages:", error);
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === "string") {
        toaster(apiMessage, "error");
      } else {
        helpers.handleApiValidationError(
          error,
          setError,
          "Failed to update language proficiencies",
          true
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalTw
      show={isModalOpen}
      isOpen={isModalOpen}
      onClose={handleClose}
      title="Language Proficiencies"
      size="2xl"
      showFooter={false}
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-4 p-2 sm:p-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-dashed rounded-lg bg-gray-50/50 dark:bg-gray-800/40 border-gray-300 dark:border-gray-700 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Language #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLanguageProficiency(index)}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 font-medium"
                    >
                      <i className="fa-solid fa-trash-can"></i> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Controller
                      control={control}
                      name={`userLanguageProficiencies.${index}.languageId`}
                      render={({ field: f, fieldState }) => (
                        <SelectSearch
                          label="Language"
                          options={languageList}
                          value={f.value}
                          onChange={f.onChange}
                          error={fieldState.error?.message}
                          placeholder="Select Language"
                          searchable
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name={`userLanguageProficiencies.${index}.speakingLevelId`}
                      render={({ field: f, fieldState }) => (
                        <SelectSearch
                          label="Speaking"
                          options={proficiencyList}
                          value={f.value}
                          onChange={f.onChange}
                          error={fieldState.error?.message}
                          placeholder="Select Level"
                          searchable
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name={`userLanguageProficiencies.${index}.readingLevelId`}
                      render={({ field: f, fieldState }) => (
                        <SelectSearch
                          label="Reading"
                          options={proficiencyList}
                          value={f.value}
                          onChange={f.onChange}
                          error={fieldState.error?.message}
                          placeholder="Select Level"
                          searchable
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name={`userLanguageProficiencies.${index}.writingLevelId`}
                      render={({ field: f, fieldState }) => (
                        <SelectSearch
                          label="Writing"
                          options={proficiencyList}
                          value={f.value}
                          onChange={f.onChange}
                          error={fieldState.error?.message}
                          placeholder="Select Level"
                          searchable
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-start pt-1">
            <ButtonTw
              type="button"
              variant="outline.blue"
              size="sm"
              onClick={addLanguageProficiency}
              className="gap-2"
            >
              <i className="fa-solid fa-plus"></i> Add Language Proficiency
            </ButtonTw>
          </div>

          {errors.userLanguageProficiencies?.message && (
            <p className="text-red-500 text-sm">
              {errors.userLanguageProficiencies.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <ButtonTw
              type="button"
              variant="outline.gray"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </ButtonTw>
            <ButtonTw
              type="submit"
              variant="blue"
              size="sm"
              disabled={isLoading}
              loading={isLoading}
              className="min-w-[100px]"
            >
              Save
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default AddLanguageModal;

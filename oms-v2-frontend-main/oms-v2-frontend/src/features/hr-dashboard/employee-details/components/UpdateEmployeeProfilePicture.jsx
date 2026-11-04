import { FormController as Controller } from "@/components/common/FormController";
import AvatarUpload from "@/components/ui/AvatarUpload";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { zodResolver } from "@/utils/zodResolver";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const UpdateEmployeeProfilePicture = ({ userProfile, id }) => {
  const schema = z.object({
    profilePic: z.any().optional(),
  });

  const initialValues = {
    profilePic: userProfile,
  };

  const { control, reset, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { uploadProfilePictureMutation } = useHrQueryApi({
    reset,
    setError,
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        ...initialValues,
        profilePic: userProfile,
      });
    } else {
      reset(initialValues);
    }
  }, [userProfile, reset]);

  const isUploading =
    Boolean(uploadProfilePictureMutation?.isPending) ||
    Boolean(uploadProfilePictureMutation?.isLoading) ||
    Boolean(uploadProfilePictureMutation?.loading);

  const handleImageChangeAndUpload = async (file, fieldOnChange) => {
    fieldOnChange(file);
    if (!file || file === userProfile) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      await uploadProfilePictureMutation.mutateAsync({
        id,
        payload: formData,
      });
    } catch (error) {
      console.error("Profile picture upload failed:", error);
    }
  };

  return (
    <div className="mb-2 w-full flex flex-col items-center text-center">
      <Controller
        control={control}
        name="profilePic"
        render={({ field, fieldState }) => (
          <AvatarUpload
            id="profilePic"
            value={field.value}
            onChange={(file) => handleImageChangeAndUpload(file, field.onChange)}
            shape="square"
            size={200}
            label=""
            align="center"
            instruction="Square 1:1 · Up to 15MB (Auto-compressed to <300KB)"
            error={fieldState.error?.message}
            clearable={false}
            showUploadIcon={true}
            uploadIconPosition="bottom-right"
            showCropButton={true}
            cropButtonLabel={isUploading ? "Uploading..." : "Upload & Crop Photo"}
            loading={isUploading}
            disabled={isUploading}
            className="mb-1"
          />
        )}
      />
    </div>
  );
};

export default UpdateEmployeeProfilePicture;


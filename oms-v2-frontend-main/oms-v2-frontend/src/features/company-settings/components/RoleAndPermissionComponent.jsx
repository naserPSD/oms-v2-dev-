"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SwitchButton from "@/components/ui/SwitchButton";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { z } from "zod";

const fakeData = [
  {
    id: 1,
    name: "Super Admin",
    type: "General",
    code: "super_admin",
    active: true,
  },
  {
    id: 2,
    name: "Approval Admin",
    type: "General",
    code: "approval_admin",
    active: false,
  },
];

const initialValues = {
  id: "",
  name: "",
  type: "",
  code: "",
  active: true,
};

const RoleAndPermissionsTable = () => {
  const [data, setData] = useState(fakeData);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const schema = z.object({
    name: z.string().min(1, "Role name is required"),
    type: z.string().min(1, "Role type is required"),
    code: z.string().min(1, "Code is required"),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    reset(initialValues);
  };

  const submitForm = async (values) => {
    console.log("values", values);
    setIsLoading(true);
    try {
      // TODO: Implement API call
      // if (editingId) {
      //   await RestApi.patch(`/roles/update/${editingId}`, values);
      // } else {
      //   await RestApi.post(`/roles/create`, values);
      // }
      // await getAuthUserInfo(setIsLoading);

      toaster(
        `Role ${editingId ? "updated" : "added"} successfully`,
        "success"
      );
      handleClose();
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
    // here come the logic
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          // TODO: Implement API call
          // await RestApi.delete(`/roles/delete/${id}`);
          // await getAuthUserInfo(setIsLoading);

          setData(data.filter((item) => item.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Role deleted successfully.",
            icon: "success",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } catch (error) {
          console.error("Error deleting role:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleToggle = (id) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-color font-bold text-lg">Role & Permissions</h1>
        <ButtonTw
          onClick={() => setShowModal(true)}
          variant="blue"
          className="gap-2"
        >
          <BiPlus /> Add New
        </ButtonTw>
      </div>

      <div className="table-container ">
        <table className="table ">
          <thead>
            <tr>
              <th>SL.</th>
              <th>Role Name</th>
              <th>Role Type</th>
              <th>Code</th>
              <th className="text-center">Active</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, i) => (
                <tr key={row.id}>
                  <td>0{i + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    <span className="badge badge-rounded badge-outline-primary">
                      {row.type}
                    </span>
                  </td>
                  <td>{row.code}</td>
                  <td className="text-center">
                    <SwitchButton
                      enabled={row.active}
                      onChange={() => handleToggle(row.id)}
                      enabledText="Yes"
                      disabledText="No"
                      className="!mb-0"
                    />
                  </td>
                  <td className="text-center">
                    <div className="action">
                      <button
                        onClick={() => handleEdit(row.id)}
                        className="btn-action text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="btn-action text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={editingId ? "Edit Role" : "Add New Role"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 ">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Role Name"
                  placeholder="Enter role name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field, fieldState }) => (
                <Input
                  label="Role Type"
                  placeholder="Enter role type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <Input
                  label="Code"
                  placeholder="Enter role code"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12"
                  {...field}
                />
              )}
            />

            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold mt-4 mb-2 col-span-12"
              disabled={isLoading}
              loading={isLoading}
            >
              {editingId ? "Update Role" : "Add Role"}
            </ButtonTw>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default RoleAndPermissionsTable;

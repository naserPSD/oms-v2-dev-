"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
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
    name: "John Doe",
    username: "johndoe",
    contact: "john.doe@example.com",
    type: "Admin",
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janesmith",
    contact: "jane.smith@example.com",
    type: "Editor",
  },
  {
    id: 3,
    name: "Bob Johnson",
    username: "bobjohnson",
    contact: "bob.johnson@example.com",
    type: "Viewer",
  },
  {
    id: 4,
    name: "Alice Brown",
    username: "alicebrown",
    contact: "alice.brown@example.com",
    type: "Contributor",
  },
];

const initialValues = {
  id: "",
  name: "",
  username: "",
  contact: "",
  type: "",
};

const UserListTable = () => {
  const [data, setData] = useState(fakeData);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown options for user types
  const userTypeOptions = [
    { value: "Admin", label: "Admin" },
    { value: "Editor", label: "Editor" },
    { value: "Viewer", label: "Viewer" },
    { value: "Contributor", label: "Contributor" },
  ];

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    contact: z.string().email("Invalid email address"),
    type: z.string().min(1, "User type is required"),
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
      //   await RestApi.patch(`/users/update/${editingId}`, values);
      // } else {
      //   await RestApi.post(`/users/create`, values);
      // }
      // await getAuthUserInfo(setIsLoading);

      toaster(
        `User ${editingId ? "updated" : "added"} successfully`,
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
          // await RestApi.delete(`/users/delete/${id}`);
          // await getAuthUserInfo(setIsLoading);

          setData(data.filter((item) => item.id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "User deleted successfully.",
            icon: "success",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-ok-btn",
            },
            buttonsStyling: false,
          });
        } catch (error) {
          console.error("Error deleting user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-color font-bold text-lg">User List</h1>
        <ButtonTw
          onClick={() => setShowModal(true)}
          variant="blue"
          className="gap-2"
        >
          <BiPlus /> Add New
        </ButtonTw>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>SL.</th>
              <th>Employee</th>
              <th>Username</th>
              <th>Contact</th>
              <th>Type</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, i) => (
                <tr key={row.id}>
                  <td>0{i + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.username}</td>
                  <td>{row.contact}</td>
                  <td>
                    <span className="badge badge-rounded badge-outline-primary">
                      {row.type}
                    </span>
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
        title={editingId ? "Edit User" : "Add New User"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4 ">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Employee Name"
                  placeholder="Enter employee name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-6"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field, fieldState }) => (
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-6"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="contact"
              render={({ field, fieldState }) => (
                <Input
                  label="Contact Email"
                  placeholder="Enter contact email"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-6"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="User Type"
                  placeholder="Select user type"
                  options={userTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-6"
                  searchable
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
              {editingId ? "Update User" : "Add User"}
            </ButtonTw>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default UserListTable;

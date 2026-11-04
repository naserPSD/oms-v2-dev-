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
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import { Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter, FaListUl } from "react-icons/fa";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import Swal from "sweetalert2";
import { z } from "zod";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { Skeleton } from "@/components/ui/skeleton";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { FaLaptop, FaUsers } from "react-icons/fa6";
import { IoIosAddCircleOutline, IoMdAdd } from "react-icons/io";


const initialValues = {
  id: 0,
  name: ''
};

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Asset Type is required"),
});

const AddOrUpdateAssetTypeModal = ({
  modalShow,
  handleCloseTypeModal,
}) => {

  const TAB_CONFIG = [
    {
      key: "list",
      label: "Asset Type List",
      icon: <FaListUl className="w-4 h-4" />,
    },
    {
      key: "edit",
      label: "Add New Asset Type",
      icon: <IoMdAdd className="w-4 h-4" />,
    },
    {
      key: "import",
      label: "Import Asset Type",
      icon: <MdOutlineAddCircleOutline className="w-4 h-4" />,
    },
  ];
  const [activeTab, setActiveTab] = useState('list');

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const assetStatusList = dropdowns.statusGroupList?.find(s => s.code === 'asset_statuses')?.statuses ?? [];

  const {
    // register,
    // formState: { errors },
    setValue,
    reset,
    handleSubmit,
    control,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });


  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(modalShow);
  }, [modalShow]);

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    handleCloseTypeModal(false);
    setShowModal(false);
  }, [reset]);

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // API hooks
  const {
    useAssetTypeQuery,
    deleteAssetTypeMutation,
    addOrUpdateAssetTypeMutation,
    useGlobalAssetTypeQuery,
    importGlobalAssetTypesMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // React Query for data fetching with pagination and search
  const { data: listData = [], isLoading: isFetching } = useAssetTypeQuery();
  const { data: globalAssetTypes, isLoading: isLoadingGlobal } = useGlobalAssetTypeQuery();
  
  const [selectedAssetTypes, setSelectedAssetTypes] = useState([]);

  const handleToggleAssetType = (id) => {
    setSelectedAssetTypes((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleImportSubmit = async () => {
    if (selectedAssetTypes.length === 0) return;
    await importGlobalAssetTypesMutation.mutateAsync({ assetTypeIds: selectedAssetTypes });
    setSelectedAssetTypes([]);
    setActiveTab("list");
  };

  const submitForm = async (values) => {
    await addOrUpdateAssetTypeMutation.mutateAsync(values);
    setActiveTab('list');
  };


  const handleEdit = (item) => {
    // initialValues.id = item.value
    // initialValues.id = item.label
    // reset(initialValues);
    setValue('id', item.value);
    setValue('name', item.label);
    setActiveTab('edit')
  };


  const handleDelete = useCallback(
    async (id) => {
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
          await deleteAssetTypeMutation.mutateAsync(id);
        }
      });
    },
    [deleteAssetTypeMutation]
  );

  const isLoading =
    isFetching ||
    addOrUpdateAssetTypeMutation.isLoading ||
    deleteAssetTypeMutation.isLoading;

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} Asset Type`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >

      <div className="flex flex-wrap items-center divide-x text-gray-500 dark:text-gray-400 divide-gray-400 dark:divide-gray-600 font-bold text-xs mb-4 border-b border-gray-200 dark:border-gray-700 pb-2.5">
        {TAB_CONFIG.map((tab) => (
          <div key={tab.key}>
            <TabItemTw
              active={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={activeTab === tab.key ? "border-b border-blue-500" : ""}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabItemTw>
          </div>
        ))}
      </div>

        {activeTab === 'list' ? (
          <div className="table-container">
            <table className="table">
              <thead className=" text-xs">
                <tr>
                  <th>SL.</th>
                  <th>Name</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>

                {/* (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) */}
                {isFetching ?
                  (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">
                          <Skeleton className="h-4 w-8" />
                        </td>
                        <td className="px-4 py-2">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )

                  : listData.length > 0 ? (
                    listData.map((row, i) => (
                      <tr key={row.value || i}>
                        <td>{i + 1}</td>
                        <td>{row.label}</td>
                        <td className="text-center">
                          <div className="action">
                            <button
                              onClick={() => handleEdit(row)}
                              className="btn-action text-blue-500 hover:text-blue-700"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.value)}
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
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">
                        No data available
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'edit' ? (
          <form onSubmit={handleSubmit(submitForm)} className="space-y-4 ">
            <div className="grid grid-cols-12 gap-x-4">

              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="Asset Type Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Enter Asset Type name"
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
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Select Asset Types to Import</h3>
              {globalAssetTypes?.length > 0 && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAssetTypes.length === globalAssetTypes.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssetTypes(globalAssetTypes.map((t) => t.value));
                      } else {
                        setSelectedAssetTypes([]);
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
                </label>
              )}
            </div>
            {isLoadingGlobal ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
            ) : globalAssetTypes?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {globalAssetTypes.map((type) => (
                  <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAssetTypes.includes(type.value)}
                      onChange={() => handleToggleAssetType(type.value)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">No global asset types available to import.</div>
            )}
            
            <div className="flex justify-center mt-4">
              <ButtonTw
                type="button"
                size="sm"
                variant="default"
                className="font-bold w-full"
                disabled={selectedAssetTypes.length === 0 || importGlobalAssetTypesMutation.isLoading}
                loading={importGlobalAssetTypesMutation.isLoading}
                onClick={handleImportSubmit}
              >
                Import Selected
              </ButtonTw>
            </div>
          </div>
        )}
      </ModalTw>
    </div>
  );
};

export default AddOrUpdateAssetTypeModal;

"use client";

import { ModalTw } from "@/components/common/ModalTw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/utils/formatTime";
import { getGMTOffset } from "@/utils/timezones";
import {
  Building2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Pencil,
} from "lucide-react";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

const ViewOfficeDetailsModal = ({ showModal, handleClose, officeData, weekend, onEditWeekends }) => {
  if (!officeData) return null;

  const address = officeData.address || {};
  const hasLocation = address.gmapLatitude && address.gmapLongitude;

  const handleViewOnMaps = () => {
    if (hasLocation) {
      const url = `https://www.google.com/maps?q=${address.gmapLatitude},${address.gmapLongitude}`;
      window.open(url, "_blank");
    }
  };

  const handleCopyCoordinates = () => {
    if (hasLocation) {
      navigator.clipboard.writeText(
        `${address.gmapLatitude}, ${address.gmapLongitude}`
      );
    }
  };

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title="View Office Details"
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div className="space-y-6">
          {/* Basic Information Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-500" />
                Basic Information
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Office ID
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {officeData.id || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Office Name
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {officeData.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Office Type
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {officeData?.officeType?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Manager
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {officeData.managerId || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Has Shift
                  </label>
                  <div className="mt-1">
                    <span
                      className={`badge badge-pill ${
                        officeData.hasShift ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {officeData.hasShift ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Timezone
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {officeData.timezone
                      ? `${officeData.timezone} (${getGMTOffset(
                          officeData.timezone
                        )})`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Schedule Section */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-green-500" />
                Time Schedule
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Start Time
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {formatTime(officeData.startTime)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Delay Start Time
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {formatTime(officeData.delayStartTime)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    End Time
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {formatTime(officeData.endTime)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Early End Time
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {formatTime(officeData.earlyEndTime)}
                  </p>
                </div>
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
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-foreground font-medium">
                      {address.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-foreground font-medium">
                      {address.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information Section */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-orange-500" />
                Address Information
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {address.address || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Address Type
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {address.addressType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      City
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {address.city || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Postal Code
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {address.postalCode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Country
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {address.countryName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Address Timezone
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {address.timezone
                        ? `${address.timezone} (${getGMTOffset(
                            address.timezone
                          )})`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Coordinates Section */}
          {!hasLocation && (
            <Card className="border-l-4 border-l-teal-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-teal-500" />
                  Location Coordinates
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Latitude
                      </label>
                      <p className="text-foreground font-medium mt-1">
                        {address.gmapLatitude}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Longitude
                      </label>
                      <p className="text-foreground font-medium mt-1">
                        {address.gmapLongitude}
                      </p>
                    </div>
                  </div>

                  {/* Location Preview */}
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {address.gmapLatitude}, {address.gmapLongitude}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Click to view on Google Maps
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleViewOnMaps}
                          variant={"outline"}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on Maps
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyCoordinates}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekends Section */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-red-500" />
                Weekends
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Office Weekends</p>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["saturday", "Saturday"],
                  ["sunday", "Sunday"],
                  ["monday", "Monday"],
                  ["tuesday", "Tuesday"],
                  ["wednesday", "Wednesday"],
                  ["thursday", "Thursday"],
                  ["friday", "Friday"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{label}</label>
                    </div>
                    <div>
                      {weekend && weekend[key] ? (
                        <span className="badge badge-pill badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-pill badge-danger">No</span>
                      )}
                    </div>
                  </div>
                ))}

                <div className="md:col-span-2 flex justify-end pt-2">
                  <SimpleTooltip text="Edit Weekends">
                    <button
                      type="button"
                      onClick={() => onEditWeekends && onEditWeekends(weekend)}
                      className="btn-action text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={16} />
                    </button>
                  </SimpleTooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModalTw>
    </div>
  );
};

export default ViewOfficeDetailsModal;

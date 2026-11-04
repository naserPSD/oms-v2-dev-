import { ModalTw } from "@/components/common/ModalTw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import helpers from "@/utils/helpers";
import { Clock, MapPin, Calendar } from "lucide-react";

const EventVewDetailsModal = ({
  handleViewDetails,
  handleCloseDetailsModal,
  singleEventData,
}) => {
  return (
    <div>
      <ModalTw
        show={handleViewDetails}
        onClose={handleCloseDetailsModal}
        title="Event Details"
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <div className="space-y-6">
          {/* Event Information Section */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                Event Information
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Event Title
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {singleEventData?.data?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Event Type
                  </label>
                  <p className="text-foreground font-medium mt-1 capitalize">
                    {singleEventData?.data?.eventType?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`text-xs capitalize badge badge-pill badge-outline-${
                        singleEventData?.data?.status?.colorClass || "secondary"
                      }`}
                    >
                      {singleEventData?.data?.status?.name ||
                        singleEventData?.data?.status ||
                        "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Duration
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {singleEventData?.data?.isMultiDay
                      ? "Multi-day Event"
                      : "Single Day"}
                  </p>
                </div>

                {/* Start Date & Time */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Start Date & Time
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {helpers.dDateTime(
                      singleEventData?.data?.startDatetime || "N/A"
                    )}
                  </p>
                </div>

                {/* End Date & Time */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    End Date & Time
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {helpers.dDateTime(
                      singleEventData?.data?.endDatetime || "N/A"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Event Details */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-green-500" />
                Additional Details
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Location
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {singleEventData?.data?.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Department
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {singleEventData?.data?.department?.name || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    All Day Event
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {singleEventData?.data?.isAllDay ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {helpers.dDateTime(singleEventData?.data?.createdAt || "-")}
                  </p>
                </div>
              </div>

              {singleEventData?.data?.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {singleEventData?.data?.description || "N/A"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ModalTw>
    </div>
  );
};

export default EventVewDetailsModal;

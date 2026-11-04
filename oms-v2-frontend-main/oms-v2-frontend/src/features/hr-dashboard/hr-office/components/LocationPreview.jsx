"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const LocationPreview = ({ latitude, longitude, className = "" }) => {
  const lat = Number.parseFloat(latitude?.toString() || "0");
  const lng = Number.parseFloat(longitude?.toString() || "0");

  // Check if both coordinates are valid
  const isValidCoordinates =
    lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng);

  if (!isValidCoordinates) {
    return null;
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div
      className={`dark:bg-gray-700 dark:border-gray-600 border border-border rounded-lg p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MapPin className="w-4 h-4" />
        Location Preview
      </div>

      <div className="text-xs text-muted-foreground">
        <div>Latitude: {lat}</div>
        <div>Longitude: {lng}</div>
      </div>

      {/* Simple map preview using Google Maps Static API */}
      {/* <div className="relative">
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=300x150&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`}
          alt="Location preview"
          className="w-full h-24 object-cover rounded border"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling.style.display = "block";
          }}
        />
        <div className="hidden w-full h-24 bg-muted border rounded flex items-center justify-center text-muted-foreground text-sm">
          Map preview unavailable
        </div>
      </div> */}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => window.open(googleMapsUrl, "_blank")}
          className="flex items-center gap-1 text-xs h-7"
        >
          <ExternalLink className="w-3 h-3" />
          View on Google Maps
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(`${lat}, ${lng}`);
          }}
          className="text-xs h-7"
        >
          Copy Coordinates
        </Button>
      </div>
    </div>
  );
};

export default LocationPreview;

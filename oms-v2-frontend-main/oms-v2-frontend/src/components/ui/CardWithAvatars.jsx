import { useState } from "react";
import helpers from "@/utils/helpers";
import SimpleTooltip from "./SimpleTooltip";
import Avatar from "./Avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, PhoneCall, TrendingUp } from "lucide-react";

const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("undefined") ||
    trimmed.includes("/static/undefined/") ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
};

function UserAvatarItem({ user }) {
  const [imgError, setImgError] = useState(false);
  const canShowImage = !imgError && isValidImageUrl(user?.fileUrl);
  const fallbackText =
    (typeof helpers?.avatarText === "function" ? helpers.avatarText(user?.name) : null) ||
    (user?.name ? user.name.slice(0, 2).toUpperCase() : "U");

  return (
    <div className="relative size-6 rounded-full overflow-hidden border border-white dark:border-gray-800 shadow-xs hover:z-10 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      {canShowImage ? (
        <img
          src={user.fileUrl}
          alt={user?.name || "User Avatar"}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <Avatar
          text={fallbackText}
          color="info"
          size="xs"
          className="w-full h-full text-[9px]"
        />
      )}
    </div>
  );
}

export default function CardWithAvatars({
  title,
  borderColor = "border-l-gray-500",
  onClick,
  users = [],
  count = 0,
}) {
  const displayAvatars = users.slice(0, 4);
  const extra = users.length > 4 ? users.length - 4 : 0;

  // Determine icon and theme based on title or borderColor
  const getIcon = () => {
    const t = title.toLowerCase();
    if (t.includes("lead")) return <Users className="w-4 h-4" />;
    if (t.includes("client")) return <Briefcase className="w-4 h-4" />;
    if (t.includes("follow up")) return <PhoneCall className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  // Map the border color prop to text/icon color for better theming
  const getThemeColor = () => {
    if (borderColor.includes("green")) return "text-green-600 dark:text-green-400";
    if (borderColor.includes("blue")) return "text-blue-600 dark:text-blue-400";
    if (borderColor.includes("orange") || borderColor.includes("yellow")) return "text-orange-600 dark:text-orange-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getIconBgColor = () => {
    if (borderColor.includes("green")) return "bg-green-100/80 dark:bg-green-900/40";
    if (borderColor.includes("blue")) return "bg-blue-100/80 dark:bg-blue-900/40";
    if (borderColor.includes("orange") || borderColor.includes("yellow")) return "bg-orange-100/80 dark:bg-orange-900/40";
    return "bg-gray-100 dark:bg-gray-800";
  };

  const getGradientBg = () => {
    if (borderColor.includes("green")) return "bg-gradient-to-br from-green-50/60 to-emerald-100/20 dark:from-green-950/30 dark:to-emerald-900/10";
    if (borderColor.includes("blue")) return "bg-gradient-to-br from-blue-50/60 to-indigo-100/20 dark:from-blue-950/30 dark:to-indigo-900/10";
    if (borderColor.includes("orange") || borderColor.includes("yellow")) return "bg-gradient-to-br from-orange-50/60 to-amber-100/20 dark:from-orange-950/30 dark:to-amber-900/10";
    return "bg-gradient-to-br from-gray-50 to-gray-100/40 dark:from-gray-900 dark:to-gray-800/40";
  };

  const themeColor = getThemeColor();
  const iconBgColor = getIconBgColor();
  const gradientBg = getGradientBg();

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 ${borderColor} ${gradientBg} ${
        onClick ? "cursor-pointer" : ""
      } !py-0`}
      onClick={onClick}
    >
      <CardContent className="relative z-10 p-3.5 flex flex-col h-full justify-between gap-2.5">
        {/* Top Section: Title & Icon */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className={`p-1.5 rounded-lg ${iconBgColor} ${themeColor}`}>
            {getIcon()}
          </div>
        </div>

        {/* Middle Section: Count */}
        <div className="flex items-baseline gap-2">
          <h2 className={`text-2xl font-bold tracking-tight ${themeColor}`}>
            {count.toLocaleString()}
          </h2>
        </div>

        {/* Bottom Section: Avatars */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
            Assigned Users
          </span>
          <div className="flex items-center">
            {users.length === 0 ? (
              <span className="text-[11px] text-gray-400 italic">No users</span>
            ) : (
              <div className="flex items-center overflow-visible -space-x-2.5">
                {displayAvatars.map((user, index) => (
                  <SimpleTooltip key={index} text={user?.name || "Unknown User"}>
                    <UserAvatarItem user={user} />
                  </SimpleTooltip>
                ))}
                {extra > 0 && (
                  <div className="relative size-6 rounded-full bg-gray-100 dark:bg-gray-800 border border-white dark:border-gray-800 flex items-center justify-center shadow-xs z-0">
                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                      +{extra > 99 ? "99" : extra}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


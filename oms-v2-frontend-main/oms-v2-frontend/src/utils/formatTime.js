export const formatTime = (time) => {
  if (!time) return "N/A";
  return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }); //output is eg. "2:30 PM"
};

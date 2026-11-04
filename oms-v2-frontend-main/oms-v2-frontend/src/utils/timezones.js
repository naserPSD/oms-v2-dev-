export function getTimezones() {
  const timezones = Intl.supportedValuesOf("timeZone");

  return timezones
    .map((timezone) => {
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
      });
      const parts = formatter.formatToParts(new Date());
      const offset =
        parts.find((part) => part.type === "timeZoneName")?.value || "";
      const modifiedOffset = offset === "GMT" ? "GMT+0" : offset;

      return {
        value: timezone,
        label: `(${modifiedOffset}) ${timezone.replace(/_/g, " ")}`,
        numericOffset: parseInt(
          offset.replace("GMT", "").replace("+", "") || "0"
        ),
      };
    })
    .sort((a, b) => a.numericOffset - b.numericOffset);
}

export function getGMTOffset(tz) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset", // "GMT+6"
    });

    // উদাহরণ আউটপুট: "GMT+6"
    const parts = formatter.formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value;
    return offset || "N/A";
  } catch (e) {
    console.error(e);
    return "Invalid TZ";
  }
}



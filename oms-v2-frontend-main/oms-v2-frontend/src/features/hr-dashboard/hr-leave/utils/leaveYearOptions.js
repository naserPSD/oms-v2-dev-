export function leaveYearOptions(registerDate) {
  const current = new Date().getFullYear();
  const end = current + 1;
  let start = current;

  if (registerDate) {
    const registered = new Date(registerDate);
    if (!Number.isNaN(registered.getTime())) {
      const year = registered.getFullYear();
      if (year > 1900 && year < start) start = year;
    }
  }

  const options = [];
  for (let year = end; year >= start; year -= 1) {
    options.push({ value: String(year), label: String(year) });
  }
  return options;
}

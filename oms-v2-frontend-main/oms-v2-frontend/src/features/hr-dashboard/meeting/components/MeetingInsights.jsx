"use client";

export default function MeetingInsights({ hosted = 0, attended = 0 }) {
  const rows = [
    {
      label: "Number of meetings you hosted this week",
      value: hosted,
    },
    {
      label: "Number of meetings you attended this week",
      value: attended,
    },
  ];

  return (
    <div className="admin-card p-5 h-full flex flex-col">
      <h3 className="text-base font-semibold admin-text mb-5">Insights</h3>

      <ul className="flex flex-col gap-6 flex-1 justify-center">
        {rows.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"
          >
            <p className="text-sm admin-text-muted leading-snug">{row.label}</p>
            <span className="text-3xl sm:text-4xl font-bold text-primaryColor dark:text-primaryColor-400 tabular-nums leading-none">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

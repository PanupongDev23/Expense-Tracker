type MonthPickerProps = {
  month: string;
  action: string;
};

export function MonthPicker({ month, action }: MonthPickerProps) {
  return (
    <form action={action} className="flex h-10 items-center gap-2 rounded-md border border-[#d9dbd2] bg-white px-3">
      <input
        aria-label="เลือกเดือน"
        className="min-w-0 bg-transparent text-sm font-medium text-[#151813] outline-none"
        type="month"
        name="month"
        defaultValue={month}
      />
      <button className="rounded-md bg-[#eef1e8] px-3 py-1 text-sm font-semibold text-[#205b45]" type="submit">
        ดู
      </button>
    </form>
  );
}

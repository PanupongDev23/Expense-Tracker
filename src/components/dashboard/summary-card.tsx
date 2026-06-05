type SummaryCardProps = {
  label: string;
  value: string;
  tone: "income" | "expense" | "balance";
};

const toneClass: Record<SummaryCardProps["tone"], string> = {
  income: "border-[#c9dfd4] bg-[#f0f8f3] text-[#205b45]",
  expense: "border-[#f0c9c2] bg-[#fff4f1] text-[#9c2f1b]",
  balance: "border-[#d4d7e8] bg-[#f3f5ff] text-[#2f3f8f]"
};

export function SummaryCard({ label, value, tone }: SummaryCardProps) {
  return (
    <div className={`rounded-lg border p-5 shadow-sm ${toneClass[tone]}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}

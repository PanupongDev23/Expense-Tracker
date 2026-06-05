import { listCategories } from "@/actions/categories";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getTodayInputValue } from "@/lib/dates";

export default async function NewTransactionPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-[#67715f]">เพิ่มข้อมูลใหม่</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#151813]">เพิ่มรายการ</h1>
      </div>
      <TransactionForm
        categories={categories}
        initialTransaction={{
          type: "expense",
          amount: "",
          categoryId: "",
          transactionDate: getTodayInputValue(),
          note: ""
        }}
      />
    </div>
  );
}

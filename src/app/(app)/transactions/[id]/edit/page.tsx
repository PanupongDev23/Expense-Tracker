import { listCategories } from "@/actions/categories";
import { getTransactionForEdit } from "@/actions/transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const { id } = await params;
  const [transaction, categories] = await Promise.all([getTransactionForEdit(id), listCategories()]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-[#67715f]">แก้ไขข้อมูล</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#151813]">แก้ไขรายการ</h1>
      </div>
      <TransactionForm
        transactionId={transaction.id}
        categories={categories}
        initialTransaction={{
          type: transaction.type,
          amount: String(transaction.amount),
          categoryId: transaction.categoryId,
          transactionDate: transaction.transactionDate,
          note: transaction.note ?? ""
        }}
      />
    </div>
  );
}

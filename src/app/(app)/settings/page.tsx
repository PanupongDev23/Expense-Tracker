import { listCategories } from "@/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";
import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const [user, categories] = await Promise.all([getCurrentUser(), listCategories()]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-[#67715f]">บัญชีและหมวดหมู่</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#151813]">Settings</h1>
      </div>

      <section className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#151813]">บัญชี</h2>
        <p className="mt-2 text-sm text-[#67715f]">{user?.email}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <CategoryForm />
        <div className="rounded-lg border border-[#dedfd8] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#151813]">หมวดหมู่ทั้งหมด</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-md border border-[#e6e7e0] px-3 py-2">
                <p className="text-sm font-semibold text-[#151813]">{category.name}</p>
                <p className="text-xs uppercase tracking-normal text-[#67715f]">
                  {category.type === "income" ? "รายรับ" : "รายจ่าย"}
                  {category.userId ? " · custom" : " · default"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

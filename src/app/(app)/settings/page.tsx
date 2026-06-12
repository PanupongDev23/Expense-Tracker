import { listCategories } from "@/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryList } from "@/components/categories/category-list";
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
        <CategoryList categories={categories} />
      </section>
    </div>
  );
}

import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container-smq py-10">
      <h1 className="text-h1">الصفحة غير موجودة</h1>
      <Link href="/" className="underline">الرئيسية</Link>
    </main>
  );
}

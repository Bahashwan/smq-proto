import { Styleguide as UiStyleguide } from "@/components/ui/_styleguide";
import { Styleguide as AdminStyleguide } from "@/components/admin/_styleguide";
import { Styleguide as MapStyleguide } from "@/components/map/_styleguide";
import { Styleguide as AllianceStyleguide } from "@/components/alliance/_styleguide";

export const metadata = { title: "المكونات" };

export default function ComponentsPage() {
  return (
    <main className="container-smq py-10 flex flex-col gap-16">
      <h1 className="text-h1">ورقة المكونات</h1>
      <section id="ui"><UiStyleguide /></section>
      <section id="map"><MapStyleguide /></section>
      <section id="admin"><AdminStyleguide /></section>
      <section id="alliance"><AllianceStyleguide /></section>
    </main>
  );
}

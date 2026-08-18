import { AreaRestrita } from "@/components/admin/area-restrita";

export const metadata = {
  title: "Área restrita",
  robots: { index: false, follow: false },
};

export default function PaginaAdmin() {
  return <AreaRestrita />;
}

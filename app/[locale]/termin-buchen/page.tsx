import { headers } from "next/headers";
import TerminBuchenClient from "./TerminBuchenClient";

// Server-Wrapper: erzwingt dynamisches Rendern (kein statisches SSG-Artefakt).
// So liefert die Route bei jedem Abruf frisch die aktuelle, sichere Copy aus —
// inklusive Live-Parity-Marker. Route-Segment-Config muss in einer Server-Datei
// stehen; die interaktive Logik bleibt im Client-Component.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TerminBuchenPage() {
  // headers() markiert die Route als dynamisch (Router-Cache-TTL = 0), wie auf der
  // Startseite — verhindert Auslieferung eines veralteten statischen Artefakts.
  void headers();
  return <TerminBuchenClient />;
}

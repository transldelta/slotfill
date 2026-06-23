"use client";

import { useEffect, useState } from "react";
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/form-abuse";

/**
 * Unsichtbare Anti-Spam-Felder für öffentliche Formulare:
 *  - Honeypot (off-screen, für Bots sichtbar, für Menschen/Screenreader nicht).
 *  - Render-Timestamp (Time-Trap): wird serverseitig gegen zu schnelle/alte Submits geprüft.
 *
 * Keine sichtbare Designänderung. Muss innerhalb des <form>-Elements stehen,
 * damit `new FormData(form)` die Felder mitschickt.
 */
export function FormAntiSpamFields() {
  // Timestamp erst nach dem Mount im Browser setzen → immer frisch (auch bei
  // statisch vorgerenderten Seiten). JS-lose Bots senden ein leeres Feld → wird
  // serverseitig als „missing-ts" abgelehnt.
  const [ts, setTs] = useState("");
  useEffect(() => {
    setTs(String(Date.now()));
  }, []);
  return (
    <>
      <input type="hidden" name={TIMESTAMP_FIELD} value={ts} readOnly />
      {/* Honeypot: off-screen + aria-hidden + nicht fokussierbar. Keine sichtbare
          Beschriftung/Instruktion im HTML — Bots füllen das Feld dennoch, Menschen
          und Screenreader erreichen es nicht. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
      >
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
    </>
  );
}

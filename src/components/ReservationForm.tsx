"use client";

import { RESERVATION_TYPES } from "@/lib/parks";

type Day = { id: string; date: Date; parkCode: string | null };

export default function ReservationForm({
  action,
  defaults,
  days,
  submitLabel = "salvar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: Partial<{
    type: string;
    name: string;
    date: string;
    time: string;
    partySize: number;
    location: string;
    confirmation: string;
    cost: number;
    notes: string;
    link: string;
    dayId: string;
  }>;
  days: Day[];
  submitLabel?: string;
}) {
  const d = defaults ?? {};

  return (
    <form action={action} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Tipo">
          <select name="type" defaultValue={d.type ?? "adr"} required className="w-full rounded-lg border border-ink-200 px-3 py-2">
            {Object.entries(RESERVATION_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Nome">
          <input
            name="name"
            required
            defaultValue={d.name ?? ""}
            placeholder="Ex: Be Our Guest Restaurant"
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
          />
        </Field>
        <Field label="Data">
          <input type="date" name="date" required defaultValue={d.date ?? ""} className="w-full rounded-lg border border-ink-200 px-3 py-2" />
        </Field>
        <Field label="Horário">
          <input name="time" defaultValue={d.time ?? ""} placeholder="19:45" className="w-full rounded-lg border border-ink-200 px-3 py-2" />
        </Field>
        <Field label="Pessoas">
          <input type="number" name="partySize" min={1} defaultValue={d.partySize ?? 8} className="w-full rounded-lg border border-ink-200 px-3 py-2" />
        </Field>
        <Field label="Custo (USD)">
          <input type="number" step="0.01" name="cost" defaultValue={d.cost ?? ""} className="w-full rounded-lg border border-ink-200 px-3 py-2" />
        </Field>
        <Field label="Local">
          <input name="location" defaultValue={d.location ?? ""} placeholder="Ex: Magic Kingdom" className="w-full rounded-lg border border-ink-200 px-3 py-2" />
        </Field>
        <Field label="Código de confirmação">
          <input name="confirmation" defaultValue={d.confirmation ?? ""} placeholder="Ex: 12345678" className="w-full rounded-lg border border-ink-200 px-3 py-2 font-mono text-sm" />
        </Field>
      </div>

      <Field label="Vincular a um dia do roteiro (opcional — se a data bater, vinculamos automático)">
        <select name="dayId" defaultValue={d.dayId ?? ""} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm">
          <option value="">— automático pela data —</option>
          {days.map((day) => (
            <option key={day.id} value={day.id}>
              {day.date.toISOString().slice(0, 10)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Link (opcional)">
        <input name="link" defaultValue={d.link ?? ""} placeholder="https://..." className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
      </Field>

      <Field label="Notas">
        <textarea
          name="notes"
          defaultValue={d.notes ?? ""}
          rows={3}
          placeholder="Restrições alimentares, observações de pagamento, etc."
          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
        />
      </Field>

      <button type="submit" className="w-full md:w-auto bg-ep-600 hover:bg-ep-800 text-white px-6 py-2.5 rounded-lg font-medium transition">
        {submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-800 mb-1">{label}</label>
      {children}
    </div>
  );
}

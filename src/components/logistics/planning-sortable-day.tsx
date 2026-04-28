"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LogisticsTask } from "@/lib/db/schema";
import { reorderPlanningDay } from "@/lib/logistics/logistics-actions";
import { cn } from "@/lib/utils";

function SortableRow({
  task,
  hyperfocus,
}: {
  task: LogisticsTask;
  hyperfocus?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const free = task.label.startsWith("✦");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex gap-3 rounded-xl border px-3 py-2.5 shadow-sm transition",
        free
          ? "border-padma-pearl/45 bg-gradient-to-r from-padma-pearl/15 to-transparent"
          : "border-padma-champagne/25 bg-white/85",
        isDragging && "z-10 opacity-90 ring-2 ring-padma-lavender/45",
        hyperfocus && "py-2"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-padma-night/35 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Réordonner"
      >
        ::
      </button>
      <div className="min-w-0 flex-1">
        {task.slot && (
          <p className="font-display text-[0.65rem] uppercase tracking-[0.15em] text-padma-pearl">
            {task.slot}
          </p>
        )}
        <p className={cn("text-sm text-padma-night", free && "italic text-padma-night/85")}>
          {task.label.replace(/^✦\s*/, "")}
        </p>
        {free && (
          <p className="mt-0.5 text-[0.65rem] text-padma-night/45">Temps libre — respiration & présence</p>
        )}
      </div>
    </div>
  );
}

export function PlanningSortableDay({
  retreatId,
  dayIndex,
  tasks,
  dayLabel,
  hyperfocus,
  onReordered,
}: {
  retreatId: string;
  dayIndex: number;
  tasks: LogisticsTask[];
  dayLabel: string;
  hyperfocus?: boolean;
  onReordered?: () => void;
}) {
  const sorted = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  const ids = sorted.map((t) => t.id);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const nextOrder = arrayMove(ids, oldIndex, newIndex);
    await reorderPlanningDay(retreatId, dayIndex, nextOrder);
    onReordered?.();
  }

  return (
    <section className="rounded-2xl border border-padma-pearl/35 bg-padma-cream/35 p-4">
      <h3 className="mb-3 font-cinzel text-base text-padma-night">{dayLabel}</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(ev) => void handleDragEnd(ev)}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className={cn("flex flex-col gap-2", hyperfocus && "gap-1.5")}>
            {sorted.map((t) => (
              <SortableRow key={t.id} task={t} hyperfocus={hyperfocus} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

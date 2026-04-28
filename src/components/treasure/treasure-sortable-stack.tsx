"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TreasureWidgetId } from "@/lib/treasure/widget-ids";
import { cn } from "@/lib/utils";

function TreasureWidgetFrame({
  id,
  title,
  hint,
  hyperfocus,
  children,
}: {
  id: TreasureWidgetId;
  title: string;
  hint?: string;
  hyperfocus?: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border border-padma-champagne/22 bg-white/75 shadow-soft backdrop-blur-sm",
        isDragging && "z-20 ring-2 ring-padma-lavender/40",
        hyperfocus && "rounded-xl"
      )}
    >
      <header
        className={cn(
          "flex gap-3 border-b border-padma-champagne/15 px-4 py-3",
          hyperfocus && "py-2.5"
        )}
      >
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none self-start rounded-lg px-1 text-padma-night/35 hover:bg-padma-lavender/10 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Déplacer le bloc ${title}`}
        >
          <span aria-hidden className="font-mono text-sm leading-none">
            ::
          </span>
        </button>
        <div className="min-w-0 flex-1 text-left">
          <h2 className="font-cinzel text-lg font-normal tracking-wide text-padma-night">{title}</h2>
          {hint ? (
            <p className="mt-0.5 text-xs leading-snug text-padma-night/62">{hint}</p>
          ) : null}
        </div>
      </header>
      <div className={cn("p-4 pt-3", hyperfocus && "p-3 pt-2.5")}>{children}</div>
    </article>
  );
}

const WIDGET_CHROME: Record<
  TreasureWidgetId,
  {
    title: string;
    hint?: string;
  }
> = {
  kpis: {
    title: "Flux & respiration",
    hint: "CA réel, pipeline et places — données locales Dexie.",
  },
  rankings: {
    title: "Constellations",
    hint: "Destinations, durées et énergies les plus nourries.",
  },
  "sim-ca": {
    title: "Simulateur CA & marge",
    hint: "Par retraite : chiffre, coûts variables, enveloppe fixe.",
  },
  "sim-breakeven": {
    title: "Seuil de rentabilité",
    hint: "Combien de participantes pour absorber les fixes ?",
  },
  "sim-scenario": {
    title: "Scénario · nouvelle retraite",
    hint: "Projection si vous ajoutez un cycle (ex. Portugal, nouvelle lune).",
  },
  "sim-fiscal": {
    title: "Micro-entreprise · lecture douce",
    hint: "Ordre de grandeur — à valider avec un professionnel.",
  },
  gamification: {
    title: "Énergie & sceaux",
    hint: "Points symboliques et badges selon vos flux réels.",
  },
};

export function TreasureSortableStack({
  order,
  onReorder,
  hyperfocus,
  childrenFor,
}: {
  order: TreasureWidgetId[];
  onReorder: (next: TreasureWidgetId[]) => void;
  hyperfocus?: boolean;
  childrenFor: (id: TreasureWidgetId) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as TreasureWidgetId);
    const newIndex = order.indexOf(over.id as TreasureWidgetId);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-4", hyperfocus && "space-y-3")}>
          {order.map((id) => {
            const meta = WIDGET_CHROME[id];
            return (
              <TreasureWidgetFrame
                key={id}
                id={id}
                title={meta.title}
                hint={meta.hint}
                hyperfocus={hyperfocus}
              >
                {childrenFor(id)}
              </TreasureWidgetFrame>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

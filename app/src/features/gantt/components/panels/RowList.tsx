"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { RowLayout } from "../../lib/geometry";

interface RowListProps {
  layouts: RowLayout[];
  headerHeight: number;
  gutterWidth: number;
  selectedRowId?: string | null;
  onReorder: (orderedIds: string[]) => void;
  onSelectRow: (rowId: string) => void;
  onRenameRow: (rowId: string, label: string) => void;
  onDeleteRow: (rowId: string) => void;
  onAddBar: (rowId: string) => void;
}

export function RowList({
  layouts,
  headerHeight,
  gutterWidth,
  selectedRowId,
  onReorder,
  onSelectRow,
  onRenameRow,
  onDeleteRow,
  onAddBar,
}: RowListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const ids = layouts.map((l) => l.row.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div
      className="sticky left-0 z-10 shrink-0 border-r border-border bg-card"
      style={{ width: gutterWidth }}
    >
      <div
        className="flex items-center border-b border-border px-3 text-xs font-medium text-muted-foreground"
        style={{ height: headerHeight }}
      >
        Rows
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {layouts.map((l) => (
            <SortableRow
              key={l.row.id}
              id={l.row.id}
              label={l.row.label}
              height={l.height}
              selected={l.row.id === selectedRowId}
              onSelect={() => onSelectRow(l.row.id)}
              onRename={(label) => onRenameRow(l.row.id, label)}
              onDelete={() => onDeleteRow(l.row.id)}
              onAddBar={() => onAddBar(l.row.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableRowProps {
  id: string;
  label: string;
  height: number;
  selected: boolean;
  onSelect: () => void;
  onRename: (label: string) => void;
  onDelete: () => void;
  onAddBar: () => void;
}

function SortableRow({
  id,
  label,
  height,
  selected,
  onSelect,
  onRename,
  onDelete,
  onAddBar,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        height,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className={cn(
        "group flex items-center gap-1 border-b border-border px-2",
        selected ? "bg-accent" : "bg-card",
      )}
      onPointerDown={onSelect}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-7 cursor-grab text-muted-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </Button>
      <Input
        value={label}
        onChange={(e) => onRename(e.target.value)}
        className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-1 shadow-none focus-visible:border-input"
        aria-label="Row label"
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 group-hover:opacity-100"
        aria-label="Add task to row"
        onClick={onAddBar}
      >
        <Plus className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 group-hover:opacity-100"
        aria-label="Delete row"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

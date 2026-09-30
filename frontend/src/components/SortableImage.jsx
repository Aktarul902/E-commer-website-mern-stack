import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableImage = ({ id, image, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-2xl border bg-white overflow-hidden ${
        isDragging
          ? "border-black shadow-2xl scale-[1.02]"
          : "border-gray-200"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <img
          src={image}
          alt={`Product ${index + 1}`}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Image number */}
      <div className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-full">
        {index === 0 ? "Main image" : `Image ${index + 1}`}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-red-600 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      >
        ×
      </button>

      {/* Drag hint */}
      <div className="px-4 py-3 text-xs text-gray-500 text-center">
        Drag to rearrange
      </div>
    </div>
  );
};

export default SortableImage;
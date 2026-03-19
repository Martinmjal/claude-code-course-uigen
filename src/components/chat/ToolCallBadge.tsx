import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolCallBadgeProps {
  tool: ToolInvocation;
}

export function getToolCallLabel(tool: ToolInvocation): string {
  const args = tool.args as Record<string, string>;

  if (tool.toolName === "str_replace_editor") {
    const path = args.path ?? "";
    switch (args.command) {
      case "create":
        return `Creating ${path}`;
      case "str_replace":
      case "insert":
        return `Editing ${path}`;
      case "view":
        return `Viewing ${path}`;
      case "undo_edit":
        return `Undoing edit in ${path}`;
    }
  }

  if (tool.toolName === "file_manager") {
    const path = args.path ?? "";
    if (args.command === "rename") {
      return `Renaming ${path} to ${args.new_path ?? ""}`;
    }
    if (args.command === "delete") {
      return `Deleting ${path}`;
    }
  }

  return tool.toolName;
}

export function ToolCallBadge({ tool }: ToolCallBadgeProps) {
  const label = getToolCallLabel(tool);
  const isDone = tool.state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

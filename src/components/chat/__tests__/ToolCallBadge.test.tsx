import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel ---

test("getToolCallLabel: str_replace_editor create", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" }, state: "result", toolCallId: "1", result: "" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("Creating /App.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "str_replace", path: "/components/Button.tsx" }, state: "call", toolCallId: "2" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("Editing /components/Button.tsx");
});

test("getToolCallLabel: str_replace_editor insert", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "insert", path: "/App.jsx" }, state: "call", toolCallId: "3" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("Editing /App.jsx");
});

test("getToolCallLabel: str_replace_editor view", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "view", path: "/App.jsx" }, state: "result", toolCallId: "4", result: "" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("Viewing /App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "undo_edit", path: "/App.jsx" }, state: "call", toolCallId: "5" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("Undoing edit in /App.jsx");
});

test("getToolCallLabel: file_manager rename", () => {
  const tool = { toolName: "file_manager", args: { command: "rename", path: "/Foo.jsx", new_path: "/Bar.jsx" }, state: "result", toolCallId: "6", result: "" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("Renaming /Foo.jsx to /Bar.jsx");
});

test("getToolCallLabel: file_manager delete", () => {
  const tool = { toolName: "file_manager", args: { command: "delete", path: "/Old.jsx" }, state: "call", toolCallId: "7" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("Deleting /Old.jsx");
});

test("getToolCallLabel: unknown tool falls back to toolName", () => {
  const tool = { toolName: "unknown_tool", args: {}, state: "call", toolCallId: "8" } as ToolInvocation;
  expect(getToolCallLabel(tool)).toBe("unknown_tool");
});

// --- ToolCallBadge rendering ---

test("ToolCallBadge shows label and green dot when done", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" }, state: "result", toolCallId: "1", result: "" } as ToolInvocation;
  const { container } = render(<ToolCallBadge tool={tool} />);

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolCallBadge shows spinner when pending", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" }, state: "call", toolCallId: "2" } as ToolInvocation;
  const { container } = render(<ToolCallBadge tool={tool} />);

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows file_manager delete label", () => {
  const tool = { toolName: "file_manager", args: { command: "delete", path: "/Old.jsx" }, state: "result", toolCallId: "3", result: "" } as ToolInvocation;
  render(<ToolCallBadge tool={tool} />);

  expect(screen.getByText("Deleting /Old.jsx")).toBeDefined();
});

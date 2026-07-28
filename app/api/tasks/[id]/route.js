import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// PATCH /api/tasks/:id
// Body may include any subset of: { text, done, priority, dueDate, dueTime,
// assignee, notified }. Used for the checkbox toggle, the edit form, and
// the "already notified this session" flag.
export async function PATCH(request, { params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const data = {};

    if (body.text !== undefined) {
      const text = String(body.text).trim();
      if (!text) {
        return NextResponse.json(
          { error: "text cannot be empty" },
          { status: 400 },
        );
      }
      data.text = text;
    }
    if (body.done !== undefined) data.done = !!body.done;
    if (body.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority" },
          { status: 400 },
        );
      }
      data.priority = body.priority;
    }
    if (body.dueDate !== undefined) {
      data.due_date = body.dueDate ? new Date(body.dueDate) : null;
    }
    if (body.dueTime !== undefined) data.due_time = body.dueTime || null;
    if (body.assignee !== undefined) data.assignee = body.assignee || null;
    if (body.notified !== undefined) data.notified = !!body.notified;

    const task = await prisma.tasks.update({ where: { id }, data });
    return NextResponse.json({ data: task });
  } catch (e) {
    if (e.code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    console.error(`PATCH /api/tasks/${id} failed:`, e);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE /api/tasks/:id
export async function DELETE(_request, { params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }
  try {
    await prisma.tasks.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (e) {
    if (e.code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    console.error(`DELETE /api/tasks/${id} failed:`, e);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}

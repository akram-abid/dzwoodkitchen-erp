import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// GET /api/tasks
// Returns every task, newest first. The dashboard filters by day/status
// client-side, so we don't paginate here — task lists stay small.
export async function GET() {
  try {
    const tasks = await prisma.tasks.findMany({
      orderBy: [{ due_date: "asc" }, { created_at: "desc" }],
    });
    return NextResponse.json({ data: tasks });
  } catch (e) {
    console.error("GET /api/tasks failed:", e);
    return NextResponse.json(
      { error: "Failed to load tasks" },
      { status: 500 },
    );
  }
}

// POST /api/tasks
// Body: { text, priority?, dueDate?, dueTime?, assignee? }
export async function POST(request) {
  try {
    const body = await request.json();
    const text = (body.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const priority = VALID_PRIORITIES.includes(body.priority)
      ? body.priority
      : "MEDIUM";

    const task = await prisma.tasks.create({
      data: {
        text,
        priority,
        due_date: body.dueDate ? new Date(body.dueDate) : null,
        due_time: body.dueTime || null,
        assignee: body.assignee || null,
      },
    });
    return NextResponse.json({ data: task }, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks failed:", e);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
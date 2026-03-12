import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCheckInsBySlotId, getCurrentUser, getDashboardSlots, getSlotById } from "@/lib/data";

const createClientMock = vi.fn();
const fromMock = vi.fn();
const rpcMock = vi.fn();

let mySlotsData: unknown[] | null;
let mySlotsError: { message: string } | null;
let participatedData: unknown[] | null;
let participatedError: { message: string } | null;
let slotByIdData: unknown | null;
let slotByIdError: { message: string } | null;
let checkInsData: unknown[] | null;
let checkInsError: { message: string } | null;
let currentUser: { id: string } | null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => createClientMock(),
}));

describe("getDashboardSlots", () => {
  beforeEach(() => {
    mySlotsData = [];
    mySlotsError = null;
    participatedData = [];
    participatedError = null;
    slotByIdData = null;
    slotByIdError = null;
    checkInsData = [];
    checkInsError = null;
    currentUser = null;

    fromMock.mockReset();
    rpcMock.mockReset();
    createClientMock.mockReset();

    fromMock.mockImplementation((table: string) => {
      if (table === "slots") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: slotByIdData,
                error: slotByIdError,
              }),
              order: async () => ({
                data: mySlotsData,
                error: mySlotsError,
              }),
            }),
          }),
        };
      }

      if (table === "check_ins") {
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({
                data: checkInsData,
                error: checkInsError,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    rpcMock.mockImplementation(async (fnName: string) => {
      if (fnName !== "get_participated_slots") {
        throw new Error(`Unexpected rpc: ${fnName}`);
      }

      return {
        data: participatedData,
        error: participatedError,
      };
    });

    createClientMock.mockResolvedValue({
      from: fromMock,
      rpc: rpcMock,
      auth: {
        getUser: async () => ({
          data: {
            user: currentUser,
          },
        }),
      },
    });
  });

  it("returns current user from supabase auth", async () => {
    currentUser = { id: "user-123" };
    await expect(getCurrentUser()).resolves.toEqual({ id: "user-123" });
  });

  it("returns linket by id and null when not found", async () => {
    slotByIdData = {
      id: "slot-abc",
      creator_id: "u1",
      title: "Test",
      start_at: "2026-03-12T10:00:00.000Z",
      end_at: "2026-03-12T11:00:00.000Z",
      created_at: "2026-03-12T09:00:00.000Z",
    };
    await expect(getSlotById("slot-abc")).resolves.toMatchObject({ id: "slot-abc" });

    slotByIdData = null;
    await expect(getSlotById("slot-missing")).resolves.toBeNull();
  });

  it("throws when getSlotById query fails", async () => {
    slotByIdError = { message: "slot query failed" };
    await expect(getSlotById("slot-error")).rejects.toThrow("slot query failed");
  });

  it("returns check-ins and throws on query error", async () => {
    checkInsData = [
      {
        id: "check-1",
        slot_id: "slot-1",
        user_id: "u1",
        emoji: "🎉",
        created_at: "2026-03-12T10:30:00.000Z",
      },
    ];
    await expect(getCheckInsBySlotId("slot-1")).resolves.toHaveLength(1);

    checkInsError = { message: "checkins failed" };
    await expect(getCheckInsBySlotId("slot-2")).rejects.toThrow("checkins failed");
  });

  it("merges own and participated linkets, de-duplicates and sorts by creation date desc", async () => {
    mySlotsData = [
      {
        id: "mine-1",
        creator_id: "u1",
        title: "My newest",
        start_at: "2026-03-12T10:00:00.000Z",
        end_at: "2026-03-12T11:00:00.000Z",
        created_at: "2026-03-12T09:00:00.000Z",
      },
      {
        id: "shared-id",
        creator_id: "u1",
        title: "My shared",
        start_at: "2026-03-10T10:00:00.000Z",
        end_at: "2026-03-10T11:00:00.000Z",
        created_at: "2026-03-10T09:00:00.000Z",
      },
    ];

    participatedData = [
      {
        id: "other-1",
        creator_id: "u2",
        title: "Other room",
        start_at: "2026-03-11T10:00:00.000Z",
        end_at: "2026-03-11T11:00:00.000Z",
        created_at: "2026-03-11T09:00:00.000Z",
      },
      {
        id: "shared-id",
        creator_id: "u1",
        title: "Duplicate should be skipped",
        start_at: "2026-03-09T10:00:00.000Z",
        end_at: "2026-03-09T11:00:00.000Z",
        created_at: "2026-03-09T09:00:00.000Z",
      },
    ];

    const result = await getDashboardSlots("u1");

    expect(result.feed.map((item) => item.id)).toEqual(["mine-1", "other-1", "shared-id"]);
    expect(result.feed.find((item) => item.id === "mine-1")?.isMine).toBe(true);
    expect(result.feed.find((item) => item.id === "other-1")?.isMine).toBe(false);
    expect(result.feed).toHaveLength(3);
  });

  it("uses start_at as tie-breaker when created_at timestamps are equal", async () => {
    mySlotsData = [
      {
        id: "a",
        creator_id: "u1",
        title: "A",
        start_at: "2026-03-12T08:00:00.000Z",
        end_at: "2026-03-12T09:00:00.000Z",
        created_at: "2026-03-12T07:00:00.000Z",
      },
    ];
    participatedData = [
      {
        id: "b",
        creator_id: "u2",
        title: "B",
        start_at: "2026-03-12T10:00:00.000Z",
        end_at: "2026-03-12T11:00:00.000Z",
        created_at: "2026-03-12T07:00:00.000Z",
      },
    ];

    const result = await getDashboardSlots("u1");
    expect(result.feed.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("throws when own slots query fails", async () => {
    mySlotsError = { message: "slots failed" };
    await expect(getDashboardSlots("u1")).rejects.toThrow("slots failed");
  });

  it("throws when participated query fails", async () => {
    participatedError = { message: "rpc failed" };
    await expect(getDashboardSlots("u1")).rejects.toThrow("rpc failed");
  });
});

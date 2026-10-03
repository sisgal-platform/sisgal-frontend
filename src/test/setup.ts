import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("../services/auth/auth.service", () => ({
    supabase: {},
    signInWithPassword: vi.fn(),
    signOut: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
});

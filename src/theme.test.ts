import { describe, expect, it } from "vitest";
import { oppositeTheme, resolveInitialTheme } from "./theme.ts";

describe("resolveInitialTheme", () => {
  it("手動で保存したテーマを優先する", () => {
    expect(resolveInitialTheme("light", true, false)).toBe("light");
    expect(resolveInitialTheme("dark", false, true)).toBe("dark");
  });

  it("OSのダークモード設定を使う", () => {
    expect(resolveInitialTheme(null, true, false)).toBe("dark");
  });

  it("OSのライトモード設定を使う", () => {
    expect(resolveInitialTheme(null, false, true)).toBe("light");
  });

  it("OS設定を判断できなければライトモードにする", () => {
    expect(resolveInitialTheme(null, false, false)).toBe("light");
  });

  it("不正な保存値は無視する", () => {
    expect(resolveInitialTheme("sepia", false, false)).toBe("light");
  });
});

describe("oppositeTheme", () => {
  it("反対のテーマを返す", () => {
    expect(oppositeTheme("light")).toBe("dark");
    expect(oppositeTheme("dark")).toBe("light");
  });
});

import {
  obscureString,
  shortenString,
  removeVoiceFromString,
  shortenMultipleCharNames,
  firstNameOnly,
} from "./strings";

describe("string utilities", () => {
  test("obscureString masks only alphanumeric characters", () => {
    expect(obscureString("Abc-123! ?")).toBe("xxx-xxx! ?");
  });

  test("shortenString returns original when at or below limit", () => {
    const value = "a".repeat(300);
    expect(shortenString(value)).toBe(value);
  });

  test("shortenString truncates when over limit", () => {
    const value = "a".repeat(301);
    const result = shortenString(value);

    expect(result.length).toBe(303);
    expect(result.endsWith("...")).toBe(true);
  });

  test("removeVoiceFromString strips voice tag", () => {
    expect(removeVoiceFromString("Narrator (voice)")).toBe("Narrator ");
  });

  test("shortenMultipleCharNames keeps first two names", () => {
    expect(shortenMultipleCharNames("John / Jane / Jack")).toBe("John / Jane");
  });

  test("firstNameOnly extracts first token", () => {
    expect(firstNameOnly("Tom Hanks")).toBe("Tom");
  });
});

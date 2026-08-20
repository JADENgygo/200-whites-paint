export const japaneseColorNames: Readonly<Record<string, string>> = {
  White: "白",
  Ivory: "象牙色",
  Milk: "乳白色",
  "Pale Grey": "淡灰色",
  Snow: "雪色",
  "Snow White": "雪白",
  "White Smoke": "白煙色",
  "Pale Cherry Blossom": "桜白",
  "Pearl White": "真珠色",
  "Powder White": "粉白",
  "Bright Grey": "明灰色",
  Mercury: "水銀色",
};

export function formatColorName(englishName: string): string {
  const japaneseName = japaneseColorNames[englishName];
  return japaneseName ? `${englishName} (${japaneseName})` : englishName;
}

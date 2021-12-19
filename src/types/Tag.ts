const Tag = {
  none: '選択なし',
  electronics: '家電販売店',
  barber: '理容・美容店',
  glasses: 'メガネ・コンタクトレンズ・補聴器',
  convenience: 'コンビニ',
  restaurant: '飲食店',
  food: '飲食料品店',
  clothing: '衣料・身の回り品取扱店',
  supermarket: 'スーパー',
  service: 'その他サービス業',
  drugstore: 'ドラッグストア・調剤薬局',
  gas: 'ガソリンスタンド',
  retail: 'その他小売業',
  other: 'その他業種',
} as const;
type Tag = typeof Tag[keyof typeof Tag];

export function isTag(value: string): value is Tag {
  return (Object.values(Tag) as String[]).includes(value);
}

export default Tag;
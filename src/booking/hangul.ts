// Minimal 2-set (두벌식) Hangul composition for the on-screen keyboard.
// Stateless: each keystroke looks at the last character of the text and composes into it.

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];

const SYLLABLE_BASE = 0xac00;
const SYLLABLE_LAST = 0xd7a3;

const VOWEL_PAIRS: Record<string, string> = {
  ㅗㅏ: 'ㅘ', ㅗㅐ: 'ㅙ', ㅗㅣ: 'ㅚ', ㅜㅓ: 'ㅝ', ㅜㅔ: 'ㅞ', ㅜㅣ: 'ㅟ', ㅡㅣ: 'ㅢ',
};
const FINAL_PAIRS: Record<string, string> = {
  ㄱㅅ: 'ㄳ', ㄴㅈ: 'ㄵ', ㄴㅎ: 'ㄶ', ㄹㄱ: 'ㄺ', ㄹㅁ: 'ㄻ', ㄹㅂ: 'ㄼ', ㄹㅅ: 'ㄽ', ㄹㅌ: 'ㄾ', ㄹㅍ: 'ㄿ', ㄹㅎ: 'ㅀ', ㅂㅅ: 'ㅄ',
};
const split = (pairs: Record<string, string>) =>
  Object.fromEntries(Object.entries(pairs).map(([pair, joined]) => [joined, [...pair] as [string, string]]));
const VOWEL_SPLIT = split(VOWEL_PAIRS);
const FINAL_SPLIT = split(FINAL_PAIRS);

/** Shifted keys (쌍자음) */
export const SHIFTED: Record<string, string> = { ㅂ: 'ㅃ', ㅈ: 'ㅉ', ㄷ: 'ㄸ', ㄱ: 'ㄲ', ㅅ: 'ㅆ', ㅐ: 'ㅒ', ㅔ: 'ㅖ' };

type Syllable = { cho: number; jung: number; jong: number };

const isVowel = (c: string) => JUNG.includes(c);
const isConsonant = (c: string) => CHO.includes(c) || JONG.includes(c);

function decompose(ch: string): Syllable | null {
  const code = ch.charCodeAt(0) - SYLLABLE_BASE;
  if (code < 0 || code > SYLLABLE_LAST - SYLLABLE_BASE) return null;
  return { cho: Math.floor(code / 588), jung: Math.floor((code % 588) / 28), jong: code % 28 };
}

const compose = ({ cho, jung, jong }: Syllable) => String.fromCharCode(SYLLABLE_BASE + cho * 588 + jung * 28 + jong);

/** Append one jamo (or any other character) to `text`, composing Hangul syllables. */
export function typeKey(text: string, key: string): string {
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = last ? decompose(last) : null;

  if (isConsonant(key) && !isVowel(key)) {
    if (syl && syl.jong === 0 && JONG.includes(key)) return head + compose({ ...syl, jong: JONG.indexOf(key) });
    if (syl && syl.jong > 0) {
      const joined = FINAL_PAIRS[JONG[syl.jong] + key];
      if (joined) return head + compose({ ...syl, jong: JONG.indexOf(joined) });
    }
    return text + key;
  }

  if (isVowel(key)) {
    if (syl && syl.jong > 0) {
      // the final consonant moves to start the next syllable: 각 + ㅏ → 가가
      const jong = JONG[syl.jong];
      const [keep, move] = FINAL_SPLIT[jong] ?? ['', jong];
      const rest = compose({ ...syl, jong: JONG.indexOf(keep) });
      return head + rest + compose({ cho: CHO.indexOf(move), jung: JUNG.indexOf(key), jong: 0 });
    }
    if (syl) {
      const joined = VOWEL_PAIRS[JUNG[syl.jung] + key];
      return joined ? head + compose({ ...syl, jung: JUNG.indexOf(joined) }) : text + key;
    }
    if (CHO.includes(last)) return head + compose({ cho: CHO.indexOf(last), jung: JUNG.indexOf(key), jong: 0 });
    const joined = VOWEL_PAIRS[last + key];
    return joined ? head + joined : text + key;
  }

  return text + key;
}

/** Remove the last jamo (not the whole syllable): 각 → 가 → ㄱ → ''. */
export function backspace(text: string): string {
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = last ? decompose(last) : null;
  if (!syl) {
    const pair = VOWEL_SPLIT[last];
    return pair ? head + pair[0] : head;
  }
  if (syl.jong > 0) {
    const pair = FINAL_SPLIT[JONG[syl.jong]];
    return head + compose({ ...syl, jong: pair ? JONG.indexOf(pair[0]) : 0 });
  }
  const pair = VOWEL_SPLIT[JUNG[syl.jung]];
  return pair ? head + compose({ ...syl, jung: JUNG.indexOf(pair[0]) }) : head + CHO[syl.cho];
}

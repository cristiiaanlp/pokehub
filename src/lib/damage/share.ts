// Damage Calculator share-URL encoding.
//
// Codifica todo el estado del calc en query params cortos para que la URL sea
// compartible (Discord, Twitter). Mantenido fuera de la página para test
// unitario fácil y para reutilizar en parsing.

export interface SharedCalcState {
  // Attacker
  a: number; // species id
  al: number; // level
  an: string; // nature
  aae: number; // atk EV
  ase: number; // spa EV
  aa: string; // ability
  ai: string; // item
  ag: number; // attack stage (-6..6)
  // Defender
  d: number;
  dl: number;
  dn: string;
  dhe: number; // hp EV
  dde: number; // def EV
  dse: number; // spd EV
  da: string; // ability
  di: string; // item
  dg: number; // defense stage
  dhp: number; // current HP %
  // Move + field
  m: string; // move name
  w: string; // weather
  t: string; // terrain
  c: 0 | 1; // critical
  r: 0 | 1; // reflect
  ls: 0 | 1; // light screen
}

export function encodeCalcState(s: SharedCalcState): string {
  const p = new URLSearchParams();
  p.set('a', String(s.a));
  p.set('al', String(s.al));
  p.set('an', s.an);
  p.set('aae', String(s.aae));
  p.set('ase', String(s.ase));
  p.set('aa', s.aa);
  p.set('ai', s.ai);
  p.set('ag', String(s.ag));
  p.set('d', String(s.d));
  p.set('dl', String(s.dl));
  p.set('dn', s.dn);
  p.set('dhe', String(s.dhe));
  p.set('dde', String(s.dde));
  p.set('dse', String(s.dse));
  p.set('da', s.da);
  p.set('di', s.di);
  p.set('dg', String(s.dg));
  p.set('dhp', String(s.dhp));
  p.set('m', s.m);
  p.set('w', s.w);
  p.set('t', s.t);
  p.set('c', String(s.c));
  p.set('r', String(s.r));
  p.set('ls', String(s.ls));
  return p.toString();
}

export function decodeCalcState(
  search: string | URLSearchParams
): Partial<SharedCalcState> {
  const p = typeof search === 'string' ? new URLSearchParams(search) : search;
  const out: Partial<SharedCalcState> = {};
  const num = (k: keyof SharedCalcState, fallback?: number) => {
    const v = p.get(k as string);
    if (v === null) return;
    const n = Number(v);
    if (!Number.isFinite(n)) return;
    (out as Record<string, number>)[k as string] = n;
  };
  const str = (k: keyof SharedCalcState) => {
    const v = p.get(k as string);
    if (v === null) return;
    (out as Record<string, string>)[k as string] = v;
  };
  const bool = (k: keyof SharedCalcState) => {
    const v = p.get(k as string);
    if (v === null) return;
    (out as Record<string, 0 | 1>)[k as string] = v === '1' ? 1 : 0;
  };
  num('a');
  num('al');
  str('an');
  num('aae');
  num('ase');
  str('aa');
  str('ai');
  num('ag');
  num('d');
  num('dl');
  str('dn');
  num('dhe');
  num('dde');
  num('dse');
  str('da');
  str('di');
  num('dg');
  num('dhp');
  str('m');
  str('w');
  str('t');
  bool('c');
  bool('r');
  bool('ls');
  return out;
}

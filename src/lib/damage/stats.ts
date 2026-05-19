// Nature -> stat multipliers
export interface Nature {
  id: string;
  label: string;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export const POKEMON_NATURES: Record<string, Nature> = {
  neutral: { id: 'neutral', label: 'Hardy / Neutra', atk: 1, def: 1, spa: 1, spd: 1, spe: 1 },
  // +Atk
  adamant: { id: 'adamant', label: 'Adamant (+Atk –SpA)', atk: 1.1, def: 1, spa: 0.9, spd: 1, spe: 1 },
  jolly:    { id: 'jolly',    label: 'Jolly (+Spe –SpA)', atk: 1, def: 1, spa: 0.9, spd: 1, spe: 1.1 },
  brave:    { id: 'brave',    label: 'Brave (+Atk –Spe)',  atk: 1.1, def: 1, spa: 1, spd: 1, spe: 0.9 },
  naughty:  { id: 'naughty',  label: 'Naughty (+Atk –SpD)',atk: 1.1, def: 1, spa: 1, spd: 0.9, spe: 1 },
  lonely:   { id: 'lonely',   label: 'Lonely (+Atk –Def)', atk: 1.1, def: 0.9, spa: 1, spd: 1, spe: 1 },
  // +SpA
  modest:   { id: 'modest',   label: 'Modest (+SpA –Atk)', atk: 0.9, def: 1, spa: 1.1, spd: 1, spe: 1 },
  timid:    { id: 'timid',    label: 'Timid (+Spe –Atk)',  atk: 0.9, def: 1, spa: 1, spd: 1, spe: 1.1 },
  quiet:    { id: 'quiet',    label: 'Quiet (+SpA –Spe)',  atk: 1, def: 1, spa: 1.1, spd: 1, spe: 0.9 },
  rash:     { id: 'rash',     label: 'Rash (+SpA –SpD)',   atk: 1, def: 1, spa: 1.1, spd: 0.9, spe: 1 },
  mild:     { id: 'mild',     label: 'Mild (+SpA –Def)',   atk: 1, def: 0.9, spa: 1.1, spd: 1, spe: 1 },
  // +Def / +SpD bulky
  bold:     { id: 'bold',     label: 'Bold (+Def –Atk)',   atk: 0.9, def: 1.1, spa: 1, spd: 1, spe: 1 },
  calm:     { id: 'calm',     label: 'Calm (+SpD –Atk)',   atk: 0.9, def: 1, spa: 1, spd: 1.1, spe: 1 },
  impish:   { id: 'impish',   label: 'Impish (+Def –SpA)', atk: 1, def: 1.1, spa: 0.9, spd: 1, spe: 1 },
  careful:  { id: 'careful',  label: 'Careful (+SpD –SpA)',atk: 1, def: 1, spa: 0.9, spd: 1.1, spe: 1 },
  sassy:    { id: 'sassy',    label: 'Sassy (+SpD –Spe)',  atk: 1, def: 1, spa: 1, spd: 1.1, spe: 0.9 },
  relaxed:  { id: 'relaxed',  label: 'Relaxed (+Def –Spe)',atk: 1, def: 1.1, spa: 1, spd: 1, spe: 0.9 },
};

export interface EvSpread {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
}

export const DEFAULT_EVS_OFFENSIVE_PHYS: EvSpread = {
  hp: 4, atk: 252, def: 0, spa: 0, spd: 0,
};
export const DEFAULT_EVS_OFFENSIVE_SPEC: EvSpread = {
  hp: 4, atk: 0, def: 0, spa: 252, spd: 0,
};
export const DEFAULT_EVS_DEFENSIVE: EvSpread = {
  hp: 252, atk: 0, def: 252, spa: 0, spd: 4,
};

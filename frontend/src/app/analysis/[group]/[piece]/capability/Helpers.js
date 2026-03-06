export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const uid   = () => Math.random().toString(36).slice(2, 9);  
 
 
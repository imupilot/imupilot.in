export function isPro(profile) {
  return profile?.plan === 'pro' || profile?.plan === 'pro_max';
}

export function canAccessMockSet(setNumber, isFreeSet, profile) {
  if (isPro(profile)) return true;
  if (typeof isFreeSet === 'boolean') return isFreeSet;
  return Number(setNumber) <= 3; // sets 1, 2, 3 free by default
}

export function canAccessContent(isFreeContent, profile) {
  if (isPro(profile)) return true;
  return Boolean(isFreeContent);
}

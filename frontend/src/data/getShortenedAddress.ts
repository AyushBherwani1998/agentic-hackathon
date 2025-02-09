export function shortenAddress(longAddress: string): string {
  if (longAddress.length <= 8) {
    return longAddress; // Return the original string if it's too short
  }
  const firstFourChar = longAddress.slice(0, 4);
  const lastFourChar = longAddress.slice(-4);
  return `${firstFourChar}...${lastFourChar}`;
}

export default shortenAddress;

export function extractWateringValue(str: String | null) {
    if (!str) {
        return null
    }
    const match = str.match(/[0-9]+/);
    return match ? parseInt(match[0], 10) : null;
}
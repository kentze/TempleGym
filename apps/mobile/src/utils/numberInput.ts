// Keeps only the characters a weight can contain: digits and one decimal point,
// with at most 2 decimal places and 6 characters in total. A comma becomes a
// point so phones set to a comma-decimal region still work.
export function cleanWeightInput(text: string): string {
    const withPoints = text.replace(/,/g, '.');
    let cleaned = withPoints.replace(/[^0-9.]/g, '');

    const firstPoint = cleaned.indexOf('.');

    if (firstPoint !== -1) {
        const wholePart = cleaned.slice(0, firstPoint);
        const decimalPart = cleaned.slice(firstPoint + 1).replace(/\./g, '').slice(0, 2);

        cleaned = wholePart + '.' + decimalPart;
    }

    return cleaned.slice(0, 6);
}

// Keeps only digits, with at most 3 of them.
export function cleanRepsInput(text: string): string {
    const digitsOnly = text.replace(/[^0-9]/g, '');

    return digitsOnly.slice(0, 3);
}

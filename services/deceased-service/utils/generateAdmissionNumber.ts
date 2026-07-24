/**
 * Generate admission number in format: ADM-M/A01 or ADM-M/A001
 * Sequence progression:
 * - A01 to A99, then B01 to B99 ... up to Z99 (3 characters total after '/')
 * - After Z99, it cycles to A001 to A099, B001 to B099 ... up to Z099 (4 characters total after '/')
 * 
 * @param gender - "Male" | "Female" | "M" | "F"
 * @param sequence - Sequential number for this tenant (1-based index)
 * @returns Admission number like "ADM-M/A01"
 */
const generateAdmissionNumber = (
    gender: "Male" | "Female" | "M" | "F" | string,
    sequence: number
): string => {
    const genderPrefix = gender?.toUpperCase() === "FEMALE" || gender?.toUpperCase() === "F"
        ? "F"
        : "M";

    // Ensure sequence starts at 1
    const seq = Math.max(1, sequence);

    let letterIndex = 0;
    let numberVal = 0;
    let useFourDigits = false;

    if (seq <= 2574) {
        // Phase 1: 3 characters (e.g., A01 to Z99)
        const adjustedSeq = seq - 1;
        letterIndex = Math.floor(adjustedSeq / 99);
        numberVal = (adjustedSeq % 99) + 1;
        useFourDigits = false;
    } else {
        // Phase 2: 4 characters (e.g., A001 to Z099) and beyond if looping
        const adjustedSeq = (seq - 2574 - 1);
        const totalPhaseCapacity = 26 * 99;
        const cycleSeq = adjustedSeq % totalPhaseCapacity;

        letterIndex = Math.floor(cycleSeq / 99);
        numberVal = (cycleSeq % 99) + 1;
        useFourDigits = true;
    }

    const letter = String.fromCharCode(65 + (letterIndex % 26));
    const padLength = useFourDigits ? 3 : 2;
    const numberPart = String(numberVal).padStart(padLength, "0");

    const sequencePart = `${letter}${numberPart}`;

    return `ADM-${genderPrefix}/${sequencePart}`;
};

export default generateAdmissionNumber;
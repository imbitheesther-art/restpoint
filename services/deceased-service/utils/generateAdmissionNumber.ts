/**
 * Generate admission number in format: ADM-XXXXXX-XXXX
 * First 6 chars: Gender prefix (M/F) + 5-digit sequence
 * Last 4 chars: Random alphanumeric for uniqueness
 * 
 * @param gender - "Male" | "Female" | "M" | "F"
 * @param sequence - Sequential number for this tenant
 * @returns Admission number like "ADM-M00001-A3XK"
 */
const generateAdmissionNumber = (
    gender: "Male" | "Female" | "M" | "F" | string,
    sequence: number
): string => {
    const genderPrefix = gender?.toUpperCase() === "FEMALE" || gender?.toUpperCase() === "F"
        ? "F"
        : "M";

    const seqPart = String(sequence).padStart(5, "0");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `ADM-${genderPrefix}${seqPart}-${randomPart}`;
};

export default generateAdmissionNumber;
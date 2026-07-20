const generateAdmissionNumber = (
    tenantSlug: string,
    gender: "M" | "F",
    sequence: number
): string => {
    const tenant = tenantSlug
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 10)
        .toUpperCase();

    const letterIndex = Math.floor((sequence - 1) / 99);
    const letter = String.fromCharCode(65 + letterIndex); // A, B, C...

    const number = ((sequence - 1) % 99) + 1;

    return `${tenant}/${gender}/${letter}${number
        .toString()
        .padStart(2, "0")}`;
};


export   default   generateAdmissionNumber;
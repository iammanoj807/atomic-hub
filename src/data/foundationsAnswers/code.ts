/**
 * Write a code answer indented, as it sits in the file: `py\` ... \``.
 * Drops the first and last line breaks and the shared indent, and keeps
 * backslashes as typed, so "\n" in Python stays "\n".
 */
export const py = (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = String.raw({ raw: strings.raw }, ...values).replace(/^\n/, '').replace(/\n\s*$/, '');
    const lines = text.split('\n');
    const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^ */)![0].length));
    return lines.map(line => line.slice(indent)).join('\n');
};

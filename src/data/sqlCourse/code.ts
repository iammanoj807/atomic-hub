/**
 * A tag for SQL written inside the course files: drops the first and last
 * empty lines and the indentation every line shares, so a query can be
 * indented with the code around it but is stored flush left.
 */
export const code = (strings: TemplateStringsArray, ...values: unknown[]): string => {
    const lines = String.raw({ raw: strings }, ...values).replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
    const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.length - line.trimStart().length));
    return lines.map(line => line.slice(indent)).join('\n');
};

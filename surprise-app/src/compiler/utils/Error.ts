
export class ErrorTS {
    public line: number;
    public column: number;
    public type: string;
    public description: string
    constructor(line: number, column: number, type: string, description: string) {
        this.line = line
        this.column = column
        this.type = type
        this.description = description
    }

    public toString(): string {
        return `[ERR]: ${this.type}, ${this.description} (line: ${this.line}, column:${this.column})\n`;
    }
}
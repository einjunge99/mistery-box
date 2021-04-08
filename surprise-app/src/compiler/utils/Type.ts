export enum Types {
    NUMBER = "number",
    STRING = "string",
    BOOLEAN = "boolean",
    VOID = "void",
    NULL = 'null'
}

export class Type {
    type: Types;
    constructor(type: Types) {
        this.type = type
    }
}

export function getType(str: string) {
    switch (str) {
        case 'number':
            return new Type(Types.NUMBER)
        case 'string':
            return new Type(Types.STRING)
        case 'boolean':
            return new Type(Types.BOOLEAN)
        case 'void':
            return new Type(Types.VOID)
    }
}

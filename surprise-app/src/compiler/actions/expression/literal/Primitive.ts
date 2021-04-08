import { Generator } from "../../../Generator";
import { Return } from "../../../utils/Return";
import { Environment } from "../../../Environment";
import { Types, Type } from "../../../utils/Type";
import { Expression } from "../../../abstract/Expression";

export class Primitive extends Expression {
    private value: any
    private type: Types
    constructor(value: any, line: number, column: number, type: Types) {
        super(line, column);
        this.value = value
        this.type = type
    }

    //@ts-ignore
    public compile(env: Environment): Return {
        switch (this.type) {
            case Types.NUMBER:
                return new Return(this.value, false, new Type(this.type));
            case Types.BOOLEAN:
                const generator = Generator.getInstance();
                const auxReturn = new Return('', false, new Type(this.type));
                this.trueLabel = this.trueLabel === '' ? generator.newLabel() : this.trueLabel;
                this.falseLabel = this.falseLabel === '' ? generator.newLabel() : this.falseLabel;
                this.value ? generator.addGoto(this.trueLabel) : generator.addGoto(this.falseLabel);
                auxReturn.trueLabel = this.trueLabel;
                auxReturn.falseLabel = this.falseLabel;
                return auxReturn;
            case Types.NULL:
                return new Return('-1', false, new Type(this.type));
        }
    }

}
import { Expression } from "../../../abstract/Expression";
import { Environment } from "../../../Environment";
import { Generator } from "../../../Generator";
import { Return } from "../../../utils/Return";
import { Type, Types } from "../../../utils/Type";

export class Complex extends Expression {

    private value: any
    private type: Types
    constructor(value: any, line: number, column: number, type: Types) {
        super(line, column);
        this.value = value
        this.type = type
    }

    public compile(env: Environment): Return {
        const generator = Generator.getInstance();
        const temp = generator.newTemporal();
        generator.addExpression(temp, 'h');
        for (let i = 0; i < this.value.length; i++) {
            generator.addSetHeap('h', this.value.charCodeAt(i));
            generator.nextHeap();
        }
        generator.addSetHeap('h', '-1');
        generator.nextHeap();
        return new Return(temp, true, new Type(this.type));
    }


}
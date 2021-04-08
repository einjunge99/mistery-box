import { InstructionC3D } from "./Abstract/Instruction"
import { FunctionC3D } from "./instruction/Function"
const parser = require("../grammar/interpreter");
export enum Type {
    RETURN = 'return',
    ACCESS = 'access',
    GOTO = 'goto',
    EXPRESSION = 'expression',
    LABEL = 'label',
    CONSOLE = 'console'
}

export class Interpreter {
    private static interpreter: Interpreter
    private functions: FunctionC3D[]
    private currentIndex: number
    stack: number[]
    heap: number[]
    variables: Map<string, number>;
    logs: any[]
    input: string
    console: string
    end: boolean

    private constructor() {
        this.functions = []
        this.currentIndex = 0
        this.stack = []
        this.heap = []
        this.variables = new Map()
        this.logs = []
        this.input = ''
        this.console = ''
        this.end = false
    }

    public restart(input: string) {
        this.input = input
        this.functions = []
        this.currentIndex = 0
        this.stack = []
        this.heap = []
        this.variables = new Map()
        this.logs = []
        this.console = ''
        this.end = false

        return this.setupFunctions(input)
    }

    public static getInstance() {
        return this.interpreter || (this.interpreter = new this())
    }

    public setupFunctions(input: string) {
        let line: number = -1;
        let node;
        try {
            node = parser.parse(input);
        } catch (error) {
            return { state: false, message: 'There was an error while generating your TAC!', line };
        }
        node.forEach((e: InstructionC3D, i: number) => {
            if (e instanceof FunctionC3D) {
                this.functions.push(e)
                if (e.getId() === 'main') {
                    line = e.getLine()
                    this.currentIndex = i
                }
            }
        });
        this.variables.set('p', 0)
        this.variables.set('h', 0)
        if (line == -1) return { state: false, message: 'main function not found', line };
        return { state: true, message: 'TAC generated successfully!', line };

    }

    private searchFunction(name: string) {
        this.functions.forEach((e, i) => {
            if (e.getId() === name) this.currentIndex = i
        });
    }

    public goForward() {
        const currentFunction: FunctionC3D = this.functions[this.currentIndex]
        const currentInstruction: InstructionC3D = currentFunction.getInstruction()
        const i = currentFunction.getIndex()
        const result = currentInstruction.debug()
        if (result?.type === Type.ACCESS) {
            this.logs.push({ functionIndex: this.currentIndex, instructionIndex: i })
            currentFunction.resetIndex()
            this.searchFunction(result.content)
        }
        else if (result?.type === Type.RETURN) {
            if (currentFunction.getId() === 'main') { this.end = true; return currentInstruction.getLine() }
            const { functionIndex, instructionIndex } = this.logs.pop()
            this.currentIndex = functionIndex
            this.functions[this.currentIndex].setIndex(instructionIndex)
        }
        else if (result?.type === Type.GOTO && result.content.goto) {
            currentFunction.goToLabel(result.content.label)
        }
        return currentInstruction.getLine()
    }

    public evaluateConditional(left: string, relational: string, right: string): boolean {
        const leftSearch = this.variables.get(left)
        const leftValue = leftSearch != undefined ? leftSearch : +left

        const rightSearch = this.variables.get(right)
        const rightValue = rightSearch != undefined ? rightSearch : +right
        return this.getRelationalResult(leftValue, rightValue, relational)
    }

    public evaluateExpresssion(target: string, left: string, right: string, op: string) {

        const targetIsStructure: boolean = this.isStructure(target)
        if (!targetIsStructure) {
            const leftIsStructure = this.isStructure(left)
            let leftSearch: number | undefined
            let leftValue: number
            if (leftIsStructure) {
                const splitted = left.split(',')
                leftSearch = this.variables.get(splitted[1])
                leftValue = leftSearch != undefined ? leftSearch : +splitted[1]
                leftValue = this.whichStructure(left) ? this.heap[leftValue] : this.stack[leftValue]
            }
            else {
                leftSearch = this.variables.get(left)
                leftValue = leftSearch != undefined ? leftSearch : +left
            }
            if (right === '') { this.variables.set(target, leftValue); return }
            const rightSearch = this.variables.get(right)
            const rightValue = rightSearch != undefined ? rightSearch : +right
            const result = this.getArithmeticResult(leftValue, rightValue, op)
            this.variables.set(target, result); return
        }

        const leftSearch = this.variables.get(left)
        const leftValue = leftSearch != undefined ? leftSearch : +left
        const splitted = target.split(',')
        const targetSearch = this.variables.get(splitted[1])
        const targetValue = targetSearch != undefined ? targetSearch : +splitted[1]
        this.whichStructure(target) ? this.heap[targetValue] = leftValue : this.stack[targetValue] = leftValue

    }

    private getRelationalResult(left: number, right: number, op: string): boolean {
        switch (op) {
            case '<=':
                return left <= right
            case '>=':
                return left >= right
            case '<':
                return left < right
            case '>':
                return left > right
            case '!=':
                return left !== right
            case '==':
                return left === right
        }
        return false;
    }

    private getArithmeticResult(left: number, right: number, op: string): number {
        switch (op) {
            case '+':
                return left + right
            case '-':
                return left - right
            case '*':
                return left * right
            case '/':
                return left / right
        }
        return 0;
    }

    public setOutput(cast: string, value: string) {
        const leftSearch = this.variables.get(value)
        const leftValue = leftSearch != undefined ? leftSearch : +value
        if (cast.includes('%f')) this.console += leftValue
        if (cast.includes('%c')) this.console += String.fromCharCode(leftValue)
    }

    private isStructure(structure: string): boolean {
        return structure.startsWith('Heap') || structure.startsWith('Stack')
    }
    private whichStructure(structure: string): boolean {
        return structure.startsWith('Heap')
    }
    public getHeap() {
        return this.heap
    }
    public getStack() {
        return this.stack
    }
    public getVariables() {
        return this.variables
    }
    public getConsole() {
        return this.console
    }

    public getEnd() {
        return this.end
    }

}
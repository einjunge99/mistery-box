import { Environment } from "./Environment";

export enum Natives {
  concat = 0,
  concat_str_bool = 1,
  concat_bool_str = 2,
  print_str = 3,
  cmp_str = 4,
  concat_num_str = 5,
  concat_str_num = 6,
}

export class Generator {
  private static generator: Generator;
  private temporal: number;
  private label: number;
  private code: string[];
  private functions: string[];
  private tempStorage: Set<string>;
  private natives: boolean[];

  private constructor() {
    this.temporal = 0;
    this.label = 0;
    this.code = [];
    this.functions = [];
    this.natives = [];
    this.clearNatives();
    this.tempStorage = new Set();
  }

  private clearNatives() {
    for (let i = 0; i < this.natives.length; i++) {
      this.natives[i] = false;;
    }
  }

  public static getInstance() {
    return this.generator || (this.generator = new this());
  }

  public getTempStorage() {
    return this.tempStorage;
  }

  public clearTempStorage() {
    this.tempStorage.clear();
  }

  public setTempStorage(tempStorage: Set<string>) {
    this.tempStorage = tempStorage;
  }

  public clearCode() {
    this.temporal = 0;
    this.label = 0;
    this.code = [];
    this.functions = [];
    this.natives = [];
    this.clearNatives();
    this.tempStorage = new Set();
  }


  public saveCode() {
    return this.code;
  }

  public clearPrevious() {
    this.code = [];
  }

  public setCode(code: string[]) {
    this.code = code;
  }

  public addFunction() {
    this.functions = this.functions.concat(this.code);
  }

  public addCode(code: string) {
    this.code.push(code);
  }

  public getFunctions() {
    let value = this.getNatives();
    value += this.functions.join('\n');
    return value
  }

  public getCode(): string {
    return this.code.join('\n');
  }

  public newTemporal(): string {
    const temp = 'T' + this.temporal++
    this.tempStorage.add(temp);
    return temp;
  }

  public newLabel(): string {
    return 'L' + this.label++;
  }

  public getTemporal(): number {
    return this.temporal
  }

  public addLabel(label: string) {
    this.code.push(`${label}:`);
  }

  public addExpression(target: string, left: any, right: any = '', operator: string = '') {
    this.code.push(`${target} = ${left} ${operator} ${right};`);
  }

  public addfmod(target: string, left: any, right: any = '') {
    this.code.push(`${target} = fmod(${left},${right});`);
  }

  public addUnary(target: string, left: any,) {
    this.code.push(`${target} = ${left};`);
  }


  public addGoto(label: string) {
    this.code.push(`goto ${label};`);
  }

  public addIf(left: any, right: any, operator: string, label: string) {
    this.code.push(`if (${left} ${operator} ${right}) goto ${label};`);
  }

  public nextHeap() {
    this.code.push('h = h + 1;');
  }

  public addGetHeap(target: any, index: any) {
    this.code.push(`${target} = Heap[(int)${index}];`);
  }

  public addSetHeap(index: any, value: any) {
    this.code.push(`Heap[(int)${index}] = ${value};`);
  }

  public addGetStack(target: any, index: any) {
    this.code.push(`${target} = Stack[(int)${index}];`);
  }

  public addSetStack(index: any, value: any) {
    this.code.push(`Stack[(int)${index}] = ${value};`);
  }

  public addNextEnv(size: number) {
    this.code.push(`p = p + ${size};`);
  }

  public addPrevEnv(size: number) {
    this.code.push(`p = p - ${size};`);
  }

  public addCall(id: string) {
    this.code.push(` ${id}();`);
  }

  public addBegin(id: string) {
    this.code.push(`\nvoid ${id}(){`);
  }

  public addEnd() {
    this.code.push(`return;\n}\n`);
  }

  public addPrint(format: string, value: any) {
    this.code.push(`printf("%${format}",${value});`);
  }

  public addPrintTrue() {
    this.addPrint('c', 't'.charCodeAt(0));
    this.addPrint('c', 'r'.charCodeAt(0));
    this.addPrint('c', 'u'.charCodeAt(0));
    this.addPrint('c', 'e'.charCodeAt(0));
  }

  public addPrintFalse() {
    this.addPrint('c', 'f'.charCodeAt(0));
    this.addPrint('c', 'a'.charCodeAt(0));
    this.addPrint('c', 'l'.charCodeAt(0));
    this.addPrint('c', 's'.charCodeAt(0));
    this.addPrint('c', 'e'.charCodeAt(0));
  }

  public addComment(comment: string) {
    this.code.push(`/***** ${comment} *****/`);
  }

  public freeTemp(temp: string) {
    if (this.tempStorage.has(temp)) {
      this.tempStorage.delete(temp);
    }
  }

  public addTemp(temp: string) {
    if (!this.tempStorage.has(temp))
      this.tempStorage.add(temp);
  }

  public saveTemps(enviorement: Environment): number {
    if (this.tempStorage.size > 0) {
      const temp = this.newTemporal(); this.freeTemp(temp);
      let size = 0;

      this.addComment('BEGIN Saving temps');
      this.addExpression(temp, 'p', enviorement.size, '+');
      this.tempStorage.forEach((value) => {
        size++;
        this.addSetStack(temp, value);
        if (size !== this.tempStorage.size)
          this.addExpression(temp, temp, '1', '+');
      });
      this.addComment('END Saving temps');
    }
    let ptr = enviorement.size;
    enviorement.size = ptr + this.tempStorage.size;
    return ptr;
  }

  public recoverTemps(enviorement: Environment, pos: number) {
    if (this.tempStorage.size > 0) {
      const temp = this.newTemporal(); this.freeTemp(temp);
      let size = 0;

      this.addComment('BEGIN Recovering temps');
      this.addExpression(temp, 'p', pos, '+');
      this.tempStorage.forEach((value) => {
        size++;
        this.addGetStack(value, temp);
        if (size !== this.tempStorage.size)
          this.addExpression(temp, temp, '1', '+');
      });
      this.addComment('END Recovering temps');
      enviorement.size = pos;
    }
  }

  public addNative(n: Natives) {
    this.natives[n] = true;
  }

  public getNatives(): string {
    const natives: string[] = [];
    this.natives.forEach((i, u) => {
      if (i) {
        switch (u) {
          case 0:
            natives.push(this.native_concat()); break
          case 1:
            natives.push(this.native_concat_str_bool()); break;
          case 2:
            natives.push(this.native_concat_bool_str()); break;
          case 3:
            natives.push(this.native_print_str()); break;
          case 4:
            natives.push(this.native_cmp_str()); break;
          case 5:
            natives.push(this.native_concat_num_str()); break;
          case 6:
            natives.push(this.native_concat_str_num()); break;
        }
      }
    });
    return natives.join("\n");
  }


  public native_concat(): string {
    return `void native_concat()
        {
          N0 = p + 1;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
          N3 = h;
        L0:
          if (N2 != -1)
            goto L1;
          goto L2;
        L1:
          Heap[(int)h] = N2;
          h = h + 1;
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          goto L0;
        L2:
          N0 = p + 2;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
        L3:
          if (N2 != -1)
            goto L4;
          goto L5;
        L4:
          Heap[(int)h] = N2;
          h = h + 1;
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          goto L3;
        L5:
          Heap[(int)h] = -1;
          h = h + 1;
          Stack[(int)p] = N3;
          return;
        }\n`
  }

  public native_concat_str_bool(): string {
    return `void native_concat_str_bool()
        {
          N0 = p + 1;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
          N3 = h;
        L0:
          if (N2 != -1)
            goto L1;
          goto L2;
        L1:
          Heap[(int)h] = N2;
          h = h + 1;
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          goto L0;
        L2:
          N0 = p + 2;
          N1 = Stack[(int)N0];
          if (N1 == 1)
            goto L3;
          goto L4;
        L3:
          Heap[(int)h] = 116;
          h = h + 1;
          Heap[(int)h] = 114;
          h = h + 1;
          Heap[(int)h] = 117;
          h = h + 1;
          Heap[(int)h] = 101;
          h = h + 1;
          goto L5;
        L4:
          Heap[(int)h] = 102;
          h = h + 1;
          Heap[(int)h] = 97;
          h = h + 1;
          Heap[(int)h] = 108;
          h = h + 1;
          Heap[(int)h] = 115;
          h = h + 1;
          Heap[(int)h] = 101;
          h = h + 1;
        L5:
          Heap[(int)h] = -1;
          h = h + 1;
          Stack[(int)p] = N3;
          return;
        }\n`
  }

  public native_concat_bool_str(): string {
    return `void native_concat_bool_str()
        {
          N0 = p + 1;
          N1 = Stack[(int)N0];
          N3 = h;
          if (N1 == 1)
            goto L0;
          goto L1;
        L0:
          Heap[(int)h] = 116;
          h = h + 1;
          Heap[(int)h] = 114;
          h = h + 1;
          Heap[(int)h] = 117;
          h = h + 1;
          Heap[(int)h] = 101;
          h = h + 1;
          goto L2;
        L1:
          Heap[(int)h] = 102;
          h = h + 1;
          Heap[(int)h] = 97;
          h = h + 1;
          Heap[(int)h] = 108;
          h = h + 1;
          Heap[(int)h] = 115;
          h = h + 1;
          Heap[(int)h] = 101;
          h = h + 1;
        L2:
          N0 = p + 2;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
        L5:
          if (N2 != -1)
            goto L3;
          goto L4;
        L3:
          Heap[(int)h] = N2;
          h = h + 1;
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          goto L5;
        L4:
          Heap[(int)h] = -1;
          h = h + 1;
          Stack[(int)p] = N3;
          return;
        }\n`
  }

  public native_print_str(): string {
    return `void native_print_str()
        {
          N0 = p + 0;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
        L0:
          if (N2 != -1)
            goto L1;
          goto L2;
        L1:
          if (N2 != 92)
            goto L3;
          goto L4;
        L4:
          N3 = N1 + 1;
          N2 = Heap[(int)N3];
          if (N2 == -1)
            goto L2;
          goto L5;
        L5:
          if (N2 == 92)
            goto L6;
          goto L7;
        L7:
          if (N2 == 34)
            goto L8;
          goto L9;
        L9:
          if (N2 == 110)
            goto L10;
          goto L11;
        L11:
          if (N2 == 114)
            goto L12;
          goto L13;
        L13:
          if (N2 == 116)
            goto L14;
          goto L15;
        L15:
          N2 = Heap[(int)N1];
          goto L3;
        L6:
          N1 = N1 + 1;
          N2 = 92;
          goto L3;
        L8:
          N1 = N1 + 1;
          N2 = 34;
          goto L3;
        L10:
          N1 = N1 + 1;
          N2 = 10;
          goto L3;
        L12:
          N1 = N1 + 1;
          N2 = 10;
          goto L3;
        L14:
          N1 = N1 + 1;
          N2 = 9;
          goto L3;
        L3:
          printf("%c", (int)N2);
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          goto L0;
        L2:
          //printf("%c", 10);
          return;
        }\n`
  }

  public native_cmp_str(): string {
    return `void native_cmp_str()
        {
          N0 = p + 1;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
        
          N3 = p + 2;
          N4 = Stack[(int)N3];
          N5 = Heap[(int)N4];
          N6 = 1;
        L0:
          if (N2 != -1)
            goto L1;
          goto L2;
        L1:
          if (N5 != -1)
            goto L3;
          goto L5;
        L3:
          if (N2 == N5)
            goto L4;
          goto L5;
        L4:
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          N5 = Heap[(int)N1];
          goto L0;
        L2:
          if (N5 == -1)
            goto L6;
          goto L5;
        L5:
          N6 = 0;
        L6:
          Stack[(int)p] = N6;
          return;
        }\n`
  }


  public native_concat_num_str(): string {
    return `void native_concat_num_str()
        {
          N7 = -1;
          N1 = p + 1;
          N2 = Stack[(int)N1];
          N3 = h;
          if (N2 < 0)
            goto L0;
          goto L1;
        L0:
          N7 = 45;
          N2 = 0 - N2;
        L1:
          N4 = fmod(N2, 10);
          N2 = N2 / 10;
          Heap[(int)h] = N4 + 48;
          h = h + 1;
          if (N2 < 1)
            goto L2;
          goto L1;
        L2:
          N4 = h - N3;
          N5 = h - N4;
          N6 = h;
          N3 = h;
          if (N7 == 45)
            goto L3;
          goto L4;
        L3:
          Heap[(int)h] = N7;
          h = h + 1;
        L4:
          if (N5 != N6)
            goto L5;
          goto L6;
        L5:
          N6 = N6 - 1;
          N2 = Heap[(int)N6];
          Heap[(int)h] = N2;
          h = h + 1;
          goto L4;
        L6:
          N0 = p + 2;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
        
        L7:
          if (N2 != -1)
            goto L8;
          goto L9;
        L8:
          Heap[(int)h] = N2;
          h = h + 1;
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          goto L7;
        L9:
          Heap[(int)h] = -1;
          h = h + 1;
          Stack[(int)p] = N3;
          return;
        }\n`
  }

  public native_concat_str_num(): string {
    return `void native_concat_str_num()
        {
          N7 = -1;
          N1 = p + 2;
          N2 = Stack[(int)N1];
          N3 = h;
          if (N2 < 0)
            goto L0;
          goto L1;
        L0:
          N7 = 45;
          N2 = 0 - N2;
        L1:
          N4 = fmod(N2, 10);
          N2 = N2 / 10;
          N4 = N4 + 48;
          Heap[(int)h] = N4;
          h = h + 1;
          if (N2 < 1)
            goto L2;
          goto L1;
        L2:
          N4 = h - N3;
          N5 = h - N4;
          N6 = h;
        
          N0 = p + 1;
          N1 = Stack[(int)N0];
          N2 = Heap[(int)N1];
          N3 = h;
        L3:
          if (N2 != -1)
            goto L4;
          goto L5;
        L4:
          Heap[(int)h] = N2;
          h = h + 1;
          N1 = N1 + 1;
          N2 = Heap[(int)N1];
          goto L3;
        L5:
          if (N7 == 45)
            goto L6;
          goto L7;
        L6:
          Heap[(int)h] = N7;
          h = h + 1;
        L7:
          if (N5 != N6)
            goto L8;
          goto L9;
        L8:
          N6 = N6 - 1;
          N2 = Heap[(int)N6];
          Heap[(int)h] = N2;
          h = h + 1;
          goto L7;
        L9:
          Heap[(int)h] = -1;
          h = h + 1;
          Stack[(int)p] = N3;
          return;
        }\n`
  }
}
// Shared arithmetic logic for the web visualizer.
// The visualizer uses arrays of digit nodes so it can animate each node and step.
export type DLLNode = {
  digit: number;
  id: string;
};

export type Operation = "add" | "subtract" | "multiply" | "divide";

export type Step = {
  description: string;
  activeIndices: { a: number[]; b: number[] };
  partialResult: DLLNode[];
  carry?: number;
  borrow?: number;
  digit?: number;
  aNodes?: DLLNode[];
  bNodes?: DLLNode[];
  partialRows?: DLLNode[][];
  resultString?: string;
};

export type ArithmeticRun = {
  result: DLLNode[];
  resultString: string;
  steps: Step[];
  normalizedA: DLLNode[];
  normalizedB: DLLNode[];
};

let idCounter = 0;

const makeId = (prefix: string) => `${prefix}-${idCounter++}`;

/**
 * Converts user input into digit nodes.
 * Non-digit characters are ignored so the UI always works with valid digits.
 */
export function parseDigits(value: string, prefix = "n"): DLLNode[] {
  const digits = value.replace(/\D/g, "").split("");
  const safeDigits = digits.length > 0 ? digits : ["0"];
  return safeDigits.map((digit, index) => ({
    digit: Number(digit),
    id: makeId(`${prefix}-${index}-${digit}`)
  }));
}

/**
 * Converts a list of digit nodes into a plain string.
 */
export function nodesToString(nodes: DLLNode[]): string {
  if (nodes.length === 0) {
    return "0";
  }

  return nodes.map((node) => node.digit).join("");
}

/**
 * Removes leading zeros while keeping one zero for the value 0.
 */
export function stripLeadingZeros(nodes: DLLNode[], prefix = "s"): DLLNode[] {
  let index = 0;
  while (index < nodes.length - 1 && nodes[index].digit === 0) {
    index++;
  }

  const stripped = nodes.slice(index);
  return stripped.length > 0 ? cloneNodes(stripped, prefix) : makeNodesFromString("0", prefix);
}

/**
 * Builds digit nodes from an already-normalized numeric string.
 */
export function makeNodesFromString(value: string, prefix = "r"): DLLNode[] {
  return value.split("").map((digit, index) => ({
    digit: Number(digit),
    id: makeId(`${prefix}-${index}-${digit}`)
  }));
}

/**
 * Creates fresh nodes so animation keys remain stable and independent per step.
 */
function cloneNodes(nodes: DLLNode[], prefix = "c"): DLLNode[] {
  return nodes.map((node, index) => ({
    digit: node.digit,
    id: makeId(`${prefix}-${index}-${node.digit}`)
  }));
}

/**
 * Compares two non-negative integer strings without converting them to Number.
 * This keeps the visualizer safe for very large values.
 */
function compareStrings(a: string, b: string): number {
  const left = trimZeros(a);
  const right = trimZeros(b);

  if (left.length > right.length) return 1;
  if (left.length < right.length) return -1;
  if (left > right) return 1;
  if (left < right) return -1;
  return 0;
}

/**
 * Normalizes a string by removing unnecessary leading zeros.
 */
function trimZeros(value: string): string {
  const trimmed = value.replace(/^0+(?=\d)/, "");
  return trimmed.length > 0 ? trimmed : "0";
}

/**
 * Subtracts b from a for non-negative integer strings where a >= b.
 */
function subtractStrings(a: string, b: string): string {
  let i = a.length - 1;
  let j = b.length - 1;
  let borrow = 0;
  const out: number[] = [];

  while (i >= 0) {
    let top = Number(a[i]) - borrow;
    const bottom = j >= 0 ? Number(b[j]) : 0;

    if (top < bottom) {
      top += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }

    out.unshift(top - bottom);
    i--;
    j--;
  }

  return trimZeros(out.join(""));
}

/**
 * Adds two non-negative integer strings digit by digit.
 */
function addStrings(a: string, b: string): string {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  const out: number[] = [];

  while (i >= 0 || j >= 0 || carry > 0) {
    const left = i >= 0 ? Number(a[i]) : 0;
    const right = j >= 0 ? Number(b[j]) : 0;
    const sum = left + right + carry;
    out.unshift(sum % 10);
    carry = Math.floor(sum / 10);
    i--;
    j--;
  }

  return trimZeros(out.join(""));
}

/**
 * Creates one step object for the visualizer timeline.
 */
function makeStep(
  description: string,
  activeIndices: { a: number[]; b: number[] },
  partialResult: DLLNode[],
  extra: Partial<Step> = {}
): Step {
  return {
    description,
    activeIndices,
    partialResult,
    resultString: nodesToString(partialResult),
    ...extra
  };
}

/**
 * Adds setup steps when the input contains leading zeros that need to be stripped.
 */
function normalizationSteps(rawA: DLLNode[], rawB: DLLNode[], a: DLLNode[], b: DLLNode[]): Step[] {
  const steps: Step[] = [];
  const removedA: number[] = [];
  const removedB: number[] = [];

  for (let index = 0; index < rawA.length - 1 && rawA[index].digit === 0; index++) {
    removedA.push(index);
  }

  for (let index = 0; index < rawB.length - 1 && rawB[index].digit === 0; index++) {
    removedB.push(index);
  }

  if (removedA.length > 0 || removedB.length > 0) {
    steps.push(
      makeStep(
        "Strip leading zeros before calculation.",
        { a: removedA, b: removedB },
        [],
        { aNodes: rawA, bNodes: rawB }
      )
    );
    steps.push(
      makeStep(
        `Normalized inputs: m = ${nodesToString(a)}, n = ${nodesToString(b)}.`,
        { a: [], b: [] },
        [],
        { aNodes: a, bNodes: b }
      )
    );
  }

  return steps;
}

/**
 * Adds two digit-node arrays while recording every carry step.
 */
export function add(a: DLLNode[], b: DLLNode[]): { result: DLLNode[]; steps: Step[] } {
  const steps: Step[] = [];
  const resultDigits: number[] = [];
  let carry = 0;
  let i = a.length - 1;
  let j = b.length - 1;

  while (i >= 0 || j >= 0 || carry > 0) {
    const left = i >= 0 ? a[i].digit : 0;
    const right = j >= 0 ? b[j].digit : 0;
    const sum = left + right + carry;
    const digit = sum % 10;
    const nextCarry = Math.floor(sum / 10);

    resultDigits.unshift(digit);
    steps.push(
      makeStep(
        `${left} + ${right} + carry ${carry} = ${sum}; write ${digit}, carry ${nextCarry}.`,
        { a: i >= 0 ? [i] : [], b: j >= 0 ? [j] : [] },
        makeNodesFromString(resultDigits.join(""), "add-step"),
        { carry: nextCarry, aNodes: a, bNodes: b }
      )
    );

    carry = nextCarry;
    i--;
    j--;
  }

  const result = makeNodesFromString(trimZeros(resultDigits.join("")), "add-result");
  return { result, steps };
}

/**
 * Subtracts b from a while recording every borrow step.
 * If b is larger, the result string is handled as negative by runOperation().
 */
export function subtract(a: DLLNode[], b: DLLNode[]): { result: DLLNode[]; steps: Step[] } {
  const steps: Step[] = [];
  const cmp = compareStrings(nodesToString(a), nodesToString(b));

  if (cmp === 0) {
    const result = makeNodesFromString("0", "sub-result");
    steps.push(makeStep("Both numbers are equal; result is 0.", { a: [], b: [] }, result, { aNodes: a, bNodes: b }));
    return { result, steps };
  }

  const top = cmp >= 0 ? a : b;
  const bottom = cmp >= 0 ? b : a;
  const topKey = cmp >= 0 ? "m" : "n";
  const sign = cmp >= 0 ? "" : "-";
  const resultDigits: number[] = [];
  let borrow = 0;
  let i = top.length - 1;
  let j = bottom.length - 1;

  while (i >= 0) {
    const originalTop = top[i].digit;
    const bottomDigit = j >= 0 ? bottom[j].digit : 0;
    let currentTop = originalTop - borrow;
    let nextBorrow = 0;

    if (currentTop < bottomDigit) {
      currentTop += 10;
      nextBorrow = 1;
    }

    const digit = currentTop - bottomDigit;
    resultDigits.unshift(digit);

    const active = cmp >= 0
      ? { a: [i], b: j >= 0 ? [j] : [] }
      : { a: j >= 0 ? [j] : [], b: [i] };

    steps.push(
      makeStep(
        `${topKey} digit ${originalTop} minus borrow ${borrow}, subtract ${bottomDigit}; write ${digit}, borrow ${nextBorrow}.`,
        active,
        makeNodesFromString(trimZeros(resultDigits.join("")), "sub-step"),
        { borrow: nextBorrow, aNodes: a, bNodes: b, resultString: sign + trimZeros(resultDigits.join("")) }
      )
    );

    borrow = nextBorrow;
    i--;
    j--;
  }

  const result = makeNodesFromString(trimZeros(resultDigits.join("")), "sub-result");
  return { result, steps };
}

/**
 * Multiplies two digit-node arrays with partial products, just like manual multiplication.
 */
export function multiply(a: DLLNode[], b: DLLNode[]): { result: DLLNode[]; steps: Step[] } {
  const steps: Step[] = [];
  const partialRows: DLLNode[][] = [];
  let runningTotal = "0";

  if (nodesToString(a) === "0" || nodesToString(b) === "0") {
    const result = makeNodesFromString("0", "mul-result");
    steps.push(makeStep("One input is 0; multiplication result is 0.", { a: [], b: [] }, result, { aNodes: a, bNodes: b }));
    return { result, steps };
  }

  for (let j = b.length - 1; j >= 0; j--) {
    const multiplier = b[j].digit;
    const shift = b.length - 1 - j;
    const partialDigits: number[] = [];
    let carry = 0;

    for (let i = a.length - 1; i >= 0; i--) {
      const product = a[i].digit * multiplier + carry;
      const digit = product % 10;
      const nextCarry = Math.floor(product / 10);
      partialDigits.unshift(digit);

      const shiftedPartial = partialDigits.join("") + "0".repeat(shift);
      steps.push(
        makeStep(
          `${a[i].digit} * ${multiplier} + carry ${carry} = ${product}; write ${digit}, carry ${nextCarry}.`,
          { a: [i], b: [j] },
          makeNodesFromString(trimZeros(shiftedPartial), "mul-step"),
          { carry: nextCarry, aNodes: a, bNodes: b, partialRows: [...partialRows] }
        )
      );

      carry = nextCarry;
    }

    if (carry > 0) {
      partialDigits.unshift(carry);
      steps.push(
        makeStep(
          `Carry ${carry} becomes the leading digit of this partial product.`,
          { a: [], b: [j] },
          makeNodesFromString(partialDigits.join("") + "0".repeat(shift), "mul-carry"),
          { carry: 0, aNodes: a, bNodes: b, partialRows: [...partialRows] }
        )
      );
    }

    const partial = trimZeros(partialDigits.join("") + "0".repeat(shift));
    const partialNodes = makeNodesFromString(partial, "mul-row");
    partialRows.push(partialNodes);
    runningTotal = addStrings(runningTotal, partial);

    steps.push(
      makeStep(
        `Add partial product ${partial} to the running total: ${runningTotal}.`,
        { a: [], b: [j] },
        makeNodesFromString(runningTotal, "mul-total"),
        { aNodes: a, bNodes: b, partialRows: [...partialRows] }
      )
    );
  }

  const result = makeNodesFromString(runningTotal, "mul-result");
  return { result, steps };
}

/**
 * Divides a by b and records both integer and decimal calculation steps.
 * Decimal output is limited to 20 places, matching the Java CLI behavior.
 */
export function divide(a: DLLNode[], b: DLLNode[]): { result: DLLNode[]; steps: Step[]; resultString: string } {
  const steps: Step[] = [];
  const divisor = nodesToString(b);
  let remainder = nodesToString(a);
  let quotient = "0";

  if (divisor === "0") {
    const result = makeNodesFromString("0", "div-error");
    steps.push(makeStep("Cannot divide by zero.", { a: [], b: [] }, result, { aNodes: a, bNodes: b, resultString: "Cannot divide by zero" }));
    return { result, steps, resultString: "Cannot divide by zero" };
  }

  if (remainder === "0") {
    const result = makeNodesFromString("0", "div-zero");
    steps.push(makeStep("Dividend is 0; result is 0.", { a: [], b: [] }, result, { aNodes: a, bNodes: b }));
    return { result, steps, resultString: "0" };
  }

  while (compareStrings(remainder, divisor) >= 0) {
    let scaledDivisor = divisor;
    let zeroCount = 0;

    while (compareStrings(scaledDivisor + "0", remainder) <= 0) {
      scaledDivisor += "0";
      zeroCount++;
    }

    let digitCount = 0;
    while (compareStrings(remainder, scaledDivisor) >= 0) {
      remainder = subtractStrings(remainder, scaledDivisor);
      digitCount++;
      steps.push(
        makeStep(
          `Integer loop: subtract ${scaledDivisor}; remainder becomes ${remainder}.`,
          { a: [], b: [] },
          makeNodesFromString(quotient, "div-int"),
          { digit: digitCount, aNodes: a, bNodes: b, resultString: quotient }
        )
      );
    }

    const toAdd = `${digitCount}${"0".repeat(zeroCount)}`;
    quotient = addStrings(quotient, toAdd);
    steps.push(
      makeStep(
        `Add ${toAdd} to quotient; quotient is now ${quotient}.`,
        { a: [], b: [] },
        makeNodesFromString(quotient, "div-quotient"),
        { digit: digitCount, aNodes: a, bNodes: b, resultString: quotient }
      )
    );
  }

  if (remainder === "0") {
    const result = makeNodesFromString(quotient, "div-result");
    return { result, steps, resultString: quotient };
  }

  let decimals = "";
  for (let place = 1; place <= 20 && remainder !== "0"; place++) {
    remainder = trimZeros(remainder + "0");
    steps.push(
      makeStep(
        `Decimal place ${place}: multiply remainder by 10, so remainder is ${remainder}.`,
        { a: [], b: [] },
        makeNodesFromString(quotient + decimals, "div-decimal-start"),
        { aNodes: a, bNodes: b, resultString: `${quotient}.${decimals}` }
      )
    );

    let digit = 0;
    while (compareStrings(remainder, divisor) >= 0) {
      remainder = subtractStrings(remainder, divisor);
      digit++;
    }

    decimals += String(digit);
    steps.push(
      makeStep(
        `Divisor fits ${digit} time(s); append decimal digit ${digit}, remainder ${remainder}.`,
        { a: [], b: [] },
        makeNodesFromString(quotient + decimals, "div-decimal"),
        { digit, aNodes: a, bNodes: b, resultString: `${quotient}.${decimals}` }
      )
    );
  }

  const resultString = `${quotient}.${decimals}`;
  return {
    result: makeNodesFromString(quotient + decimals, "div-result"),
    steps,
    resultString
  };
}

/**
 * Main dispatcher used by the UI.
 * It normalizes inputs, runs the selected operation, and returns result plus animation steps.
 */
export function runOperation(rawM: string, rawN: string, operation: Operation): ArithmeticRun {
  const rawA = parseDigits(rawM, "raw-m");
  const rawB = parseDigits(rawN, "raw-n");
  const normalizedA = stripLeadingZeros(rawA, "m");
  const normalizedB = stripLeadingZeros(rawB, "n");
  const steps = normalizationSteps(rawA, rawB, normalizedA, normalizedB);

  let calculation: { result: DLLNode[]; steps: Step[]; resultString: string };

  if (operation === "add") {
    const output = add(normalizedA, normalizedB);
    calculation = { ...output, resultString: nodesToString(output.result) };
  } else if (operation === "subtract") {
    const output = subtract(normalizedA, normalizedB);
    const sign = compareStrings(nodesToString(normalizedA), nodesToString(normalizedB)) < 0 ? "-" : "";
    calculation = { ...output, resultString: sign + nodesToString(output.result) };
  } else if (operation === "multiply") {
    const output = multiply(normalizedA, normalizedB);
    calculation = { ...output, resultString: nodesToString(output.result) };
  } else {
    calculation = divide(normalizedA, normalizedB);
  }

  steps.push(...calculation.steps);

  if (steps.length === 0) {
    steps.push(
      makeStep(
        "Inputs are already normalized; ready to calculate.",
        { a: [], b: [] },
        [],
        { aNodes: normalizedA, bNodes: normalizedB }
      )
    );
  }

  return {
    result: calculation.result,
    resultString: calculation.resultString,
    steps,
    normalizedA,
    normalizedB
  };
}

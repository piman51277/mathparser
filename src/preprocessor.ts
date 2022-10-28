import { binaryOperators, multicharOperators, specialConstants, unaryOperators } from "./ops";
/**
 * Modifies the raw input into a format that is easier to parse.
 * @param input input string
 * @param impliedMult whether to imply multiplication operators
 */
export function preprocessor(input: string, implyMult = true): string[] {
  //copy the input
  let inputStr = input;

  //remove all spaces
  inputStr = inputStr.replace(/\s/g, "");

  //deconstruction

  //create mask for operator and variable positions
  let maskCount = 1;
  const mask: number[] = new Array(inputStr.length).fill(0);

  //find and mark all operators
  for (const operator of [
    ...multicharOperators,
    ...binaryOperators,
    ...unaryOperators,
    ...specialConstants
  ]) {
    //find all instances of the operator
    let searchIndex = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      //grab the first instance of the operator
      const operatorIndex = inputStr.indexOf(operator, searchIndex);

      //mask off the operator
      if (operatorIndex !== -1) {
        for (let i = operatorIndex; i < operatorIndex + operator.length; i++) {
          mask[i] = maskCount;
        }
        maskCount++;
        searchIndex = operatorIndex + operator.length;
      }

      //break if no more instances of the operator
      else {
        break;
      }
    }
  }

  //find and mark all variables
  for (let i = 0; i < inputStr.length; i++) {
    //if position is already marked as an operator, skip
    if (mask[i] !== 0) {
      continue;
    }

    //if position is a valid variable, mark it as such
    if (/[a-z]/.test(inputStr[i])) {
      mask[i] = maskCount;
      maskCount++;
    }

    //validity check: all unmasked positions should be numbers
    else if (!/[0-9.]/.test(inputStr[i])) {
      throw new Error("Invalid character: " + inputStr[i]);
    }
  }

  //split the input into an array of tokens using the mask
  //boundaries are marked by a change in mask value
  const tokens: string[] = [];
  let start = 0;
  for (let i = 0; i < mask.length + 1; i++) {
    if (mask[i] !== mask[start]) {
      tokens.push(inputStr.substring(start, i));
      start = i;
    }
  }

  //if we don't need implied mult, return the tokens
  if (!implyMult) {
    return tokens;
  }

  //add implied multiplication operators and implied negative signs

  //loop through tokens in pairs
  for (let i = 0, j = 1; j < tokens.length; j++ , i++) {
    const firstToken = tokens[i];
    const secondToken = tokens[j];

    const isFirstVarConst = /([a-z])|(-?[0-9]+(\.[0-9]+)?)/.test(firstToken);
    const isSecondVarConst = /([a-z])|(-?[0-9]+(\.[0-9]+)?)/.test(
      secondToken
    );

    console.log(firstToken, secondToken, isFirstVarConst, isSecondVarConst);

    //Case 1: variable/constant followed by variable/constant
    if (isFirstVarConst && isSecondVarConst) {
      tokens.splice(j, 0, "*");
    }

    //Case 2: variable/constant followed by left parenthesis/multi-character operator
    else if (
      isFirstVarConst &&
      (secondToken[0] === "(" || multicharOperators.includes(secondToken))
    ) {
      tokens.splice(j, 0, "*");
    }

    //Case 3: right parenthesis/bracket followed by variable/constant
    else if (
      (firstToken[0] === ")" || firstToken[0] === "}") &&
      isSecondVarConst
    ) {
      tokens.splice(j, 0, "*");
    }

    //Case 4: negative sign followed by variable/constant
    else if (firstToken === "-" && isSecondVarConst) {

      //negate the second token and add +
      tokens[j] = "-" + tokens[j];
      tokens[i] = "+";
    }
  }

  return tokens;
}

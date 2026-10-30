/* Copyright 2023 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

/**
 * Function that traverse the text given character by character
 *
 * @param {String} text
 * @returns {Array}
 */
function getTokensFromText(text) {
    const symbols = ["+", "-", "*", "/", "(", ")"];
    const tokens = [];
    let token = "";
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === " ") continue;
        if (symbols.includes(c)) {
            if (token !== "") {
                tokens.push(token);
                token = "";
            }
            tokens.push(c);
        } else {
            token += c;
        }
    }
    if (token !== "") {
        tokens.push(token);
    }
    return tokens;
}

/**
 * Function that executes an operation between the last two operands in the operands stack
 * and the last operator in the operators stack, and saves the result in the operands stack.
 *
 * @param {Array} operands
 * @param {Array} operators
 */
function executeOperation(operands, operators) {
    const b = operands.pop();
    const a = operands.pop();
    const op = operators.pop();
    switch (op) {
        case "+":
            operands.push(a + b);
            break;
        case "-":
            operands.push(a - b);
            break;
        case "*":
            operands.push(a * b);
            break;
        case "/":
            operands.push(a / b);
            break;
    }
}

/**
 * Function that returns the precedence of an operator
 *
 * @param {String} op
 * @returns {Number}
 */
function precedence(op) {
    if (op === "+" || op === "-") {
        return 1;
    }
    if (op === "*" || op === "/") {
        return 2;
    }
    if (op === "(" || op === ")") {
        return 0;
    }
}

/**
 * Helper function that takes a mathematical expression in text form and an object
 * of variable values, evaluates the expression, and returns the result.
 *
 * @param {String} text
 * @param {Object} values
 * @returns {any}
 */
export function evalOperation(text, values) {
    const tokens = getTokensFromText(text);
    const operands = [];
    const operators = [];
    for (const token of tokens) {
        if (!isNaN(token)) {
            // If the token is a number, convert it to a number and add it to the operands stack
            operands.push(Number(token));
        } else if (token in values) {
            // If the token is a variable, get its value from the object and add it to the operands stack
            operands.push(values[token]);
        } else if (token === "(") {
            // If the token is an open parenthesis, add it to the operators stack
            operators.push(token);
        } else if (token === ")") {
            // If the token is a closing parenthesis, pop and execute operators from the stack until an open parenthesis is found
            while (operators.length > 0 && operators[operators.length - 1] !== "(") {
                executeOperation(operands, operators);
            }
            // Pop the open parenthesis from the operators stack
            operators.pop();
        } else {
            // If the token is an operator, pop and execute operators from the stack while they have equal or higher precedence than the token
            while (
                operators.length > 0 &&
                precedence(operators[operators.length - 1]) >= precedence(token)
            ) {
                executeOperation(operands, operators);
            }
            // Add the token to the operators stack
            operators.push(token);
        }
    }
    while (operators.length > 0) {
        executeOperation(operands, operators);
    }
    return operands.pop();
}

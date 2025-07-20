document.addEventListener("DOMContentLoaded", () => {
  const display = document.querySelector(".calculator-display")
  const buttons = document.querySelector(".calculator-buttons")

  let displayValue = "0"
  let firstOperand = null
  let operator = null
  let waitingForSecondOperand = false // True after operator, next digit starts new number

  // Function to update the display
  function updateDisplay() {
    display.value = displayValue
  }

  // Handles digit input
  function inputDigit(digit) {
    if (waitingForSecondOperand) {
      displayValue = digit
      waitingForSecondOperand = false
    } else {
      // Prevent multiple leading zeros
      displayValue = displayValue === "0" ? digit : displayValue + digit
    }
    updateDisplay()
  }

  // Handles decimal point input
  function inputDecimal() {
    if (waitingForSecondOperand) {
      displayValue = "0."
      waitingForSecondOperand = false
      updateDisplay()
      return
    }
    if (!displayValue.includes(".")) {
      displayValue += "."
    }
    updateDisplay()
  }

  // Clears all calculator state
  function clearAll() {
    displayValue = "0"
    firstOperand = null
    operator = null
    waitingForSecondOperand = false
    updateDisplay()
  }

  // Rounds numbers to prevent floating point inaccuracies
  function roundResult(value, decimals = 10) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals)
  }

  // Performs the arithmetic calculation
  function performCalculation(num1, num2, op) {
    switch (op) {
      case "+":
        return roundResult(num1 + num2)
      case "-":
        return roundResult(num1 - num2)
      case "×":
        return roundResult(num1 * num2)
      case "÷":
        if (num2 === 0) {
          return "Error" // Indicate error for division by zero
        }
        return roundResult(num1 / num2)
      default:
        return num2
    }
  }

  // Handles operator input (+, -, ×, ÷)
  function handleOperator(nextOperator) {
    const inputValue = Number.parseFloat(displayValue)

    // If an operator is already set and we're waiting for the second operand,
    // just update the operator (e.g., 5 + * -> 5 * )
    if (operator && waitingForSecondOperand) {
      operator = nextOperator
      return
    }

    // If firstOperand is null, set the current input as the first operand
    if (firstOperand === null && !isNaN(inputValue)) {
      firstOperand = inputValue
    } else if (operator) {
      // If an operator exists, calculate the result
      const result = performCalculation(firstOperand, inputValue, operator)

      if (result === "Error") {
        displayValue = "Error"
        firstOperand = null
        operator = null
        waitingForSecondOperand = false
      } else {
        displayValue = String(result)
        firstOperand = result // Result becomes the new first operand for chaining
      }
    }

    waitingForSecondOperand = true
    operator = nextOperator
    updateDisplay()
  }

  // Handles the equals button
  function handleEquals() {
    const inputValue = Number.parseFloat(displayValue)

    if (firstOperand === null || operator === null || waitingForSecondOperand) {
      return // Nothing to calculate yet or incomplete expression
    }

    const result = performCalculation(firstOperand, inputValue, operator)

    if (result === "Error") {
      displayValue = "Error"
    } else {
      displayValue = String(result)
    }

    firstOperand = null // Reset for next calculation
    operator = null
    waitingForSecondOperand = true // Next digit input should start a new number
    updateDisplay()
  }

  // Event listener for button clicks
  buttons.addEventListener("click", (event) => {
    const { target } = event
    if (!target.matches("button")) {
      return // Not a button click
    }

    const action = target.dataset.action
    const value = target.dataset.value

    if (action === "clear") {
      clearAll()
    } else if (action === "calculate") {
      handleEquals()
    } else if (action === "decimal") {
      inputDecimal()
    } else if (target.classList.contains("operator")) {
      handleOperator(target.textContent) // Use textContent for operator symbol
    } else if (target.classList.contains("digit")) {
      inputDigit(value)
    }
  })

  // Keyboard support
  document.addEventListener("keydown", (event) => {
    const { key } = event

    if (/\d/.test(key)) {
      // Digits 0-9
      inputDigit(key)
    } else if (key === ".") {
      inputDecimal()
    } else if (key === "+") {
      handleOperator("+")
    } else if (key === "-") {
      handleOperator("-")
    } else if (key === "*" || key === "x") {
      handleOperator("×") // Map * or x to × for display consistency
    } else if (key === "/") {
      event.preventDefault() // Prevent browser quick find for '/'
      handleOperator("÷") // Map / to ÷ for display consistency
    } else if (key === "Enter" || key === "=") {
      handleEquals()
    } else if (key === "Escape" || key === "c" || key === "C") {
      clearAll()
    } else if (key === "Backspace") {
      if (displayValue.length > 1 && displayValue !== "0" && displayValue !== "Error") {
        displayValue = displayValue.slice(0, -1)
      } else {
        displayValue = "0"
      }
      updateDisplay()
    }
  })

  updateDisplay() // Initialize display on load
})

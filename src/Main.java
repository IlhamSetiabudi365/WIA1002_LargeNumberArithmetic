package src;

import java.util.Scanner;

/**
 * Entry point for the command-line version of the project.
 *
 * This class is responsible only for:
 * - reading and validating user input,
 * - converting the input strings into doubly linked lists,
 * - calling the arithmetic engine,
 * - printing each final answer.
 */
public class Main{
    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);

        System.out.println("Input:");
        String firstNumber = readNumber(scanner, "m = ");
        String secondNumber = readNumber(scanner, "n = ");

        DoublyLinkedList m = DoublyLinkedList.parse(firstNumber);
        DoublyLinkedList n = DoublyLinkedList.parse(secondNumber);

        System.out.println();
        System.out.println("Output:");
        printResult("addition", () -> ArithmeticEngine.add(m, n));
        printResult("subtraction", () -> ArithmeticEngine.subtract(m, n));
        printResult("multiplication", () -> ArithmeticEngine.multiply(m, n));
        printResult("division", () -> calculateDivision(m, n));
    }

    /**
     * Keeps asking the user for a number until the input is valid.
     * The assignment works with non-negative whole numbers, so only digits are accepted.
     */
    private static String readNumber(Scanner scanner, String prompt){
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();

            if (isValidWholeNumber(input)) {
                return input;
            }

            System.out.println("Please enter a non-negative whole number using digits only.");
        }
    }

    /**
     * Checks whether the input contains at least one character and all characters are digits.
     */
    private static boolean isValidWholeNumber(String input){
        if (input.isEmpty()) {
            return false;
        }

        for (int i = 0; i < input.length(); i++) {
            if (!Character.isDigit(input.charAt(i))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Handles the special division-by-zero case before calling the arithmetic engine.
     */
    private static DoublyLinkedList calculateDivision(DoublyLinkedList m, DoublyLinkedList n){
        if (n.toString().equals("0")) {
            throw new ArithmeticException("Cannot divide by zero.");
        }

        return ArithmeticEngine.divide(m, n);
    }

    /**
     * Runs one arithmetic operation and prints either the result or a readable error message.
     */
    private static void printResult(String operation, Operation calculation){
        try {
            DoublyLinkedList result = calculation.run();
            result.stripLeadingZeros();
            System.out.println(operation + " = " + result);
        } catch (UnsupportedOperationException ex) {
            System.out.println(operation + " = " + ex.getMessage());
        } catch (ArithmeticException ex) {
            System.out.println(operation + " = " + ex.getMessage());
        }
    }

    /**
     * Small functional interface so each arithmetic operation can be passed into printResult().
     */
    private interface Operation {
        DoublyLinkedList run();
    }
}

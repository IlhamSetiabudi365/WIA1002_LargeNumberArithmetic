package src;

import java.util.Scanner;

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

    private static DoublyLinkedList calculateDivision(DoublyLinkedList m, DoublyLinkedList n){
        if (n.toString().equals("0")) {
            throw new ArithmeticException("Cannot divide by zero.");
        }

        return ArithmeticEngine.divide(m, n);
    }

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

    private interface Operation {
        DoublyLinkedList run();
    }
}

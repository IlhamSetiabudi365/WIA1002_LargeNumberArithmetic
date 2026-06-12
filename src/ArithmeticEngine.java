package src;

/**
 * Contains the arithmetic algorithms for large numbers stored in doubly linked lists.
 *
 * Each node stores one digit. The algorithms usually start from the tail because
 * the tail contains the least significant digit, just like doing calculations by hand.
 */
public class ArithmeticEngine {

    /**
     * Adds two large non-negative numbers digit by digit from right to left.
     */
    public static DoublyLinkedList add(DoublyLinkedList a, DoublyLinkedList b){
        DoublyLinkedList result = new DoublyLinkedList();

        Node pA = a.getTail();
        Node pB = b.getTail();
        int carry = 0;

        // Continue while either number still has digits, or there is a leftover carry.
        while(pA != null || pB != null || carry != 0){
            int valA = (pA != null) ? pA.digit : 0;
            int valB = (pB != null) ? pB.digit : 0;

            int sum = valA + valB + carry;
            carry = sum / 10;

            // The current result digit is inserted at the front because we scan right to left.
            result.addFront(sum % 10);

            if (pA != null) pA = pA.prev;
            if (pB != null) pB = pB.prev;
        }
        
        result.stripLeadingZeros();
        return result;
    }

    /**
     * Subtracts b from a.
     *
     * If b is larger than a, the absolute difference is calculated first and the
     * result is marked as negative.
     */
    public static DoublyLinkedList subtract(DoublyLinkedList a, DoublyLinkedList b){
        int cmp = DoublyLinkedList.compare(a, b);
        if (cmp == 0) {
            return DoublyLinkedList.parse("0");
        }

        // Always subtract the smaller absolute value from the bigger absolute value.
        DoublyLinkedList bigger = (cmp == 1) ? a : b;
        DoublyLinkedList smaller = (cmp == 1) ? b : a;

        DoublyLinkedList result = new DoublyLinkedList();
        if (cmp == -1) result.setNegative(true);

        Node p1 = bigger.getTail();
        Node p2 = smaller.getTail();
        int borrow = 0;

        // Perform normal column subtraction from the least significant digit.
        while(p1 != null){
            int v1 = p1.digit;
            int v2 = (p2 != null) ? p2.digit : 0;

            int diff = v1 - v2 - borrow;

            if (diff < 0){
                diff += 10;
                borrow = 1;
            }else{
                borrow = 0;
            }

            result.addFront(diff);

            p1 = p1.prev;
            if(p2 != null) p2 = p2.prev;
        }

        result.stripLeadingZeros();
        return result;
    }

    /**
     * Multiplies two large numbers using the same partial-product method used by hand.
     */
    public static DoublyLinkedList multiply(DoublyLinkedList a, DoublyLinkedList b) {
        if (isZero(a) || isZero(b)) {
            return DoublyLinkedList.parse("0");
        }

        DoublyLinkedList finalResult = DoublyLinkedList.parse("0");
        Node pB = b.getTail();
        int shiftCount = 0; // Number of place-value zeros to append.

        // Loop through each multiplier digit from right to left.
        while (pB != null) {
            int digitB = pB.digit;
            
            // A zero multiplier digit contributes only a shifted zero partial product.
            if (digitB == 0) {
                shiftCount++;
                pB = pB.prev;
                continue;
            }

            DoublyLinkedList partialProduct = new DoublyLinkedList();
            Node pA = a.getTail();
            int carry = 0;

            // Multiply the current multiplier digit with every digit of a.
            while (pA != null || carry != 0) {
                int digitA = (pA != null) ? pA.digit : 0;
                
                int product = (digitA * digitB) + carry;
                carry = product / 10;
                partialProduct.addFront(product % 10);

                if (pA != null) pA = pA.prev;
            }

            // Shift the partial product according to the multiplier digit position.
            for (int i = 0; i < shiftCount; i++) {
                DoublyLinkedList.appendZero(partialProduct);
            }

            finalResult = ArithmeticEngine.add(finalResult, partialProduct);

            shiftCount++;
            pB = pB.prev;
        }

        // Keep sign handling here so the method also works if negative lists are introduced later.
        boolean resultIsNegative = a.isNegative() ^ b.isNegative();
        finalResult.setNegative(resultIsNegative);
        
        finalResult.stripLeadingZeros();
        return finalResult;
    }

    /**
     * Returns true when a list is empty, null, or represents the value zero.
     */
    private static boolean isZero(DoublyLinkedList list) {
        if (list == null || list.getTail() == null) return true;

        DoublyLinkedList normalized = DoublyLinkedList.copy(list);
        normalized.stripLeadingZeros();
        return normalized.toString().equals("0");
    }

    /**
     * Divides a by b and returns either an integer quotient or a display-only decimal result.
     *
     * The integer part is found using repeated subtraction with scaled divisors.
     * The decimal part is calculated up to 20 digits after the decimal point.
     */
    public static DoublyLinkedList divide(DoublyLinkedList a, DoublyLinkedList b) {
        DoublyLinkedList dividend = DoublyLinkedList.copy(a);
        DoublyLinkedList divisor = DoublyLinkedList.copy(b);
        dividend.stripLeadingZeros();
        divisor.stripLeadingZeros();

        if (isZero(divisor)) {
            throw new ArithmeticException("Cannot divide by zero.");
        }

        if (isZero(dividend)) {
            return DoublyLinkedList.parse("0");
        }

        DoublyLinkedList remainder = dividend;
        DoublyLinkedList quotient  = DoublyLinkedList.parse("0");

        // Integer part: keep reducing the remainder until it is smaller than the divisor.
        while (DoublyLinkedList.compare(remainder, divisor) >= 0) {
            DoublyLinkedList scaledB = DoublyLinkedList.copy(divisor);
            int zeroCount = 0;

            // Find the largest divisor * 10^zeroCount that still fits in the remainder.
            DoublyLinkedList tempCheck = DoublyLinkedList.copy(scaledB);
            DoublyLinkedList.appendZero(tempCheck);

            while (DoublyLinkedList.compare(tempCheck, remainder) <= 0) {
                DoublyLinkedList.appendZero(scaledB);
                zeroCount++;

                tempCheck = DoublyLinkedList.copy(scaledB);
                DoublyLinkedList.appendZero(tempCheck);
            }

            // Count how many times the scaled divisor fits in the current remainder.
            int digitCount = 0;
            while (DoublyLinkedList.compare(remainder, scaledB) >= 0) {
                remainder = subtract(remainder, scaledB);
                digitCount++;
            }

            // Add digitCount * 10^zeroCount to the quotient.
            DoublyLinkedList toAdd = DoublyLinkedList.parse(String.valueOf(digitCount));
            for (int i = 0; i < zeroCount; i++) {
                DoublyLinkedList.appendZero(toAdd);
            }
            quotient = add(quotient, toAdd);
        }

        quotient.stripLeadingZeros();

        // Exact division: no decimal digits are needed.
        if (isZero(remainder)) {
            return quotient;
        }

        // Decimal part: multiply the remainder by 10 for each decimal place.
        StringBuilder decimalDigits = new StringBuilder();
        int decimalCount = 0;

        while (decimalCount < 20) {
            DoublyLinkedList.appendZero(remainder);

            int digit = 0;
            while (DoublyLinkedList.compare(remainder, divisor) >= 0) {
                remainder = subtract(remainder, divisor);
                digit++;
            }

            decimalDigits.append(digit);
            decimalCount++;

            // Stop early if the decimal expansion ends.
            if (isZero(remainder)) {
                break;
            }
        }

        final String integerResult = quotient.toString();
        final String decimalResult = decimalDigits.toString();

        return DoublyLinkedList.decimalResult(integerResult + "." + decimalResult);
    }
}

package src;

public class ArithmeticEngine {

    public static DoublyLinkedList add(DoublyLinkedList a, DoublyLinkedList b){
        DoublyLinkedList result = new DoublyLinkedList();

        Node pA = a.getTail();
        Node pB = b.getTail();
        int carry = 0;

        while(pA != null || pB != null || carry != 0){

            int valA = (pA != null) ? pA.digit : 0;
            int valB = (pB != null) ? pB.digit : 0;

            int sum = valA + valB + carry;
            carry = sum / 10;

            result.addFront(sum % 10);

            if (pA != null) pA = pA.prev;
            if (pB != null) pB = pB.prev;

        }
        
        result.stripLeadingZeros();
        return result;
    }

    public static DoublyLinkedList subtract(DoublyLinkedList a, DoublyLinkedList b){

        int cmp = DoublyLinkedList.compare(a, b);
        if (cmp == 0) {
            return DoublyLinkedList.parse("0");
        }

        DoublyLinkedList bigger = (cmp == 1) ? a : b;
        DoublyLinkedList smaller = (cmp == 1) ? b : a;

        DoublyLinkedList result = new DoublyLinkedList();
        if (cmp == -1) result.setNegative(true);

        Node p1 = bigger.getTail();
        Node p2 = smaller.getTail();
        int borrow = 0;

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

    public static DoublyLinkedList multiply(DoublyLinkedList a, DoublyLinkedList b) {
    // 1. Handle base cases (if either number is 0)
    if (isZero(a) || isZero(b)) {
        return DoublyLinkedList.parse("0");
    }

    DoublyLinkedList finalResult = DoublyLinkedList.parse("0");
    Node pB = b.getTail();
    int shiftCount = 0; // Tracks how many zeros to append for place value (tens, hundreds, etc.)

    // 2. Loop through each digit of the second number (multiplier) from right to left
    while (pB != null) {
        int digitB = pB.digit;
        
        // Skip multiplication if the digit is 0 to save time, just increment the shift
        if (digitB == 0) {
            shiftCount++;
            pB = pB.prev;
            continue;
        }

        DoublyLinkedList partialProduct = new DoublyLinkedList();
        Node pA = a.getTail();
        int carry = 0;

        // 3. Multiply digitB with every digit of List A
        while (pA != null || carry != 0) {
            int digitA = (pA != null) ? pA.digit : 0;
            
            int product = (digitA * digitB) + carry;
            carry = product / 10;
            partialProduct.addFront(product % 10);

            if (pA != null) pA = pA.prev;
        }

        // 4. Shift the partial product by appending zeros based on its position
        for (int i = 0; i < shiftCount; i++) {
            DoublyLinkedList.appendZero(partialProduct);
        }

        // 5. Add this partial product to our running final total
        finalResult = ArithmeticEngine.add(finalResult, partialProduct);

        // Move to the next digit to the left in List B
        shiftCount++;
        pB = pB.prev;
    }

    // 6. Final cleanup of signs and leading zeros
    // (Positive * Negative = Negative, Negative * Negative = Positive)
    boolean resultIsNegative = a.isNegative() ^ b.isNegative(); // XOR logic for signs
    finalResult.setNegative(resultIsNegative);
    
    finalResult.stripLeadingZeros();
    return finalResult;
}

// Helper method to check if a list represents zero
private static boolean isZero(DoublyLinkedList list) {
    if (list == null || list.getTail() == null) return true;
    DoublyLinkedList normalized = DoublyLinkedList.copy(list);
    normalized.stripLeadingZeros();
    return normalized.toString().equals("0");
}

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

        // BAGIAN INTEGER
        // selama remainder masih >= b, cari kelipatan b yang paling
        // besar tapi masih muat di remainder, terus kurangi
        while (DoublyLinkedList.compare(remainder, divisor) >= 0) {

            // scale up b dulu - kalikan b dengan 10 berulang kali
            // sampai b * 10 sudah tidak muat lagi di dalam remainder
            DoublyLinkedList scaledB = DoublyLinkedList.copy(divisor);
            int zeroCount = 0;

            // tempCheck = scaledB * 10, buat ngecek apakah masih muat
            DoublyLinkedList tempCheck = DoublyLinkedList.copy(scaledB);
            DoublyLinkedList.appendZero(tempCheck);

            while (DoublyLinkedList.compare(tempCheck, remainder) <= 0) {
                DoublyLinkedList.appendZero(scaledB);
                zeroCount++;

                tempCheck = DoublyLinkedList.copy(scaledB);
                DoublyLinkedList.appendZero(tempCheck);
            }

            // hitung berapa kali scaledB bisa dikurangi dari remainder
            // ini ngasih satu digit dari hasil bagi
            int digitCount = 0;
            while (DoublyLinkedList.compare(remainder, scaledB) >= 0) {
                remainder = subtract(remainder, scaledB);
                digitCount++;
            }

            // tambahkan digitCount * 10^zeroCount ke quotient
            // contoh: digitCount=3, zeroCount=2 -> toAdd = 300
            DoublyLinkedList toAdd = DoublyLinkedList.parse(String.valueOf(digitCount));
            for (int i = 0; i < zeroCount; i++) {
                DoublyLinkedList.appendZero(toAdd);
            }
            quotient = add(quotient, toAdd);
        }

        quotient.stripLeadingZeros();

        // kalau remainder sudah 0, berarti bagi pas, ga perlu desimal
        if (isZero(remainder)) {
            return quotient;
        }

        // BAGIAN DESIMAL
        // remainder masih ada, lanjut hitung angka di belakang koma
        // kalikan remainder dengan 10 (appendZero), cari berapa kali b muat
        // ulangi sampai 20 angka atau remainder habis
        StringBuilder decimalDigits = new StringBuilder();
        int decimalCount = 0;

        while (decimalCount < 20) {

            // kalikan remainder dengan 10 (pakai Role 1)
            DoublyLinkedList.appendZero(remainder);

            // hitung berapa kali b muat di remainder yang udah dikali 10
            int digit = 0;
            while (DoublyLinkedList.compare(remainder, divisor) >= 0) {
                remainder = subtract(remainder, divisor);
                digit++;
            }

            decimalDigits.append(digit);
            decimalCount++;

            // kalau sisa nya udah 0, berhenti lebih awal
            if (isZero(remainder)) {
                break;
            }
        }

        // GABUNGIN HASIL INTEGER + DESIMAL
        final String integerResult = quotient.toString();
        final String decimalResult = decimalDigits.toString();

        return DoublyLinkedList.decimalResult(integerResult + "." + decimalResult);
    }
}

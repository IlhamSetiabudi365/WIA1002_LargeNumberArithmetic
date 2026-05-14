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

    public static DoublyLinkedList multiply(DoublyLinkedList a, DoublyLinkedList b){
        throw new UnsupportedOperationException("Multiplication is not implemented yet.");
    }

    public static DoublyLinkedList divide(DoublyLinkedList a, DoublyLinkedList b){
        throw new UnsupportedOperationException("Division is not implemented yet.");
    }
}

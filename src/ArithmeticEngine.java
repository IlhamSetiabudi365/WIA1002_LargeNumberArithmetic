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
        
        return result;
    }
}

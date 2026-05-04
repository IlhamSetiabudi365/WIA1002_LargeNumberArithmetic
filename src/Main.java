package src;

public class Main{
    public static void main(String[] args){
        // Test 1: basic parse and display
        DoublyLinkedList a = DoublyLinkedList.parse("12345");
        a.display(); // should print 12345

        // Test 2: strip leading zeros
        DoublyLinkedList b = DoublyLinkedList.parse("00123");
        b.stripLeadingZeros();
        b.display(); // should print 123

        // Test 3: compare
        DoublyLinkedList c = DoublyLinkedList.parse("999");
        DoublyLinkedList d = DoublyLinkedList.parse("1000");
        System.out.println(DoublyLinkedList.compare(c, d)); // should print -1

        // Test 4: copy independence
        DoublyLinkedList e = DoublyLinkedList.parse("42");
        DoublyLinkedList f = DoublyLinkedList.copy(e);
        f.addBack(9);
        e.display(); // should still print 42, not 429

        // Test 5: appendZero
        DoublyLinkedList g = DoublyLinkedList.parse("42");
        DoublyLinkedList.appendZero(g);
        g.display(); // should print 420

        DoublyLinkedList sumEG = ArithmeticEngine.add(e, g);
        sumEG.display();
        
    }
}
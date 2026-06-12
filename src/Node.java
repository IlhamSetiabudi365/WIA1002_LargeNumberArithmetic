package src;

/**
 * Represents a single digit in a large number.
 *
 * Each node stores one digit (0-9) and pointers to its neighbors.
 * The full number is formed by chaining nodes together in a DoublyLinkedList.
 */
public class Node {
    public int digit;  // Digit value from 0 to 9.
    public Node next;  // Next node toward the least significant digit.
    public Node prev;  // Previous node toward the most significant digit.

    public Node(int digit){
        this.digit = digit;
        this.next = null;
        this.prev = null;
    }
}

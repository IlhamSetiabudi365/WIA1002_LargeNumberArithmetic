package src;

/**
 * Represents a single digit in a large number.
 * Each node stores one digit (0-9) and pointers to its neighbors.
 * The full number is formed by chaining nodes together in a DoublyLinkedList.
 * Used by: ALL ROLES — every number in this project is made of these nodes.
 */
public class Node {
    int digit;  // the digit value (0-9)
    Node next;  // pointer to the next node (towards least significant digit / tail)
    Node prev;  // pointer to the previous node (towards most significant digit / head)

    public Node(int digit){
        this.digit = digit;
        // next and prev are automatically null — connection happens inside DoublyLinkedList
    }
}
package src;

public class DoublyLinkedList {
    private Node head;
    private Node tail;
    private int size;
    private boolean isNegative;

    public DoublyLinkedList(){
        size = 0;
        this.head = null;
        this.tail = null;
        isNegative = false;
    }

    public Node getTail() { return this.tail; }
    
    public void setNegative(boolean val) { this.isNegative = val; }
    /**
     * Adds a new digit node to the END (tail) of the list.
     * Used by: parse(), copy(), appendZero()
     * Useful for: ALL ROLES — core building block for constructing result lists.
     */
    public void addBack(int digit){
        Node newNode = new Node(digit);
        
        if(head == null){
            head = newNode;
            tail = newNode;
        }
        else{
            newNode.prev = tail;
            tail.next = newNode;
            tail = newNode;
        }
        size++;
    }

    /**
     * Adds a new digit node to the FRONT (head) of the list.
     * Used when building results digit by digit from right to left (least significant to most significant).
     * Useful for: ROLE 2 (addition, subtraction) — results are built by prepending digits.
     */
    public void addFront(int digit){
        Node newNode = new Node(digit);

        if(head == null){
            head = newNode;
            tail = newNode;
        }
        else{
            newNode.next = head;
            head.prev = newNode;
            head = newNode;
        }
        size++;
    }

    /**
     * Converts a number string (e.g. "123456789") into a DoublyLinkedList.
     * Each character is converted to an int digit and stored as a separate node.
     * Example: "123" → [1] ↔ [2] ↔ [3]
     * Useful for: ROLE 5 (CLI) — call this to parse user input into a list before passing to arithmetic methods.
     */
    public static DoublyLinkedList parse(String num) {
        DoublyLinkedList list = new DoublyLinkedList();
        
        for (int i = 0; i < num.length(); i++){
            char ch = num.charAt(i);
            int digit = Character.getNumericValue(ch);
            list.addBack(digit);
        }
        return list;
    }

    /**
     * Prints the number represented by this list to the console.
     * Traverses from head to tail, printing each digit.
     * Prints a "-" sign first if the number is negative (isNegative = true).
     * Example: [1] ↔ [2] ↔ [3] → prints "123"
     * Useful for: ROLE 5 (CLI) — call this to print the final result of any operation.
     */
    public void display(){
        Node curr = head;
        
        if(isNegative == true){
            System.out.print("-");
        }

        while(curr != null){
            System.out.print(curr.digit);
            curr = curr.next;
        }
        System.out.println();
    }

    /**
     * Removes leading zero nodes from the front of the list.
     * Stops when the head digit is non-zero OR only one node remains (to preserve "0" as a valid result).
     * Example: [0] ↔ [0] ↔ [1] ↔ [2] → [1] ↔ [2]
     * Useful for: ROLE 2 (subtraction) — call this after every subtraction to clean up the result.
     *             ROLE 3 (multiplication) — call after building the final product.
     *             ROLE 4 (division) — call after building the quotient.
     */
    public void stripLeadingZeros(){
        while(head.digit == 0 && size > 1){
            head = head.next;
            head.prev = null;
            size--;
        }
    }

    /**
     * Compares two lists as numbers.
     * Returns:  1 if a > b
     *          -1 if a < b
     *           0 if a == b
     * First compares by size (more digits = larger number).
     * If sizes are equal, compares digit by digit from left to right.
     * Useful for: ROLE 2 (subtraction) — determines which number is larger before subtracting.
     *             ROLE 4 (division) — checks if the current chunk is still larger than the divisor.
     */
    public static int compare(DoublyLinkedList a, DoublyLinkedList b){
        if(a.size > b.size){
            return 1;
        }
        else if(a.size < b.size){
            return -1;
        }
        else if (a.size == b.size){
            Node currA = a.head;
            Node currB = b.head;
            
            while(currA != null && currB != null){
                if (currA.digit > currB.digit){return 1;}
                if (currA.digit < currB.digit){return -1;}
                currA = currA.next;
                currB = currB.next;
            }
        }
        return 0;
    }

    /**
     * Creates a deep copy of a list — fully independent from the original.
     * Modifying the copy will NOT affect the original list.
     * Useful for: ROLE 3 (multiplication) — makes a fresh copy of the multiplicand for each digit
     *             of the multiplier, so the original number is never modified during calculation.
     */
    public static DoublyLinkedList copy(DoublyLinkedList originalList){
        DoublyLinkedList copiedList = new DoublyLinkedList();
        Node curr = originalList.head;
        while(curr != null){
            copiedList.addBack(curr.digit);
            curr = curr.next;
        }
        return copiedList;
    }

    /**
     * Appends a zero node to the tail of the list, effectively multiplying the number by 10.
     * Example: [4] ↔ [2] → [4] ↔ [2] ↔ [0] (42 becomes 420)
     * Useful for: ROLE 3 (multiplication) — shifts intermediate results to correct position
     *                                        (units digit = no shift, tens digit = 1 zero, etc.)
     *             ROLE 4 (division) — multiplies remainder by 10 to continue decimal calculation.
     */
    public static void appendZero(DoublyLinkedList list){
        list.addBack(0);
    }
}
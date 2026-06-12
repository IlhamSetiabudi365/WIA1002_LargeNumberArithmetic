package src;

/**
 * Represents a large number as a doubly linked list of digits.
 *
 * The head stores the most significant digit and the tail stores the least
 * significant digit. This layout allows the arithmetic algorithms to start from
 * the tail, which matches normal right-to-left column arithmetic.
 */
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

    public boolean isNegative() { return this.isNegative; }

    /**
     * Adds a new digit node to the END (tail) of the list.
     * This is used when building a number from left to right.
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
     * This is useful when an algorithm calculates digits from right to left.
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
     * Example: "123" becomes [1] <-> [2] <-> [3].
     */
    public static DoublyLinkedList parse(String num) {
        DoublyLinkedList list = new DoublyLinkedList();
        
        for (int i = 0; i < num.length(); i++){
            char ch = num.charAt(i);
            int digit = Character.getNumericValue(ch);
            list.addBack(digit);
        }
        list.stripLeadingZeros();
        return list;
    }

    /**
     * Prints the number represented by this list to the console.
     */
    public void display(){
        System.out.println(this);
    }

    /**
     * Converts the linked list back into a normal display string.
     */
    public String toString(){
        StringBuilder number = new StringBuilder();
        Node curr = head;
        
        if(isNegative == true){
            number.append("-");
        }

        while(curr != null){
            number.append(curr.digit);
            curr = curr.next;
        }

        return number.toString();
    }

    /**
     * Builds a display-only result such as "2.5" for division answers.
     * Decimal answers are not used as inputs for another arithmetic operation.
     */
    public static DoublyLinkedList decimalResult(String value) {
        return new DoublyLinkedList() {
            @Override
            public String toString() {
                return value;
            }

            @Override
            public void stripLeadingZeros() {
                // Already normalized before this display-only result is created.
            }
        };
    }

    /**
     * Removes leading zero nodes from the front of the list.
     * One zero node is kept so the number zero can still be represented.
     */
    public void stripLeadingZeros(){
        if (head == null) {
            addBack(0);
            return;
        }

        while(head.digit == 0 && size > 1){
            head = head.next;
            head.prev = null;
            size--;
        }

        if (size == 1 && head.digit == 0) {
            isNegative = false;
        }
    }

    /**
     * Compares two lists as numbers.
     * Returns 1 if a > b, -1 if a < b, and 0 if both values are equal.
     */
    public static int compare(DoublyLinkedList a, DoublyLinkedList b){
        // A number with more digits is larger after leading zeros have been removed.
        if(a.size > b.size){
            return 1;
        }
        else if(a.size < b.size){
            return -1;
        }
        else if (a.size == b.size){
            Node currA = a.head;
            Node currB = b.head;
            
            // If lengths match, compare digit by digit from most significant to least.
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
     * Creates a deep copy of a list.
     * Modifying the copy will not affect the original list.
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
     * Example: [4] <-> [2] becomes [4] <-> [2] <-> [0], so 42 becomes 420.
     */
    public static void appendZero(DoublyLinkedList list){
        list.addBack(0);
    }
}

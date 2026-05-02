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

    public static DoublyLinkedList parse(String num) {
        DoublyLinkedList list = new DoublyLinkedList();
        
        for (int i = 0; i < num.length(); i++){
            char ch = num.charAt(i);
            int digit = Character.getNumericValue(ch);
            list.addBack(digit);
        }
        return list;
    }

    public void display(){
        Node curr = head;
        
        if(isNegative == true){
            System.out.print("-");
        }

        while(curr != null){
            System.out.print(curr.digit);
            curr = curr.next;
        }
    }

    public void stripLeadingZeros(){
        while(head.digit == 0 && size > 1){
            head = head.next;
            head.prev = null;
            size--;
        }
    }

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

    public static DoublyLinkedList copy(DoublyLinkedList originalList){
        DoublyLinkedList copiedList = new DoublyLinkedList();
        Node curr = originalList.head;
        while(curr != null){
            copiedList.addBack(curr.digit);
            curr = curr.next;
        }
        return copiedList;
    }
}

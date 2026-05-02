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
}

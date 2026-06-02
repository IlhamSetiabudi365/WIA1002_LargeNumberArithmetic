# Large Number Arithmetic Visualizer

This project contains:

- A Java large number arithmetic program using a Doubly Linked List.
- A Next.js web visualizer that shows how each arithmetic operation walks through the list step by step.

Each digit is stored as one DLL node. For example, `1234` is represented as:

```text
[1] <-> [2] <-> [3] <-> [4]
 head                    tail
```

## Requirements

Install these first:

- Java JDK 17 or newer
- Node.js 18 or newer
- npm

Check your versions:

```bash
java -version
node -v
npm -v
```

## Run The Web Visualizer

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open this in your browser:

```text
http://localhost:3000
```

## Build The Web App

To check that the Next.js app builds correctly:

```bash
npm run build
```

## Run The Java CLI Program

Compile the Java files:

```bash
javac src/*.java
```

Run the program:

```bash
java src.Main
```

Then enter values for `m` and `n` when prompted.

## Supported Operations

- Addition
- Subtraction
- Multiplication
- Division, including decimal expansion up to 20 decimal places

The program also handles:

- Leading zeros, for example `005` becomes `5`
- Division by zero error messages
- Very large integers beyond normal primitive number limits

## Project Structure

```text
app/                  Next.js app pages and global styles
components/           React components for DLL nodes and diagrams
lib/arithmetic.ts     TypeScript arithmetic engine for the visualizer
src/                  Java source code
```

## Troubleshooting

If the website does not open, make sure the dev server is running:

```bash
npm run dev
```

If dependencies are missing, run:

```bash
npm install
```

If Java does not run, recompile first:

```bash
javac src/*.java
```

Generated files like `.next`, `node_modules`, and `.class` files are ignored by Git.

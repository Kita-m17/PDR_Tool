package com.pdr;

import java.util.Scanner;

import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;
import org.tweetyproject.logics.pl.syntax.Proposition;
import org.tweetyproject.logics.cl.syntax.Conditional;

import com.pdr.models.DefeasibleImplication;
import com.pdr.models.KnowledgeBase;

public class App {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        KnowledgeBase kb = new KnowledgeBase();

        System.out.println("Pedagogical Defeasible Reasoning Tool");
        System.out.println("=====================================");
        System.out.println("Enter formulas to build your knowledge base (type 'exit' to quit):");
        System.out.println("Format: implication, a, b      → a => b");
        System.out.println("        implication, a, !b     → a => !b");
        System.out.println("        defeasible, a, b       → a ~| b");
        System.out.println("        defeasible, a, !b       → a ~| !b");

        String in = scanner.nextLine();
        while (!in.equalsIgnoreCase("exit")) {
            String[] parts = in.split(",\\s*");

            if (parts.length < 3) {
                System.out.println("Invalid input. Format: type, left, right");
                in = scanner.nextLine();
                continue;
            }

            String type = parts[0].trim().toLowerCase();
            PlFormula left = parseFormula(parts[1].trim());
            PlFormula right = parseFormula(parts[2].trim());

            switch (type) {
                case "implication":
                    kb.add(new Implication(left, right));
                    break;
                case "defeasible":
                    kb.add(new DefeasibleImplication(left, right));
                    break;
                default:
                    System.out.println("Unknown formula type. Use 'implication' or 'defeasible'.");
                    in = scanner.nextLine();
                    continue;
            }

            System.out.println("Knowledge Base so far: " + kb);
            System.out.println("Enter formulas to build your knowledge base (type 'exit' to quit):");
            in = scanner.nextLine();
        }

        System.out.println("Final Knowledge Base: " + kb);

        System.out.println("Enter a query to check (type 'exit' to quit):");
        in = scanner.nextLine();
        String[] parts = in.split(",\\s*");

        if (parts.length < 3) {
            System.out.println("Invalid input. Format: type, left, right");
        }

        String type = parts[0].trim().toLowerCase();
        PlFormula left = parseFormula(parts[1].trim());
        PlFormula right = parseFormula(parts[2].trim());

        Implication query;

        switch (type) {
            case "implication":
                query = new Implication(left, right);
                break;
            case "defeasible":
                query = new DefeasibleImplication(left, right);
                break;
            default:
                System.out.println("Unknown formula type. Use 'implication' or 'defeasible'.");
                scanner.close();
                return;
        }

        System.out.println("Query:" + query.toString());
        scanner.close();
    }

    /**
     * Parses a single atom, supporting an optional leading '!' for negation.
     * e.g. "f" -> Proposition(f), "!f" -> Negation(Proposition(f))
     */
    private static PlFormula parseFormula(String token) {
        if (token.startsWith("!")) {
            return new Negation(new Proposition(token.substring(1)));
        }
        return new Proposition(token);
    }
}
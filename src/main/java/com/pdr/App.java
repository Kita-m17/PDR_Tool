package com.pdr;

import java.util.Scanner;

import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;
import org.tweetyproject.logics.pl.syntax.Proposition;
import org.tweetyproject.logics.cl.syntax.Conditional;

import com.pdr.models.BaseRankImplementation;
import com.pdr.models.DefeasibleImplication;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Rank;
import com.pdr.models.Ranking;


public class App {

    private static String describeRank(int rankNumber) {
        return rankNumber == Integer.MAX_VALUE ? "∞" : String.valueOf(rankNumber);
    }

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

        // System.out.println("Enter a query to check (type 'exit' to quit):");
        // in = scanner.nextLine();
        // String[] parts = in.split(",\\s*");

        // if (parts.length < 3) {
        //     System.out.println("Invalid input. Format: type, left, right");
        // }

        // String type = parts[0].trim().toLowerCase();
        // PlFormula left = parseFormula(parts[1].trim());
        // PlFormula right = parseFormula(parts[2].trim());

        // Implication query;

        // switch (type) {
        //     case "implication":
        //         query = new Implication(left, right);
        //         break;
        //     case "defeasible":
        //         query = new DefeasibleImplication(left, right);
        //         break;
        //     default:
        //         System.out.println("Unknown formula type. Use 'implication' or 'defeasible'.");
        //         scanner.close();
        //         return;
        // }

        // System.out.println("Query:" + query.toString());

        System.out.println("Knowledge Base: " + kb);
        System.out.println();
        BaseRankImplementation baseRank = BaseRankImplementation.constructBaseRank(kb);
        
        System.out .println("Trace of the algorithm:");
        for (var traceStep : baseRank.getTraceSteps()) {
            System.out.println("Step " + ": " + traceStep);
            System.out.println("--------------------------------------------------");
        }

        System.out.println();
        System.out.println("Final BaseRank Result:");
        System.out.println("n = " + baseRank.getN());
        System.out.println();

        System.out.println("Ranking:");
        for (Rank rank : baseRank.getRanking()) {
            System.out.println("Rank " + describeRank(rank.getRankNumber()) + ": " + rank.getFormulas());
        }

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
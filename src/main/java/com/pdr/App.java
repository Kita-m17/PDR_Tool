package com.pdr;

import java.util.Scanner;

import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;
import org.tweetyproject.logics.pl.syntax.Proposition;
// import org.tweetyproject.logics.cl.syntax.Conditional;

import com.pdr.models.BaseRankImplementation;
import com.pdr.models.DefeasibleImplication;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Rank;
// import com.pdr.models.Ranking;
import com.pdr.models.RationalClosureImpl;
import com.pdr.models.Entailment;


public class App {

    private static String describeRank(int rankNumber) {
        return rankNumber == Integer.MAX_VALUE ? "∞" : String.valueOf(rankNumber);
    }

    public static void main(String[] args) {
        // Scanner scanner = new Scanner(System.in);
        KnowledgeBase kb = new KnowledgeBase();
        System.out.println("===========================================");
        System.out.println("|| Pedagogical Defeasible Reasoning Tool ||");
        System.out.println("===========================================");
        System.out.println();
        // System.out.println("Enter formulas to build your knowledge base (type 'exit' to quit):");
        // System.out.println("Format: implication, a, b      → a => b");
        // System.out.println("        implication, a, !b     → a => !b");
        // System.out.println("        defeasible, a, b       → a ~| b");
        // System.out.println("        defeasible, a, !b       → a ~| !b");

        // String in = scanner.nextLine();
        // while (!in.equalsIgnoreCase("exit")) {
        //     String[] parts = in.split(",\\s*");

        //     if (parts.length < 3) {
        //         System.out.println("Invalid input. Format: type, left, right");
        //         in = scanner.nextLine();
        //         continue;
        //     }

        //     String type = parts[0].trim().toLowerCase();
        //     PlFormula left = parseFormula(parts[1].trim());
        //     PlFormula right = parseFormula(parts[2].trim());

        //     switch (type) {
        //         case "implication":
        //             kb.add(new Implication(left, right));
        //             break;
        //         case "defeasible":
        //             kb.add(new DefeasibleImplication(left, right));
        //             break;
        //         default:
        //             System.out.println("Unknown formula type. Use 'implication' or 'defeasible'.");
        //             in = scanner.nextLine();
        //             continue;
        //     }

        //     System.out.println("Knowledge Base so far: " + kb);
        //     System.out.println("Enter formulas to build your knowledge base (type 'exit' to quit):");
        //     in = scanner.nextLine();
        // }

        DefeasibleImplication def1 = new DefeasibleImplication(new Proposition("bird"), new Proposition("flies"));
        Implication imp1 = new Implication(new Proposition("penguin"), new Proposition("bird"));
        DefeasibleImplication def2 = new DefeasibleImplication(new Proposition("penguin"), new Negation(new Proposition("flies")));
        DefeasibleImplication def3 = new DefeasibleImplication(new Proposition("bird"), new Proposition("wings"));
        
        kb.add(def1);
        kb.add(imp1);
        kb.add(def2);
        kb.add(def3);

        System.out.println("Knowledge Base: ");
        for (var formula : kb) {
            System.out.println("  " + formula);
        }

        System.out.println();
        System.out.println("==============================================");
        System.out.println("||      PHASE 1: BaseRank Construction      ||");
        System.out.println("==============================================");
        System.out.println();

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

        BaseRankImplementation baseRank = BaseRankImplementation.constructBaseRank(kb);
        
        System.out .println("Step-through:");
        for (var traceStep : baseRank.getTraceSteps()) {
            if (traceStep.getConsideredFormulas().isEmpty()) 
                continue; // skip empty
            System.out.println(traceStep);
            System.out.println("===========================================");
        }

        System.out.println();
        System.out.println("Final Ranking:");
        for (Rank rank : baseRank.getRanking()) {
            System.out.println("Rank " + describeRank(rank.getRankNumber()) + ": " + rank.getFormulas());
        }

        DefeasibleImplication query = new DefeasibleImplication(new Proposition("penguin"), new Negation(new Proposition("flies")));

        System.out.println();
        System.out.println("==============================================");
        System.out.println("||   PHASE 2: Rational Closure Entailment   ||");
        System.out.println("==============================================");
        System.out.println();

        System.out.println();
        System.out.println("Query: " + query);
        System.out.println();

        System.out.println("  Does the knowledge base entail that " 
        + query.getFirstFormula() + " typically implies " 
        + query.getSecondFormula() + "?");
        System.out.println();

        Entailment entailment = new RationalClosureImpl().getEntailment(baseRank, query);

        System.out .println("Step-through:");
        for (var traceStep : entailment.getTraceSteps()) {
            System.out.println(traceStep);
            System.out.println("===========================================");
        }
        System.out.println();
        System.out.println("Result: " + query + " is " + (entailment.getEntailed() ? "entailed" : "not entailed"));
        System.out.println();

        System.out.println("  Interpretation: The knowledge base " 
        + (entailment.getEntailed() ? "DOES" : "DOES NOT") 
        + " defeasibly conclude that " 
        + query.getFirstFormula() + " typically " 
        + query.getSecondFormula() + ".");
        // scanner.close();
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
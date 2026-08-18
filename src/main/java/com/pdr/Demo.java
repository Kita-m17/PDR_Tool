package com.pdr;

import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.Proposition;

import com.pdr.models.BaseRank;
import com.pdr.models.DefeasibleImplication;
import com.pdr.models.Entailment;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.LexicographicEntailment;
import com.pdr.models.LexicographicStep;
import com.pdr.models.Rank;
import com.pdr.models.SubKnowledgeBaseCheck;
import com.pdr.services.BaseRankService;
import com.pdr.services.BaseRankServiceImp;
import com.pdr.services.LexicographicReasonerImpl;
import com.pdr.services.RationalReasonerImpl;



public class Demo {

    private static String describeRank(int rankNumber) {
        return rankNumber == Integer.MAX_VALUE ? "∞" : String.valueOf(rankNumber);
    }

    public static void main(String[] args) {
        // Scanner scanner = new Scanner(System.in);
        KnowledgeBase kb = new KnowledgeBase();
        BaseRankService baseRankService = new BaseRankServiceImp();
        
        System.out.println("===========================================");
        System.out.println("|| Pedagogical Defeasible Reasoning Tool ||");
        System.out.println("===========================================");
        System.out.println();

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

        BaseRank baseRank = baseRankService.constructBaseRank(kb);
        
        System.out .println("Step-through:");
        for (var traceStep : baseRank.getTraceSteps()) {
            if (traceStep.getConsideredFormulas().isEmpty()) 
                continue; // skip empty
            System.out.println(traceStep);
            System.out.println("");
        }

        // System.out.println();
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

        System.out.println("Does the knowledge base entail that " 
        + query.getFirstFormula() + " typically implies " 
        + query.getSecondFormula() + "?");
        System.out.println();

        Entailment entailment = new RationalReasonerImpl().getEntailment(baseRank, query);

        System.out .println("Step-through:");
        for (var traceStep : entailment.getTraceSteps()) {
            System.out.println(traceStep);
            System.out.println("");
        }
        System.out.println();
        System.out.println("Result: " + query + " is " + (entailment.getEntailed() ? "entailed" : "not entailed"));
        System.out.println();

        System.out.println("  Interpretation: The knowledge base " 
        + (entailment.getEntailed() ? "DOES" : "DOES NOT") 
        + " defeasibly conclude that " 
        + query.getFirstFormula() + " typically " 
        + query.getSecondFormula() + ".");


        System.out.println();
        System.out.println("==============================================");
        System.out.println("|| PHASE 3: Lexicographic Closure Entailment||");
        System.out.println("==============================================");
        System.out.println();
        System.out.println("Instead of discarding the rank, we form sub-knowledge bases to keep as many statements as");
        System.out.println("we can, dropping one more only when each sub-knowledge base still refutes");
        System.out.println("the antecedent.");
        System.out.println();
 
        Entailment lexicographic = new LexicographicReasonerImpl().getEntailment(baseRank, query);
        LexicographicEntailment lexicographicResult = (LexicographicEntailment) lexicographic;
 
        System.out .println("Step-through:");
        for (LexicographicStep traceStep : lexicographicResult.getLexicographicSteps()) {
            System.out.println(traceStep);
            System.out.println("");
        }
 
        System.out.println("Final check - the query must hold in surviving sub-knowledge bases:");
        for (SubKnowledgeBaseCheck check : lexicographicResult.getFinalChecks()) {
            System.out.println("   -> " + check);
        }
 
        System.out.println("Result: " + query + " is " + (lexicographic.getEntailed() ? "entailed" : "not entailed"));
    }
}


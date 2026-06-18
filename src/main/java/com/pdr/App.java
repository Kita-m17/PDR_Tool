package com.pdr;

import org.tweetyproject.logics.cl.reasoner.SimpleCReasoner;
import org.tweetyproject.logics.cl.syntax.ClBeliefSet;
import org.tweetyproject.logics.cl.syntax.Conditional;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.Proposition;

public class App {
    public static void main(String[] args) {
        Proposition p = new Proposition("p");
        Proposition b = new Proposition("b");
        Proposition f = new Proposition("f");

        Conditional penguinsAreBirds = new Conditional(p, b);
        Conditional birdsTypicallyFly = new Conditional(b, f);
        Conditional penguinsDoNotFly = new Conditional(p, new Negation(f));

        ClBeliefSet beliefSet = new ClBeliefSet();
        beliefSet.add(penguinsAreBirds);
        beliefSet.add(birdsTypicallyFly);
        beliefSet.add(penguinsDoNotFly);

        System.out.println("Belief Set: " + beliefSet);

        SimpleCReasoner reasoner = new SimpleCReasoner();
        System.out.println("Does the belief set entail that penguins fly? "
                + reasoner.query(beliefSet, f));
    }
}
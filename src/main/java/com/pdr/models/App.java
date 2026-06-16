package com.pdr.models;
import java.io.IOException;
import java.util.concurrent.locks.Condition;
import org.tweetyproject.logics.cl.reasoner.SimpleCReasoner;
import org.tweetyproject.logics.cl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlBeliefSet;
import org.tweetyproject.logics.pl.syntax.Proposition;
import org.tweetyproject.logics.pl.syntax.*;

public class App{

    public App() {
    }
    public static void main(String[] args) throws IOException {
        // Create a propositional logic formula
        Proposition p = new Proposition("p");
        Proposition b = new Proposition("b");
        Proposition f = new Proposition("f");
        Proposition w = new Proposition("w");

        Implication penguinsAreBirds = new Implication(p, b);
        Implication birdsTypicallyFly = new Implication(b, f);
        Implication penguinsDoNotFly = new Implication(p, new Negation(f));

        PlBeliefSet beliefSet = new PlBeliefSet();

        beliefSet.add(penguinsAreBirds);
        beliefSet.add(birdsTypicallyFly);
        beliefSet.add(penguinsDoNotFly);

        System.out.println("Belief Set: " + beliefSet);

        SimpleCReasoner reasoner = new SimpleCReasoner();

        System.out.println("Does the belief set entail that penguins fly? " + reasoner.query(beliefSet, f));

    }
}
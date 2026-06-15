/*
 *  This file is part of "TweetyProject", a collection of Java libraries for
 *  logical aspects of artificial intelligence and knowledge representation.
 *
 *  TweetyProject is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License version 3 as
 *  published by the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 *  Copyright 2016 The TweetyProject Team <http://tweetyproject.org/contact/>
 */


import org.tweetyproject.logics.cl.reasoner.RuleBasedCReasoner;
import org.tweetyproject.logics.cl.reasoner.ZReasoner;
import org.tweetyproject.logics.cl.semantics.RankingFunction;
import org.tweetyproject.logics.cl.syntax.*;
import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.*;

import java.util.*;

/**
 * Demonstrates how to construct a conditional logic knowledge base programmatically
 * and query it using the Simple C-reasoner.
 * <p>
 * This example creates a belief set of conditional statements and then uses the SimpleCReasoner
 * to compute and print a model for that belief set.
 * </p>
 */
public class tweety {

    /** Constructor */
    public tweety(){
        // default
    }

    /**
     * The main method where the example is executed.
     * <p>
         * This method creates propositions and conditional statements, adds them to a belief set,
         * and uses a simple C-reasoner to compute and display the model of the belief set.
     * </p>
     *
     * @param args command-line arguments (not used in this example)
     */

    public static List<PlBeliefSet> BaseRank(ClBeliefSet kb){
        List<PlBeliefSet> res = new ArrayList<>();
        int i =0;
        PlBeliefSet materialKb = new PlBeliefSet();
        SatReasoner reasoner = new SatReasoner();
        for (Conditional c : kb){
            materialKb.add(
                    new Implication(
                            c.getPremise().iterator().next(),
                      c.getConclusion()
                    )
            );

        }


        Map<Integer,PlBeliefSet> map = new HashMap<Integer,PlBeliefSet>();
        map.put(0,materialKb);
        System.out.println("material kn "+map.get(0));

        do{
            System.out.println("i "+i);
            PlBeliefSet tmp = new PlBeliefSet();
                for(PlFormula imp: map.get(i)){
                    PlFormula alpha = ((Implication)imp).getFirstFormula();
                    System.out.println("alpha "+ alpha);
                    PlFormula negAlpha = new Negation(alpha);




                if (reasoner.query(map.get(i), negAlpha)) {
                    tmp.add(imp);
                }

                }
                map.put(i+1,tmp);
            tmp = new PlBeliefSet();
            for(PlFormula imp: map.get(i)){
                if(!map.get(i+1).contains(imp)){
                    tmp.add(imp);
                }

            }
            res.add(tmp);


            System.out.println("res in loop "+res);


            i++;
            System.out.println("map i "+map.get(i));
            System.out.println("map i+1 "+map.get(i-1));
        }while(!map.get(i).equals(map.get(i-1)));
        res.add(map.get(i-1));
        System.out.println("res out loop "+res);

        if(map.get(i-1).equals(new PlBeliefSet())){
            res.remove(res.size()-1);
        }


        return res;
    }


    public static void main(String[] args){
        SatSolver.setDefaultSolver(new Sat4jSolver());
        Proposition g = new Proposition("g");
        Proposition l = new Proposition("l");
        Proposition e = new Proposition("e");
        Proposition a = new Proposition("a");

        //Implication imp = new Implication(b,f);

        Conditional c1 = new Conditional(a,e);
        Conditional c4 = new Conditional(g,a);
        Conditional c2 = new Conditional(g,l);
        Conditional c3 = new Conditional(a,new Negation(l));
        PlFormula i5 = new Implication(g,a);

        ClBeliefSet bs = new ClBeliefSet();
        bs.add(c1);
        bs.add(c2);
        bs.add(c3);
        bs.add(c4);


        System.out.println("c4"+c4);
        Iterator<Conditional> it = bs.iterator();

        System.out.println("baserank "+BaseRank(bs));
        while(it.hasNext()) {
            System.out.println( it.next().getPremise());
        }
        System.out.println("bs"+bs);

        ZReasoner reasoner = new ZReasoner();
        // CReasoner reasoner2 = new CReasoner();

        System.out.println(reasoner.getModel(bs));
        //System.out.println(reasoner2.getModel(bs));

        // Get the model
        RankingFunction ocf = reasoner.getModel(bs);
        // RankingFunction ocf2 = reasoner2.getModel(bs);

        System.out.println("reasoner " + reasoner.query(bs,new Implication(g,l)));

        System.out.println("Garfield eat lasange:        " +
                ocf.satisfies(new Conditional(g,l)));         // true

        System.out.println("animal eat lasanga:     " +
                ocf.satisfies(new Conditional(a,l)));          // false

        System.out.println("garfield not lasanfa:   " +
                ocf.satisfies(new Conditional(
                        g,new Negation(l))));                      // true

        System.out.println("g have eyes: " +
                ocf.satisfies(new Conditional(g,e)));          // true



        System.out.println("rank g "+ ocf.rank(g));

        //    p-> f       : not p and f
    }
}

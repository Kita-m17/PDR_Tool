package com.pdr.models;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author SteveW
 */
public class HittingSetTree 
{
    private List<Node> nodes;
    private Node rootNode;
    
    public HittingSetTree(Node rootNode)
    {
        this.rootNode = rootNode;
        this.nodes = new ArrayList<Node>();
    }
    
    public void addNode(Node node)
    {
        this.nodes.add(node);
    }
    
    
    
}

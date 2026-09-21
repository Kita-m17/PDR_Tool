/**
 * File: HomeController.jaba
 * Original Author: Liam De Saldanha (2026 Honours Project, University of Cape Town)
 */

package com.pdr.controllers;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

//controller for receiving web traffic
@Controller 
public class HomeController {

    @Value("${spring.application.name}")
    private String appName;

    @RequestMapping("/")
    public String index(){
        System.out.print("appName:" + appName);
        return "index.html";
    }
}

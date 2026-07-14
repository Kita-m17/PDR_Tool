package com.pdr.controllers;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

//controller for receiving web traffic
@Controller 
public class HomeController {

    @RequestMapping("/")
    public String index(){
        return "index.html";
    }
}

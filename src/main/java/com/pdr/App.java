package com.pdr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.pdr.controllers", "com.pdr.services", "com.pdr.utils"})
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
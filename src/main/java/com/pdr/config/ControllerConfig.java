package com.pdr.config;

import com.pdr.services.JustificationService;
import com.pdr.services.JustificationUsingPowersetImpl;
import com.pdr.services.KnowledgeBaseService;
import com.pdr.services.KnowledgeBaseServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ControllerConfig {


    @Bean
    public JustificationService justificationService(){
        return new JustificationUsingPowersetImpl();
    }

}

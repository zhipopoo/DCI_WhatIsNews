package com.whatisnews;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WhatIsNewsApplication {

    public static void main(String[] args) {
        SpringApplication.run(WhatIsNewsApplication.class, args);
    }
}

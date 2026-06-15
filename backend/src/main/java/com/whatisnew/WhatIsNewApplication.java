package com.whatisnew;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WhatIsNewApplication {

    public static void main(String[] args) {
        SpringApplication.run(WhatIsNewApplication.class, args);
    }
}

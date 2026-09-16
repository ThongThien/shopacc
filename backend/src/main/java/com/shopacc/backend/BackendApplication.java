package com.shopacc.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}

// @SpringBootApplication là annotation chính để khởi động Spring Boot, bao gồm
// component scanning và auto-configuration.
// @EnableScheduling dùng để enable cơ
// chế scheduling của Spring, để các method có @Scheduled được chạy tự động theo
// thời gian cấu hình.

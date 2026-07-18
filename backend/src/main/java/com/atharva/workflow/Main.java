package com.atharva.workflow;

import com.atharva.workflow.entity.Metadata;
import com.atharva.workflow.entity.WorkflowEntity;
import com.atharva.workflow.repository.WorkflowRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
class Main {
    public static void main(String args[]) {
        SpringApplication.run(Main.class);
    }
    @Bean
    public CommandLineRunner testWorkflowSave(WorkflowRepository repository){
        return args -> {
            System.out.println("\n=== 🚀 INITIALIZING FIRST WORKFLOW SAVE ROUTINE ===");

            // 1. Instantiating the flattened embedded metadata layer
            Metadata flowMeta = new Metadata();
            flowMeta.setName("Order Processing Pipeline");
            flowMeta.setVersion(1);
            flowMeta.setDescription("Triggers validation actions and payment verification loops.");

            // 2. Creating the parent database row mapper
            WorkflowEntity newFlow = new WorkflowEntity();
            newFlow.setMetadata(flowMeta); // Stored nicely inside the wrapper variable

            // 3. Executing the database operation
            System.out.println("💾 Saving new entity schema into local PostgreSQL workflows table...");
            WorkflowEntity savedFlow = repository.save(newFlow);

            System.out.println("✅ Database operation successful!");
            System.out.println("Generated Target Row UUID: " + savedFlow.getId());
            System.out.println("=== 🏁 SAVE ROUTINE COMPLETE ===\n");
        };
    }
}

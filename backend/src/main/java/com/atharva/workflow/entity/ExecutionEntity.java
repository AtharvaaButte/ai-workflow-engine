package com.atharva.workflow.entity;

import com.atharva.workflow.model.ExecutionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workflow_executions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExecutionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID workflowId;

    private String workflowName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long durationMs;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<NodeExecutionLogEntity> nodeLogs = new ArrayList<>();

    public enum ExecutionStatus {
        PENDING, RUNNING, SUCCESS, FAILED
    }
}

package com.atharva.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "node_execution_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeExecutionLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    private ExecutionEntity execution;

    @Column(nullable = false)
    private String nodeId;

    private String nodeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NodeStatus status;


    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private Long durationMs;
    private LocalDateTime executedAt;

    public enum NodeStatus {
        SUCCESS, FAILED, SKIPPED
    }
}
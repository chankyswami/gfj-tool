package com.iavtar.gfj_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "final_quotation")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class FinalQuotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mapped_quotation_id")
    private String mappedQuotationId;

    private String finalQuotationId;

    private String description;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String data;

    @Column
    private BigDecimal price;

    @Column
    private Long agentId;

    @Column
    private Long clientId;

    @Column
    private String quotationStatus;

    @Column
    private String imageUrl;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String shippingId;

    private String trackingId;

}
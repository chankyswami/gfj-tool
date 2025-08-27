package com.iavtar.gfj_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "client")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String clientName;

    @Column
    private String businessLogoUrl;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String businessAddress;

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    @Column
    private String city;

    @Column(length = 50)
    private String state;

    @Column(length = 50)
    private String country;

    @Column(length = 20)
    private String zipCode;

    @Column(length = 50)
    private String einNumber;

    @Column(length = 50)
    private String taxId;

    @Column
    private BigDecimal diamondSettingPrice;

    @Column
    private BigDecimal goldWastagePercentage;

    @Column
    private BigDecimal profitAndLabourPercentage;

    @Column
    private BigDecimal cadCamWaxPrice;

    @Column
    private Long agentId;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
package com.iavtar.gfj_be.model.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateFinalQuotationRequest {

    private String finalQuotationId;

    private String description;

    private String data;

    private BigDecimal price;

    private Long agentId;

    private String quotationStatus;

    private String imageUrl;

    private String trackingId;

}

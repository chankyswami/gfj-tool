package com.iavtar.gfj_be.model.response;

import com.iavtar.gfj_be.entity.Client;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientResponse {
    private Long id;
    private String clientName;
    private String businessLogoUrl;
    private String email;
    private String phoneNumber;
    private String businessAddress;
    private String shippingAddress;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String einNumber;
    private String taxId;
    private BigDecimal diamondSettingPrice;
    private BigDecimal goldWastagePercentage;
    private BigDecimal profitAndLabourPercentage;
    private BigDecimal cadCamWaxPrice;
    private Long agentId;
    private String agentName;

    public static ClientResponse from(Client client) {
        return ClientResponse.builder().id(client.getId()).clientName(client.getClientName()).businessLogoUrl(client.getBusinessLogoUrl())
                .email(client.getEmail()).phoneNumber(client.getPhoneNumber()).businessAddress(client.getBusinessAddress())
                .shippingAddress(client.getShippingAddress()).city(client.getCity()).state(client.getState()).country(client.getCountry())
                .zipCode(client.getZipCode()).einNumber(client.getEinNumber()).taxId(client.getTaxId())
                .diamondSettingPrice(client.getDiamondSettingPrice()).goldWastagePercentage(client.getGoldWastagePercentage())
                .profitAndLabourPercentage(client.getProfitAndLabourPercentage()).cadCamWaxPrice(client.getCadCamWaxPrice())
                .agentId(client.getAgentId()).agentName(null) // Will be set separately
                .build();
    }
}

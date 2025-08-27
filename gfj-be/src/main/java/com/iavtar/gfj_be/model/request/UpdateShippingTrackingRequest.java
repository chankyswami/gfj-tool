package com.iavtar.gfj_be.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateShippingTrackingRequest {

    private String shippingId;

    private String status;

}

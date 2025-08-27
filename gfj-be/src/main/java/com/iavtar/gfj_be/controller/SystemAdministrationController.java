package com.iavtar.gfj_be.controller;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.model.request.AppUserRequest;
import com.iavtar.gfj_be.model.response.PagedUserResponse;
import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.service.SystemAdministrationService;
import com.iavtar.gfj_be.utility.CommonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/systemAdministration")
public class SystemAdministrationController {

    @Autowired
    private SystemAdministrationService appUserService;

    @Autowired
    private CommonUtil commonUtil;

    @PostMapping("/user")
    public ResponseEntity<?> createBusinessAdmin(@RequestBody AppUserRequest request) {
        try {
            log.info("Creating new business admin with username: {}", request.getUsername());
            if (commonUtil.existsByUsername(request.getUsername())) {
                log.error("Validation failed - username already exists: {}", request.getUsername());
                ServiceResponse errorResponse = ServiceResponse.builder().message("username already exists").build();
                return ResponseEntity.internalServerError().body(errorResponse);
            }
            if (commonUtil.existsByEmail(request.getEmail())) {
                log.error("Validation failed - email already exists: {}", request.getEmail());
                ServiceResponse errorResponse = ServiceResponse.builder().message("email already exists").build();
                return ResponseEntity.internalServerError().body(errorResponse);
            }
            if (commonUtil.existsByPhoneNumber(request.getPhoneNumber())) {
                log.error("Validation failed - phone number already exists: {}", request.getPhoneNumber());
                ServiceResponse errorResponse = ServiceResponse.builder().message("Phone Number already exists").build();
                return ResponseEntity.internalServerError().body(errorResponse);
            }
            // Create the business admin user
            appUserService.createBusinessAdmin(request.getUsername(), request.getFirstName(), request.getLastName(), request.getPassword(),
                    request.getEmail(), request.getPhoneNumber());
            ServiceResponse response = ServiceResponse.builder().message("Business Admin Created Successfully").build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error creating business admin: ").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getUser")
    public ResponseEntity<?> getUser(@RequestParam("username") String username) {
        try {
            AppUser appUser = appUserService.getBusinessAdmin(username);
            return ResponseEntity.ok(appUser);
        } catch (Exception e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting : " + username).build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getAllUser")
    public ResponseEntity<?> getAllUser(@RequestParam(defaultValue = "0") int offset, @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        try {
            PagedUserResponse<AppUser> response = appUserService.getBusinessAdmins(offset, size, sortBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting all BusinessAdmin").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

}

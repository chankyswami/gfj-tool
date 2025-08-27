package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.entity.DashboardTab;
import com.iavtar.gfj_be.entity.Role;
import com.iavtar.gfj_be.model.request.SignInRequest;
import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.model.response.SignInResponse;
import com.iavtar.gfj_be.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Override
    public ResponseEntity<?> signIn(SignInRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            if (authentication.isAuthenticated()) {
                Optional<AppUser> appUser = userRepository.findByUsername(request.getUsername());
                if (appUser.get().getIsActive()) {
                    Set<String> userRoles = new HashSet<>();
                    for (Role role : appUser.get().getRoles()) {
                        userRoles.add(role.getName().getValue());
                    }
                    Set<String> userDashboards = new HashSet<>();
                    for (DashboardTab dashboard : appUser.get().getDashboardTabs()) {
                        userDashboards.add(dashboard.getName().getValue());
                    }
                    return new ResponseEntity<>(SignInResponse.builder().id(appUser.get().getId()).username(appUser.get().getUsername())
                            .name(appUser.get().getFirstName() + " " + appUser.get().getLastName()).email(appUser.get().getEmail())
                            .phoneNumber(appUser.get().getPhoneNumber()).roles(userRoles).dashboardTabs(userDashboards)
                            .token(jwtService.generateToken(appUser)).build(), HttpStatus.OK);
                } else {
                    return new ResponseEntity<>(ServiceResponse.builder().message("Account Locked Please Contact Admin!").build(), HttpStatus.FORBIDDEN);
                }
            } else {
                return new ResponseEntity<>(ServiceResponse.builder().message("Invalid Credentials!").build(), HttpStatus.OK);
            }
        } catch (Exception exception) {
            throw new RuntimeException(exception.getMessage());
        }
    }

}

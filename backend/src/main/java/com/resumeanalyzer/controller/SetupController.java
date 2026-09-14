package com.resumeanalyzer.controller;

import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.enums.Role;
import com.resumeanalyzer.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SetupController — one-time setup endpoint.
 *
 * POST /api/setup/create-admin
 * Creates the default admin account if it doesn't already exist.
 * This endpoint is PUBLIC (no JWT needed) so you can call it from
 * a browser or Postman before any user exists.
 *
 * After first use, the endpoint becomes harmless — it won't
 * create duplicates or overwrite existing accounts.
 */
@RestController
@RequestMapping("/setup")
public class SetupController {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public SetupController(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * POST /api/setup/create-admin
     *
     * Optional JSON body (all fields have defaults):
     * {
     *   "fullName": "Admin",
     *   "email":    "admin@resumeanalyzer.com",
     *   "password": "Admin@1234"
     * }
     */
    @PostMapping("/create-admin")
    public ResponseEntity<Map<String, String>> createAdmin(
            @RequestBody(required = false) Map<String, String> body) {

        String fullName = getValue(body, "fullName", "Admin");
        String email    = getValue(body, "email",    "admin@resumeanalyzer.com");
        String password = getValue(body, "password", "Admin@1234");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.ok(Map.of(
                "status",  "skipped",
                "message", "Admin account already exists with email: " + email,
                "email",   email
            ));
        }

        User admin = new User();
        admin.setFullName(fullName);
        admin.setEmail(email.toLowerCase().trim());
        admin.setPassword(passwordEncoder.encode(password));
        admin.getRoles().add(Role.ROLE_USER);
        admin.getRoles().add(Role.ROLE_ADMIN);

        userRepository.save(admin);

        return ResponseEntity.ok(Map.of(
            "status",   "created",
            "message",  "Admin account created successfully!",
            "email",    email,
            "password", password,
            "note",     "Login at http://localhost:5173/login with these credentials"
        ));
    }

    /**
     * POST /api/setup/make-admin
     * Promotes an existing user to ROLE_ADMIN by email.
     *
     * Body: { "email": "existing@user.com" }
     */
    @PostMapping("/make-admin")
    public ResponseEntity<Map<String, String>> makeAdmin(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required."));
        }

        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No user found with email: " + email));
        }

        if (user.getRoles().contains(Role.ROLE_ADMIN)) {
            return ResponseEntity.ok(Map.of(
                "status",  "skipped",
                "message", user.getFullName() + " is already an admin."
            ));
        }

        user.getRoles().add(Role.ROLE_ADMIN);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "status",  "updated",
            "message", user.getFullName() + " has been promoted to admin!",
            "email",   user.getEmail()
        ));
    }

    private String getValue(Map<String, String> map, String key, String defaultVal) {
        if (map == null) return defaultVal;
        String val = map.get(key);
        return (val != null && !val.isBlank()) ? val : defaultVal;
    }
}

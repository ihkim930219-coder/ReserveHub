
package com.reservehub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(

        @NotBlank
        @Size(min = 4, max = 20)
        String username,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 8)
        String password

) {}

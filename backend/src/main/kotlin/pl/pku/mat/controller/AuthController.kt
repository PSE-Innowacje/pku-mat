package pl.pku.mat.controller

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import pl.pku.mat.dto.LoginRequest
import pl.pku.mat.dto.UserResponse
import pl.pku.mat.repository.RoleRepository
import pl.pku.mat.repository.UserRepository

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authenticationManager: AuthenticationManager,
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository
) {

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest, httpRequest: HttpServletRequest): ResponseEntity<UserResponse> {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.username, request.password)
        )

        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        SecurityContextHolder.setContext(context)
        httpRequest.session.setAttribute("SPRING_SECURITY_CONTEXT", context)

        return ResponseEntity.ok(buildUserResponse(request.username))
    }

    @GetMapping("/me")
    fun me(): ResponseEntity<UserResponse> {
        val authentication = SecurityContextHolder.getContext().authentication
            ?: return ResponseEntity.status(401).build()

        val username = authentication.name
        return ResponseEntity.ok(buildUserResponse(username))
    }

    private fun buildUserResponse(username: String): UserResponse {
        val user = userRepository.findByUsername(username)
            ?: throw NoSuchElementException("User not found: $username")
        val role = roleRepository.findById(user.roleId)
            .orElseThrow { NoSuchElementException("Role not found") }

        return UserResponse(
            id = user.id!!,
            username = user.username,
            displayName = user.displayName,
            role = role.name
        )
    }
}

package pl.pku.mat.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pl.pku.mat.dto.DashboardResponse
import pl.pku.mat.repository.UserRepository
import pl.pku.mat.service.DeclarationService

@RestController
@RequestMapping("/api")
class DashboardController(
    private val declarationService: DeclarationService,
    private val userRepository: UserRepository
) {

    @GetMapping("/dashboard")
    fun getDashboard(): ResponseEntity<DashboardResponse> {
        val userId = getCurrentUserId()
        return ResponseEntity.ok(declarationService.getDashboard(userId))
    }

    private fun getCurrentUserId(): Long {
        val username = SecurityContextHolder.getContext().authentication.name
        val user = userRepository.findByUsername(username)
            ?: throw NoSuchElementException("Nie znaleziono uzytkownika")
        return user.id!!
    }
}

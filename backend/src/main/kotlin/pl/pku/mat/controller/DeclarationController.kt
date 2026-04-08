package pl.pku.mat.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import pl.pku.mat.dto.DeclarationFormTemplate
import pl.pku.mat.dto.DeclarationResponse
import pl.pku.mat.dto.DeclarationSubmitRequest
import pl.pku.mat.repository.UserRepository
import pl.pku.mat.service.DeclarationService

@RestController
@RequestMapping("/api/declarations")
class DeclarationController(
    private val declarationService: DeclarationService,
    private val userRepository: UserRepository
) {

    @GetMapping
    fun listDeclarations(): ResponseEntity<List<DeclarationResponse>> {
        val userId = getCurrentUserId()
        return ResponseEntity.ok(declarationService.getDeclarations(userId))
    }

    @GetMapping("/by-period/{billingPeriodId}")
    fun getDeclarationsByBillingPeriod(@PathVariable billingPeriodId: Long): ResponseEntity<List<DeclarationResponse>> {
        val userId = getCurrentUserId()
        return ResponseEntity.ok(declarationService.getDeclarationsByBillingPeriod(userId, billingPeriodId))
    }

    @GetMapping("/{id}")
    fun getDeclaration(@PathVariable id: Long): ResponseEntity<DeclarationResponse> {
        val userId = getCurrentUserId()
        return ResponseEntity.ok(declarationService.getDeclaration(userId, id))
    }

    @GetMapping("/form")
    fun getFormTemplate(
        @RequestParam feeType: String,
        @RequestParam billingPeriodId: Long
    ): ResponseEntity<DeclarationFormTemplate> {
        val userId = getCurrentUserId()
        return ResponseEntity.ok(declarationService.getFormTemplate(userId, feeType, billingPeriodId))
    }

    @PostMapping
    fun submitDeclaration(@RequestBody request: DeclarationSubmitRequest): ResponseEntity<DeclarationResponse> {
        val userId = getCurrentUserId()
        return ResponseEntity.ok(declarationService.submitDeclaration(userId, request))
    }

    private fun getCurrentUserId(): Long {
        val username = SecurityContextHolder.getContext().authentication.name
        val user = userRepository.findByUsername(username)
            ?: throw NoSuchElementException("Nie znaleziono uzytkownika")
        return user.id!!
    }
}

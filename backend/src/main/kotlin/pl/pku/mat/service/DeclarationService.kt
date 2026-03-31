package pl.pku.mat.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pl.pku.mat.config.FormFieldDefinitions
import pl.pku.mat.dto.*
import pl.pku.mat.entity.DeclarationEntity
import pl.pku.mat.entity.DeclarationItemEntity
import pl.pku.mat.repository.*
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate

@Service
class DeclarationService(
    private val userRepository: UserRepository,
    private val contractorRepository: ContractorRepository,
    private val contractorTypeRepository: ContractorTypeRepository,
    private val contractorFeeTypeRepository: ContractorFeeTypeRepository,
    private val feeTypeRepository: FeeTypeRepository,
    private val declarationRepository: DeclarationRepository,
    private val declarationItemRepository: DeclarationItemRepository,
    private val numberGenerator: DeclarationNumberGenerator,
    private val jsonExportService: JsonExportService
) {

    fun getDashboard(userId: Long): DashboardResponse {
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta dla uzytkownika")
        val contractorType = contractorTypeRepository.findById(contractor.contractorTypeId)
            .orElseThrow { NoSuchElementException("Nie znaleziono typu kontrahenta") }

        val feeTypeMappings = contractorFeeTypeRepository.findByContractorId(contractor.id!!)
        val now = LocalDate.now()
        val year = now.year
        val month = now.monthValue

        val feeDeclarations = feeTypeMappings.map { mapping ->
            val feeType = feeTypeRepository.findById(mapping.feeTypeId)
                .orElseThrow { NoSuchElementException("Nie znaleziono typu oplaty") }

            val latestDeclaration = declarationRepository.findLatestVersion(
                contractor.id, feeType.id!!, year, month
            )

            FeeDeclarationStatus(
                feeTypeCode = feeType.code,
                feeTypeName = feeType.name,
                status = latestDeclaration?.status ?: "NIE_ZLOZONE",
                declarationId = latestDeclaration?.id,
                declarationNumber = latestDeclaration?.declarationNumber
            )
        }

        return DashboardResponse(
            contractorName = contractor.fullName,
            contractorType = contractorType.code,
            year = year,
            month = month,
            feeDeclarations = feeDeclarations
        )
    }

    fun getFormTemplate(userId: Long, feeTypeCode: String): DeclarationFormTemplate {
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta")
        val contractorType = contractorTypeRepository.findById(contractor.contractorTypeId)
            .orElseThrow { NoSuchElementException("Nie znaleziono typu kontrahenta") }
        val feeType = feeTypeRepository.findByCode(feeTypeCode)
            ?: throw NoSuchElementException("Nie znaleziono typu oplaty: $feeTypeCode")

        val fields = FormFieldDefinitions.getFields(feeType.code, contractorType.code)

        return DeclarationFormTemplate(
            feeTypeCode = feeType.code,
            feeTypeName = feeType.name,
            contractorTypeCode = contractorType.code,
            fields = fields,
            commentAllowed = FormFieldDefinitions.isCommentAllowed(feeType.code, contractorType.code)
        )
    }

    @Transactional
    fun submitDeclaration(userId: Long, request: DeclarationSubmitRequest): DeclarationResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { NoSuchElementException("Nie znaleziono uzytkownika") }
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta")
        val contractorType = contractorTypeRepository.findById(contractor.contractorTypeId)
            .orElseThrow { NoSuchElementException("Nie znaleziono typu kontrahenta") }
        val feeType = feeTypeRepository.findByCode(request.feeTypeCode)
            ?: throw NoSuchElementException("Nie znaleziono typu oplaty: ${request.feeTypeCode}")

        // Validate fields
        val allowedFields = FormFieldDefinitions.getFields(feeType.code, contractorType.code)
        val allowedCodes = allowedFields.map { it.code }.toSet()
        val unknownFields = request.items.keys - allowedCodes
        require(unknownFields.isEmpty()) { "Nieznane pola: $unknownFields" }

        val requiredCodes = allowedFields.filter { it.required }.map { it.code }.toSet()
        val missingFields = requiredCodes - request.items.keys
        require(missingFields.isEmpty()) { "Brakujace wymagane pola: $missingFields" }

        // Validate comment length
        request.comment?.let {
            require(it.length <= 1000) { "Komentarz nie moze przekraczac 1000 znakow" }
        }

        // Determine version
        val latestVersion = declarationRepository.findLatestVersion(
            contractor.id!!, feeType.id!!, request.year, request.month
        )
        val newVersion = (latestVersion?.version ?: 0) + 1

        val declarationNumber = numberGenerator.generate(
            feeType.code, contractor.shortName, request.year, request.month, request.subPeriod, newVersion
        )

        val now = Instant.now()
        val declaration = declarationRepository.save(
            DeclarationEntity(
                declarationNumber = declarationNumber,
                contractorId = contractor.id,
                feeTypeId = feeType.id,
                year = request.year,
                month = request.month,
                subPeriod = request.subPeriod,
                version = newVersion,
                status = "ZLOZONE",
                remarks = request.comment,
                createdAt = now,
                submittedAt = now,
                createdBy = userId
            )
        )

        // Save items
        request.items.forEach { (code, value) ->
            declarationItemRepository.save(
                DeclarationItemEntity(
                    declarationId = declaration.id!!,
                    fieldCode = code,
                    fieldValue = value
                )
            )
        }

        val response = buildDeclarationResponse(declaration, feeType.code, feeType.name, contractor.fullName, user.displayName)

        // Export to JSON
        val jsonPath = jsonExportService.export(response)
        declarationRepository.save(declaration.copy(jsonFilePath = jsonPath))

        return response
    }

    fun getDeclaration(userId: Long, declarationId: Long): DeclarationResponse {
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta")
        val declaration = declarationRepository.findById(declarationId)
            .orElseThrow { NoSuchElementException("Nie znaleziono oswiadczenia") }

        require(declaration.contractorId == contractor.id) { "Brak dostepu do tego oswiadczenia" }

        val feeType = feeTypeRepository.findById(declaration.feeTypeId)
            .orElseThrow { NoSuchElementException("Nie znaleziono typu oplaty") }
        val createdByUser = userRepository.findById(declaration.createdBy)
            .orElseThrow { NoSuchElementException("Nie znaleziono uzytkownika") }

        return buildDeclarationResponse(declaration, feeType.code, feeType.name, contractor.fullName, createdByUser.displayName)
    }

    fun getDeclarations(userId: Long): List<DeclarationResponse> {
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta")
        val user = userRepository.findById(userId)
            .orElseThrow { NoSuchElementException("Nie znaleziono uzytkownika") }

        return declarationRepository.findByContractorId(contractor.id!!).map { declaration ->
            val feeType = feeTypeRepository.findById(declaration.feeTypeId)
                .orElseThrow { NoSuchElementException("Nie znaleziono typu oplaty") }
            buildDeclarationResponse(declaration, feeType.code, feeType.name, contractor.fullName, user.displayName)
        }
    }

    private fun buildDeclarationResponse(
        declaration: DeclarationEntity,
        feeTypeCode: String,
        feeTypeName: String,
        contractorName: String,
        createdByName: String
    ): DeclarationResponse {
        val items = declarationItemRepository.findByDeclarationId(declaration.id!!)
            .associate { it.fieldCode to (it.fieldValue ?: BigDecimal.ZERO) }

        return DeclarationResponse(
            id = declaration.id,
            declarationNumber = declaration.declarationNumber,
            status = declaration.status,
            feeTypeCode = feeTypeCode,
            feeTypeName = feeTypeName,
            contractorName = contractorName,
            year = declaration.year,
            month = declaration.month,
            version = declaration.version,
            items = items,
            comment = declaration.remarks,
            submittedAt = declaration.submittedAt,
            createdBy = createdByName
        )
    }
}

package pl.pku.mat.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
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
    private val billingPeriodRepository: BillingPeriodRepository,
    private val billingPeriodTemplateRepository: BillingPeriodTemplateRepository,
    private val formTemplateRepository: FormTemplateRepository,
    private val numberGenerator: DeclarationNumberGenerator,
    private val jsonExportService: JsonExportService
) {

    private val objectMapper = jacksonObjectMapper()

    fun getDashboard(userId: Long): DashboardResponse {
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta dla uzytkownika")
        val contractorType = contractorTypeRepository.findById(contractor.contractorTypeId)
            .orElseThrow { NoSuchElementException("Nie znaleziono typu kontrahenta") }

        val feeTypeMappings = contractorFeeTypeRepository.findByContractorId(contractor.id!!)

        val periodDeclarations = feeTypeMappings.flatMap { mapping ->
            val feeType = feeTypeRepository.findById(mapping.feeTypeId)
                .orElseThrow { NoSuchElementException("Nie znaleziono typu oplaty") }

            val periods = billingPeriodRepository.findByFeeTypeId(feeType.id!!)

            periods.map { period ->
                val latestDeclaration = declarationRepository.findLatestByBillingPeriod(
                    contractor.id, period.id!!
                )

                PeriodDeclarationStatus(
                    billingPeriodId = period.id,
                    feeTypeCode = feeType.code,
                    feeTypeName = feeType.name,
                    subPeriod = period.subPeriod,
                    startDate = period.startDate,
                    endDate = period.endDate,
                    submissionDeadline = period.submissionDeadline,
                    status = latestDeclaration?.status ?: "NIE_ZLOZONE",
                    declarationId = latestDeclaration?.id,
                    declarationNumber = latestDeclaration?.declarationNumber
                )
            }
        }

        return DashboardResponse(
            contractorName = contractor.fullName,
            contractorType = contractorType.code,
            periodDeclarations = periodDeclarations
        )
    }

    fun getFormTemplate(userId: Long, feeTypeCode: String, billingPeriodId: Long): DeclarationFormTemplate {
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta")
        val contractorType = contractorTypeRepository.findById(contractor.contractorTypeId)
            .orElseThrow { NoSuchElementException("Nie znaleziono typu kontrahenta") }
        val feeType = feeTypeRepository.findByCode(feeTypeCode)
            ?: throw NoSuchElementException("Nie znaleziono typu oplaty: $feeTypeCode")

        val resolved = resolveTemplate(billingPeriodId, contractorType.id!!, feeType.id!!, contractorType.code)

        return DeclarationFormTemplate(
            feeTypeCode = feeType.code,
            feeTypeName = feeType.name,
            contractorTypeCode = contractorType.code,
            templateVersionName = resolved.first,
            fields = resolved.second,
            commentAllowed = true
        )
    }

    private fun resolveTemplate(
        billingPeriodId: Long,
        contractorTypeId: Long,
        feeTypeId: Long,
        contractorTypeCode: String
    ): Pair<String, List<FormFieldDef>> {
        val bpTemplate = billingPeriodTemplateRepository
            .findByBillingPeriodIdAndContractorTypeId(billingPeriodId, contractorTypeId)

        if (bpTemplate != null) {
            val template = formTemplateRepository.findById(bpTemplate.formTemplateId)
                .orElseThrow { NoSuchElementException("Nie znaleziono szablonu formularza") }
            val fields: List<FormFieldDef> = objectMapper.readValue(template.fieldsJson)
            return template.versionName to fields
        }

        // Fallback: use latest template for this fee type + contractor type
        val templates = formTemplateRepository
            .findByFeeTypeIdAndContractorTypeId(feeTypeId, contractorTypeId)
        if (templates.isNotEmpty()) {
            val latest = templates.maxByOrNull { it.versionNumber }!!
            val fields: List<FormFieldDef> = objectMapper.readValue(latest.fieldsJson)
            return latest.versionName to fields
        }

        throw NoSuchElementException("Brak szablonu formularza dla typu oplaty i kontrahenta ($contractorTypeCode)")
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
        val billingPeriod = billingPeriodRepository.findById(request.billingPeriodId)
            .orElseThrow { NoSuchElementException("Nie znaleziono okresu rozliczeniowego: ${request.billingPeriodId}") }

        require(billingPeriod.feeTypeId == feeType.id) {
            "Okres rozliczeniowy nie odpowiada typowi oplaty"
        }

        // Resolve template from DB
        val (templateVersionName, allowedFields) = resolveTemplate(
            request.billingPeriodId, contractorType.id!!, feeType.id!!, contractorType.code
        )

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

        // Determine version and correction mode
        val latestDeclaration = declarationRepository.findLatestByBillingPeriod(
            contractor.id!!, billingPeriod.id!!
        )
        val newVersion = (latestDeclaration?.version ?: 0) + 1
        val isCorrection = LocalDate.now().isAfter(billingPeriod.submissionDeadline)

        val declarationNumber = numberGenerator.generate(
            feeType.code, contractor.shortName,
            billingPeriod.year, billingPeriod.month, billingPeriod.subPeriod,
            newVersion, correction = isCorrection
        )

        val now = Instant.now()
        val declaration = declarationRepository.save(
            DeclarationEntity(
                declarationNumber = declarationNumber,
                contractorId = contractor.id,
                feeTypeId = feeType.id,
                year = billingPeriod.year,
                month = billingPeriod.month,
                subPeriod = billingPeriod.subPeriod,
                version = newVersion,
                status = "ZLOZONE",
                remarks = request.comment,
                createdAt = now,
                submittedAt = now,
                createdBy = userId,
                billingPeriodId = billingPeriod.id,
                formTemplateVersionName = templateVersionName
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

        // Save JSON content to database
        val jsonContent = jsonExportService.serialize(response)
        declarationRepository.save(declaration.copy(jsonContent = jsonContent))

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
        val contractorType = contractorTypeRepository.findById(contractor.contractorTypeId)
            .orElseThrow { NoSuchElementException("Nie znaleziono typu kontrahenta") }

        val fields = declaration.billingPeriodId?.let { bpId ->
            try {
                resolveTemplate(bpId, contractorType.id!!, feeType.id!!, contractorType.code).second
            } catch (_: Exception) { null }
        }

        return buildDeclarationResponse(declaration, feeType.code, feeType.name, contractor.fullName, createdByUser.displayName, fields)
    }

    fun getDeclarationsByBillingPeriod(userId: Long, billingPeriodId: Long): List<DeclarationResponse> {
        val contractor = contractorRepository.findByUserId(userId)
            ?: throw NoSuchElementException("Nie znaleziono kontrahenta")

        return declarationRepository.findAllByBillingPeriod(contractor.id!!, billingPeriodId).map { declaration ->
            val feeType = feeTypeRepository.findById(declaration.feeTypeId)
                .orElseThrow { NoSuchElementException("Nie znaleziono typu oplaty") }
            val createdByUser = userRepository.findById(declaration.createdBy)
                .orElseThrow { NoSuchElementException("Nie znaleziono uzytkownika") }
            buildDeclarationResponse(declaration, feeType.code, feeType.name, contractor.fullName, createdByUser.displayName)
        }
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
        createdByName: String,
        fields: List<FormFieldDef>? = null
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
            createdBy = createdByName,
            templateVersionName = declaration.formTemplateVersionName,
            fields = fields
        )
    }
}

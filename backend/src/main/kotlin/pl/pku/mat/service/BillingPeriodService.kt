package pl.pku.mat.service

import org.springframework.stereotype.Service
import pl.pku.mat.dto.BillingPeriodResponse
import pl.pku.mat.entity.BillingPeriodEntity
import pl.pku.mat.repository.BillingPeriodRepository
import pl.pku.mat.repository.FeeTypeRepository

@Service
class BillingPeriodService(
    private val billingPeriodRepository: BillingPeriodRepository,
    private val feeTypeRepository: FeeTypeRepository
) {

    fun getByFeeTypeAndYear(feeTypeCode: String, year: Int): List<BillingPeriodResponse> {
        val feeType = feeTypeRepository.findByCode(feeTypeCode)
            ?: throw NoSuchElementException("Nie znaleziono typu oplaty: $feeTypeCode")
        return billingPeriodRepository.findByFeeTypeIdAndYear(feeType.id!!, year)
            .map { toResponse(it, feeType.code, feeType.name) }
    }

    fun getByFeeTypeAndYearAndMonth(feeTypeCode: String, year: Int, month: Int): List<BillingPeriodResponse> {
        val feeType = feeTypeRepository.findByCode(feeTypeCode)
            ?: throw NoSuchElementException("Nie znaleziono typu oplaty: $feeTypeCode")
        return billingPeriodRepository.findByFeeTypeIdAndYearAndMonth(feeType.id!!, year, month)
            .map { toResponse(it, feeType.code, feeType.name) }
    }

    private fun toResponse(entity: BillingPeriodEntity, feeTypeCode: String, feeTypeName: String) =
        BillingPeriodResponse(
            id = entity.id!!,
            feeTypeCode = feeTypeCode,
            feeTypeName = feeTypeName,
            year = entity.year,
            month = entity.month,
            subPeriod = entity.subPeriod,
            startDate = entity.startDate,
            endDate = entity.endDate,
            submissionDeadline = entity.submissionDeadline
        )
}

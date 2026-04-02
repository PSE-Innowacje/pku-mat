package pl.pku.mat.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.pku.mat.dto.BillingPeriodResponse
import pl.pku.mat.service.BillingPeriodService

@RestController
@RequestMapping("/api/billing-periods")
class BillingPeriodController(
    private val billingPeriodService: BillingPeriodService
) {

    @GetMapping
    fun getBillingPeriods(
        @RequestParam feeType: String,
        @RequestParam year: Int,
        @RequestParam(required = false) month: Int?
    ): ResponseEntity<List<BillingPeriodResponse>> {
        val periods = if (month != null) {
            billingPeriodService.getByFeeTypeAndYearAndMonth(feeType, year, month)
        } else {
            billingPeriodService.getByFeeTypeAndYear(feeType, year)
        }
        return ResponseEntity.ok(periods)
    }
}

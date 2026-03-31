package pl.pku.mat.service

import org.springframework.stereotype.Component

@Component
class DeclarationNumberGenerator {

    fun generate(
        feeTypeCode: String,
        contractorShortName: String,
        year: Int,
        month: Int,
        subPeriod: Int,
        version: Int
    ): String {
        val monthStr = month.toString().padStart(2, '0')
        val subPeriodStr = subPeriod.toString().padStart(2, '0')
        val versionStr = version.toString().padStart(2, '0')
        return "OSW/$feeTypeCode/$contractorShortName/$year/$monthStr/$subPeriodStr/$versionStr"
    }
}
